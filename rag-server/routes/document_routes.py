from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from models import DocumentUpload, DeleteDocumentRequest
import os
import base64
import requests
from utils.helpers import decrypt_pdf_file, decrypt
from utils.hedera_interactions import request_chunk_keys, rateKeyOwners
from utils.auth import verify_rag_server_secret
from state import SharedState

router = APIRouter()

@router.post("/upload")
async def upload_document(document: DocumentUpload):
    try:
        verify_rag_server_secret(document.ragServerSecret)

        ids = [chunk.id for chunk in document.chunks]
        embeddings = [chunk.embedding for chunk in document.chunks]

        if SharedState.conn.execute("SELECT * FROM documents WHERE document_name = ?", [document.documentTitle]).fetchone():
            raise HTTPException(status_code=409, detail="Document with that name already exists")
        
        SharedState.collection.add(
            ids=ids,
            embeddings=embeddings,
        )

        pdf_path = os.path.join(SharedState.PDF_STORAGE_PATH, f"{document.documentId}.raw")
        with open(pdf_path, "wb") as f:
            encrypted_bytes = base64.b64decode(document.encryptedDocument)
            f.write(encrypted_bytes)
        
        for chunk in document.chunks:
            SharedState.conn.execute("""
                INSERT OR REPLACE INTO chunks 
                (chunk_id, document_id, content, encrypted, reward, public_key, key_server_public_key)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                chunk.id, 
                document.documentId, 
                chunk.encrypted_content, 
                True, 
                0.0, 
                document.publicKey,
                document.keyServerPublicKey
            ))
        SharedState.conn.execute("""
                INSERT OR REPLACE INTO documents 
                (document_id, document_name, encrypted)
                VALUES (?, ?, ?)
            """, (
                document.documentId,
                document.documentTitle,
                True
            ))
            
        return {"message": f"Successfully uploaded {len(document.chunks)} chunks"}
    except Exception as e:
        print(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_document_pdf")
async def get_document_pdf(documentId: str, ragServerSecret: str):
    try:
        verify_rag_server_secret(ragServerSecret)
        
        pdf_path = os.path.join(SharedState.PDF_STORAGE_PATH, f"{documentId}.pdf")
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        return FileResponse(pdf_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_document_price")
async def get_document_price(documentId: str, ragServerSecret: str):
    try:
        verify_rag_server_secret(ragServerSecret)
        
        chunk_count = SharedState.conn.execute(
            "SELECT COUNT(*) FROM chunks WHERE document_id = ?", 
            [documentId]
        ).fetchone()[0]

        document_name = SharedState.conn.execute(
            "SELECT document_name FROM documents WHERE document_id = ?", 
            [documentId]
        ).fetchone()[0]
        
        if chunk_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
            
        price = chunk_count * 2
        
        return {
            "document_id": documentId,
            "chunk_count": chunk_count,
            "price": price,
            "document_name": document_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_documents")
async def get_documents(ragServerSecret: str, publicKey: str):
    try:
        verify_rag_server_secret(ragServerSecret)
        result = SharedState.conn.execute("""
            WITH document_stats AS (
                SELECT
                    c.document_id,
                    COUNT(*) as total_chunks,
                    SUM(CASE WHEN c.encrypted THEN 1 ELSE 0 END) as encrypted_chunks,
                    SUM(c.reward) as total_reward
                FROM chunks c
                WHERE c.public_key = ?
                GROUP BY c.document_id
            ),
            document_ratings AS (
                SELECT
                    c.document_id,
                    COALESCE(SUM(CASE WHEN r.rating > 0 THEN 1 ELSE 0 END), 0) as upvotes,
                    COALESCE(SUM(CASE WHEN r.rating < 0 THEN 1 ELSE 0 END), 0) as downvotes,
                    COALESCE(SUM(r.rating), 0) as total_rating
                FROM chunks c
                LEFT JOIN ratings r ON c.chunk_id = r.chunk_id
                GROUP BY c.document_id
            )
            SELECT
                d.document_id,
                d.document_name,
                ds.total_chunks,
                ds.encrypted_chunks,
                ds.total_reward,
                COALESCE(dr.total_rating, 0) as rating,
                COALESCE(dr.upvotes, 0) as upvotes,
                COALESCE(dr.downvotes, 0) as downvotes
            FROM documents d
            JOIN document_stats ds ON d.document_id = ds.document_id
            LEFT JOIN document_ratings dr ON d.document_id = dr.document_id
        """, [publicKey]).fetchall()

        documents = [
            {
                "document_id": row[0],
                "name": row[1],
                "encrypted_percentage": (row[3] / row[2]) * 100 if row[2] > 0 else 0,
                "total_reward": row[4],
                "rating": row[5],
                "upvotes": row[6],     
                "downvotes": row[7]
            }
            for row in result
        ]
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delete_document")
async def delete_document(request: DeleteDocumentRequest):
    try:
        verify_rag_server_secret(request.ragServerSecret)
            
        doc_result = SharedState.conn.execute("""
            SELECT document_id
            FROM documents 
            WHERE document_name = ?
        """, [request.documentName]).fetchone()
        
        if not doc_result:
            raise HTTPException(status_code=404, detail="Document not found")
            
        document_id = doc_result[0]
        pdf_path = os.path.join(SharedState.PDF_STORAGE_PATH, f"{document_id}.raw")
        
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        chunk_ids = SharedState.conn.execute("""
            SELECT chunk_id
            FROM chunks
            WHERE public_key = ? AND document_id = ?
        """, [request.publicKey, document_id]).fetchall()
        
        chunk_ids = [row[0] for row in chunk_ids]
        
        if chunk_ids:
            SharedState.collection.delete(ids=chunk_ids)
        
        SharedState.conn.execute("""
            DELETE FROM chunks
            WHERE document_id = ?
        """, [document_id])
        
        SharedState.conn.execute("""
            DELETE FROM documents
            WHERE document_id = ?
        """, [document_id])
        
        return {"message": f"Successfully deleted document: {request.documentName}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/buy-document")
async def buy_document(ragServerSecret: str, documentId: str):
    verify_rag_server_secret(ragServerSecret)
    
    try:
        chunk_count = SharedState.conn.execute(
            "SELECT COUNT(*) FROM chunks WHERE document_id = ?", 
            [documentId]
        ).fetchone()[0]

        document_name = SharedState.conn.execute(
            "SELECT document_name FROM documents WHERE document_id = ?", 
            [documentId]
        ).fetchone()[0]
        
        if chunk_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document_encrypted = SharedState.conn.execute("SELECT encrypted FROM documents WHERE document_id = ?", [documentId]).fetchone()[0]
        if document_encrypted:
            secret_key = requests.post(f"{SharedState.KEY_SERVER_API}/get-keys-for-document", json={"key_server_secret": SharedState.KEY_SERVER_SECRET, "document_id": documentId}).json()
            with open(os.path.join("documents", f"{documentId}.raw"), "rb") as encrypted_file:
                encrypted_data = encrypted_file.read()

            decrypted_data = decrypt_pdf_file(encrypted_data, secret_key)

            with open(os.path.join("documents", f"{documentId}.pdf"), "wb") as decrypted_file:
                decrypted_file.write(decrypted_data)
            print(f"Successfully bought document: {documentId}")
            
        price = chunk_count * 2
        chunk_price = price / chunk_count

        chunks = SharedState.conn.execute("""
            SELECT chunk_id, content, public_key
            FROM chunks
            WHERE document_id = ? AND encrypted = TRUE
        """, [documentId]).fetchall()

        encrypted_chunk_ids = [row[0] for row in chunks]

        if encrypted_chunk_ids:
            response = requests.post(f"{SharedState.KEY_SERVER_API}/get-keys/", json={"chunk_ids": encrypted_chunk_ids, "whole_document": True})

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            keys = response.json()
        else:
            keys = []
        
        for chunk in chunks:
            chunk_id = chunk[0]
            secret_key = [key["secret_key"] for key in keys if key["chunk_id"] == chunk_id][0]
            decrypted_content = decrypt(chunk[1], secret_key)

            SharedState.conn.execute("""
                UPDATE chunks
                SET content = ?, encrypted = FALSE
                WHERE chunk_id = ?
            """, (decrypted_content, chunk_id))

        SharedState.conn.execute("""
            UPDATE chunks
                SET reward = reward + ?
                WHERE document_id = ?
            """, (chunk_price, documentId))
        
        return {
            "document_id": documentId,
            "chunk_count": chunk_count,
            "price": price,
            "document_name": document_name,
            "public_key": chunks[0][2] if chunks else None
        }
    except Exception as e:
        print(f"Error processing buy document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))