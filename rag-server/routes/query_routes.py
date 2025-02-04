from fastapi import APIRouter, HTTPException, BackgroundTasks
from models import QueryRequest
import requests
from utils.helpers import decrypt
from utils.hedera_interactions import request_chunk_keys, rateKeyOwners
from state import SharedState

router = APIRouter()

@router.post("/query")
async def query_document(request: QueryRequest, background_tasks: BackgroundTasks):
    try:
        if request.ragServerSecret != SharedState.RAG_SERVER_SECRET:
            raise HTTPException(status_code=401, detail="RAG Authentication failed")
        
        results = SharedState.collection.query(
            query_embeddings=[request.query_embedding],
            n_results=request.n_results,
            include=["metadatas", "distances"]
        )

        chunk_ids = results['ids'][0]

        duckdb_results = SharedState.conn.execute("""
                SELECT 
                    c.chunk_id, 
                    c.document_id, 
                    d.document_name,
                    c.content, 
                    c.encrypted, 
                    c.reward, 
                    c.public_key, 
                    c.key_server_public_key
                FROM 
                    chunks c
                JOIN 
                    documents d 
                ON 
                    c.document_id = d.document_id
                WHERE 
                    c.chunk_id IN (SELECT * FROM UNNEST(?))
            """, [chunk_ids]).fetchall()

        encrypted_chunk_ids = [chunk[0] for chunk in duckdb_results if chunk[4]]

        print("Encrypted chunk ids:", encrypted_chunk_ids)
        print("Key server public key:", duckdb_results[0][7])
        
        distances = [results["distances"][0][i] for i, id in enumerate(results["ids"][0]) if id in encrypted_chunk_ids]
        prices = [round(float(SharedState.MAX_CHUNK_PRICE) / (distances[i] + 1)) for i in range(len(distances))]

        print("Prices:", prices)

        if encrypted_chunk_ids:
            await request_chunk_keys(encrypted_chunk_ids, prices, duckdb_results[0][7])

            response = requests.post(f"{SharedState.KEY_SERVER_API}/get-keys/", 
                                  json={"chunk_ids": encrypted_chunk_ids, "whole_document": False})

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            keys = response.json()
        else:
            keys = []

        key_owners = []
        ratings = []
        decrypted_chunks = []
        for chunk in duckdb_results:
            chunk_id = chunk[0]
            if chunk[4]:  # Check if the chunk is encrypted
                secret_key = [key["secret_key"] for key in keys if key["chunk_id"] == chunk_id][0]
                try:
                    decrypted_content = decrypt(chunk[3], secret_key)
                    key_owners.append(chunk[6])
                    ratings.append(True)
                except Exception as e:
                    print(f"Error decrypting chunk {chunk_id}: {str(e)}")
                    key_owners.append(chunk[6])
                    ratings.append(False)

                # Update the database with decrypted content and set encrypted to False
                SharedState.conn.execute("""
                    UPDATE chunks
                    SET content = ?, encrypted = FALSE
                    WHERE chunk_id = ?
                """, (decrypted_content, chunk_id))
            else:
                decrypted_content = chunk[3]  # No decryption needed for unencrypted content

            distance = [results["distances"][0][i] for i, id in enumerate(results["ids"][0]) if id == chunk_id][0]
            decrypted_chunks.append({
                "chunk_id": chunk_id,
                "document_id": chunk[1],
                "document_name": chunk[2],
                "content": decrypted_content,
                "content_preview": decrypted_content[:100],
                "encrypted": chunk[4],
                "reward": chunk[5],
                "public_key": chunk[6],
                "key_server_public_key": chunk[7],
                "distance": distance
            })

        decrypted_chunks.sort(key=lambda x: x["distance"])

        chunk_ids_owned = SharedState.conn.execute("""
            SELECT chunk_id
            FROM chunks
            WHERE public_key = ?
        """, [request.publicKey]).fetchall()

        chunk_ids_owned = [row[0] for row in chunk_ids_owned]

        print("Chunk ids owned:", chunk_ids_owned, "Decrypted chunks:", decrypted_chunks)

        if encrypted_chunk_ids:
            background_tasks.add_task(rateKeyOwners, key_owners, ratings)

        return {"chunks": decrypted_chunks, "chunk_ids_owned": chunk_ids_owned}
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))