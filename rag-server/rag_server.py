import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import chromadb
import uvicorn
from models import init_database
import state

# Import the route modules
from routes.document_routes import router as document_router
from routes.chunk_routes import router as chunk_router
from routes.rating_routes import router as rating_router
from routes.query_routes import router as query_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize shared state
state.SharedState.CHROMA_PATH = os.getenv('CHROMA_PATH', 'chroma')
state.SharedState.COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'rag')
state.SharedState.RAG_SERVER_SECRET = os.getenv('RAG_SERVER_SECRET')
state.SharedState.KEY_SERVER_SECRET = os.getenv('KEY_SERVER_SECRET')
state.SharedState.PDF_STORAGE_PATH = os.getenv('PDF_STORAGE_PATH', 'documents')
state.SharedState.KEY_SERVER_API = os.getenv('KEY_SERVER_API', 'http://localhost:8001')
state.SharedState.MAX_CHUNK_PRICE = float(os.getenv('MAX_CHUNK_PRICE', 5))

# Ensure directories exist
os.makedirs(state.SharedState.CHROMA_PATH, exist_ok=True)
os.makedirs(state.SharedState.PDF_STORAGE_PATH, exist_ok=True)

# Initialize database connections
chroma_client = chromadb.PersistentClient(path=state.SharedState.CHROMA_PATH)
state.SharedState.collection = chroma_client.get_or_create_collection(name=state.SharedState.COLLECTION_NAME)
state.SharedState.conn = init_database()

# CORS configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(document_router, prefix="", tags=["documents"])
app.include_router(chunk_router, prefix="", tags=["chunks"])
app.include_router(rating_router, prefix="", tags=["ratings"])
app.include_router(query_router, prefix="", tags=["query"])

# Base route for health check
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "RAG Server is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("rag_server:app", host="0.0.0.0", port=port, workers=1)