from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import duckdb
import uvicorn
import os
from dotenv import load_dotenv
from hedera_interactions import get_chunk_key_request, publish_chunk_keys
import time
load_dotenv()

KEY_SERVER_SECRET = os.getenv('KEY_SERVER_SECRET')

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DuckDB
db = duckdb.connect('keyserver.db')

# Create table if it doesn't exist. The public_key will be the one that receives the rewards from the RAG server.
db.execute("""
    CREATE TABLE IF NOT EXISTS keys (
        chunk_id VARCHAR,
        document_id VARCHAR,
        secret_key VARCHAR,
        public_key VARCHAR
    )
""")

#print keys database
print(db.execute("SELECT * FROM keys WHERE document_id NOT NULL").fetchall())

class KeyUploadRequest(BaseModel):
    chunkIds: List[str]
    encryptionKeys: List[str]
    documentId: str
    documentKey: str
    publicKey: str

class KeyResponse(BaseModel):
    chunk_id: str
    secret_key: str
    public_key: str

class ChunkIdsRequest(BaseModel):
    chunk_ids: List[str]
    whole_document: bool

class DocumentIdRequest(BaseModel):
    document_id: str
    key_server_secret: str

@app.post("/upload-keys")
async def upload_keys(request: KeyUploadRequest):
    if len(request.chunkIds) != len(request.encryptionKeys):
        raise HTTPException(status_code=400, detail="Mismatch between document IDs and encryption keys")

    try:
        for chunk_id, secret_key in zip(request.chunkIds, request.encryptionKeys):
            db.execute("""
                INSERT INTO keys (chunk_id, document_id, secret_key, public_key)
                VALUES (?, ?, ?, ?)
            """, (chunk_id,None, secret_key, request.publicKey))
        db.execute("""
                INSERT INTO keys (chunk_id, document_id, secret_key, public_key)
                VALUES (?, ?, ?, ?)
            """, (None, request.documentId, request.documentKey, request.publicKey))
        
        return {"message": "Keys uploaded successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-keys/", response_model=List[KeyResponse])
async def get_keys(request: ChunkIdsRequest, background_tasks: BackgroundTasks):
    try:
        onChain_chunk_ids = get_chunk_key_request()
        chunk_ids = request.chunk_ids
        
        if(not request.whole_document and onChain_chunk_ids != chunk_ids):
            raise HTTPException(status_code=400, detail="Mismatch between requested chunk ids and on-chain chunk ids")
            
        query = f"SELECT chunk_id, secret_key, public_key FROM keys WHERE chunk_id IN ({','.join(['?'] * len(chunk_ids))})"
        results = db.execute(query, chunk_ids).fetchall()
        
        if not results:
            raise HTTPException(status_code=404, detail="No matching document IDs found")
            
        # Move response creation before background task
        response = [KeyResponse(chunk_id=row[0], secret_key=row[1], public_key=row[2]) for row in results]
        
        if not request.whole_document:
            background_tasks.add_task(
                publish_chunk_keys,
                [row[0] for row in results],
                [row[1] for row in results],
                [row[2] for row in results]
            )
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Get keys for a document id
@app.post("/get-keys-for-document")
async def get_keys_for_document(request: DocumentIdRequest):
    if request.key_server_secret != KEY_SERVER_SECRET:
        raise HTTPException(status_code=401, detail="Invalid key server secret")
    results = db.execute("SELECT secret_key FROM keys WHERE document_id = ?", [request.document_id]).fetchall()
    return results[0][0]

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("key_server:app", host="0.0.0.0", port=port, workers=1)