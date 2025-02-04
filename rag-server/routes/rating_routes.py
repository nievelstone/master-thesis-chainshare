from fastapi import APIRouter, HTTPException
from models import ChunkRating, ChunkRatingsRequest
import time
from utils.auth import verify_rag_server_secret
from state import SharedState

router = APIRouter()

@router.post("/rate-chunk-id")
async def rate_chunk_id(request: ChunkRating):
    try:
        verify_rag_server_secret(request.ragServerSecret)
        
        #If user with public key has already rated chunk, update the rating otherwise insert
        if SharedState.conn.execute("SELECT * FROM ratings WHERE chunk_id = ? AND public_key = ?", [request.chunkId, request.publicKey]).fetchone():
            SharedState.conn.execute("""
                UPDATE ratings
                SET rating = ?
                WHERE chunk_id = ? AND public_key = ?
            """, (request.rating, request.chunkId, request.publicKey))
        else:
            SharedState.conn.execute("""
                INSERT INTO ratings
                (rating_id, public_key, chunk_id, rating)
                VALUES (?, ?, ?, ?)
            """, (str(time.time()), request.publicKey, request.chunkId, request.rating))



        return {"message": "Successfully rated chunk"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_document_ratings")
async def get_document_ratings(ragServerSecret: str):
    verify_rag_server_secret(ragServerSecret)
    
    try:
        # Get all ratings grouped by document
        ratings = SharedState.conn.execute("""
            WITH chunk_ratings AS (
                SELECT 
                    c.document_id,
                    SUM(r.rating) as total_rating
                FROM chunks c
                LEFT JOIN ratings r ON c.chunk_id = r.chunk_id
                GROUP BY c.document_id
            )
            SELECT 
                d.document_id,
                d.document_name,
                COALESCE(cr.total_rating, 0) as rating
            FROM documents d
            LEFT JOIN chunk_ratings cr ON d.document_id = cr.document_id
        """).fetchall()
        
        return {
            "ratings": [
                {
                    "document_id": row[0],
                    "document_name": row[1],
                    "rating": row[2]
                }
                for row in ratings
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 


@router.get("/get_document_rating/{document_id}")
async def get_document_rating(document_id: str, ragServerSecret: str):
    verify_rag_server_secret(ragServerSecret)
    
    try:
        rating = SharedState.conn.execute("""
            SELECT COALESCE(SUM(r.rating), 0) as total_rating
            FROM chunks c
            LEFT JOIN ratings r ON c.chunk_id = r.chunk_id
            WHERE c.document_id = ?
            GROUP BY c.document_id
        """, [document_id]).fetchone()
        
        return {"rating": rating[0] if rating else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/get-chunk-ratings")
async def get_chunk_ratings(request: ChunkRatingsRequest):
    try:
        verify_rag_server_secret(request.ragServerSecret)
            
        if not request.chunkIds or not request.publicKey:
            raise HTTPException(status_code=400, detail="Missing required parameters")

        # Query the ratings for the given chunks and user
        ratings_data = {}
        for chunk_id in request.chunkIds:
            rating = SharedState.conn.execute("""
                SELECT rating 
                FROM ratings 
                WHERE chunk_id = ? AND public_key = ?
            """, (chunk_id, request.publicKey)).fetchone()
            
            if rating:
                ratings_data[chunk_id] = rating[0]
        
        return {"ratings": ratings_data}
    except Exception as e:
        print(f"Error getting chunk ratings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))