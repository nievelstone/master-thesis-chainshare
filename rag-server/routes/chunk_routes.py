from fastapi import APIRouter, HTTPException
from models import BuyChunksRequest
from utils.auth import verify_rag_server_secret
from state import SharedState

router = APIRouter()

@router.get("/get_chunk")
async def get_chunk(chunkId: str, ragServerSecret: str):
    try:
        verify_rag_server_secret(ragServerSecret)
        
        chunk = SharedState.conn.execute("SELECT * FROM chunks WHERE chunk_id = ?", [chunkId]).fetchone()
        if not chunk:
            raise HTTPException(status_code=404, detail="Chunk not found")
        return {
            "chunk_id": chunk[0],
            "document_id": chunk[1],
            "content": chunk[2],
            "encrypted": chunk[3],
            "reward": chunk[4],
            "public_key": chunk[5],
            "key_server_public_key": chunk[6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/buy-chunks")
async def buy_chunks(request: BuyChunksRequest):
    verify_rag_server_secret(request.ragServerSecret)
    
    try:
        for i, chunk_id in enumerate(request.chunkIds):
            SharedState.conn.execute("""
                UPDATE chunks
                SET reward = reward + ?
                WHERE chunk_id = ?
            """, (request.prices[i], chunk_id))

        return {"message": "Successfully bought chunks"}
    except Exception as e:
        print(f"Error processing buy chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))