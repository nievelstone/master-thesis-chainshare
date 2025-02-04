from fastapi import HTTPException
import os

def verify_rag_server_secret(secret: str):
    """Verify the RAG server secret provided in the request."""
    if secret != os.getenv('RAG_SERVER_SECRET'):
        raise HTTPException(status_code=401, detail="RAG Authentication failed")