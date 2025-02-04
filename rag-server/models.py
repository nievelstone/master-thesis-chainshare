from pydantic import BaseModel
from typing import List
import duckdb
import os
from dotenv import load_dotenv

load_dotenv()

DUCKDB_PATH = os.getenv('DUCKDB_PATH', 'rag.db')

class DocumentChunk(BaseModel):
    id: str
    embedding: List[float]
    encrypted_content: str

class DocumentUpload(BaseModel):
    chunks: List[DocumentChunk]
    publicKey: str
    documentId: str
    documentTitle: str
    keyServerPublicKey: str
    ragServerSecret: str
    encryptedDocument: str

class DeleteDocumentRequest(BaseModel):
    ragServerSecret: str
    publicKey: str
    documentName: str

class QueryRequest(BaseModel):
    ragServerSecret: str
    query_embedding: List[float]
    publicKey: str
    n_results: int = 2

class BuyChunksRequest(BaseModel):
    ragServerSecret: str
    chunkIds: List[str]
    prices: List[float]

class ChunkRating(BaseModel):
    ragServerSecret: str
    publicKey: str
    chunkId: str
    rating: int

class ChunkRatingsRequest(BaseModel):
    ragServerSecret: str
    chunkIds: List[str]
    publicKey: str

def init_database():
    """Initialize the database connection and create tables if they don't exist."""
    conn = duckdb.connect(DUCKDB_PATH)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            chunk_id VARCHAR PRIMARY KEY,
            document_id VARCHAR,
            content VARCHAR,
            encrypted BOOLEAN,
            reward FLOAT,
            public_key VARCHAR NOT NULL,
            key_server_public_key VARCHAR NOT NULL
        );
        CREATE TABLE IF NOT EXISTS documents (
            document_id VARCHAR PRIMARY KEY,
            document_name VARCHAR NOT NULL,
            encrypted BOOLEAN
        );
        CREATE TABLE IF NOT EXISTS ratings (
            rating_id VARCHAR PRIMARY KEY,
            public_key VARCHAR NOT NULL,
            chunk_id VARCHAR NOT NULL,
            rating INTEGER NOT NULL DEFAULT 0
        );
    """)
    
    return conn
