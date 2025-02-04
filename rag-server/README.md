# RAG Server

The RAG Server is a crucial component of the ChainShare ecosystem, implementing the Retrieval-Augmented Generation (RAG) pipeline for secure and ownership-aware document processing. It manages document chunks, embeddings, and integrates with the blockchain-based access control system.

## Overview

The RAG Server provides the following key functionalities:
- Secure document storage and chunking
- Vector similarity search using ChromaDB
- Integration with Hedera smart contracts for access control
- Document encryption/decryption management
- Rating system for document chunks
- DuckDB-based metadata storage

## Architecture

The server is built using FastAPI and consists of several key components:

- `rag_server.py`: Main server application
- `models.py`: Pydantic models for data validation
- `routes/`: API endpoint implementations
  - `document_routes.py`: Document management endpoints
  - `chunk_routes.py`: Chunk-level operations
  - `query_routes.py`: Vector similarity search
  - `rating_routes.py`: Rating system implementation
- `utils/`: Helper functions and utilities
  - `auth.py`: Authentication middleware
  - `helpers.py`: Encryption/decryption utilities
  - `hedera_interactions.py`: Smart contract interactions

## Prerequisites

- Python 3.10 or higher
- DuckDB
- ChromaDB
- Node.js (for Hedera SDK)
- Access to Hedera testnet

## Installation

1. Clone the repository and navigate to the RAG server directory:
```bash
cd rag-server
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
- `RAG_SERVER_SECRET`: Secret key for server authentication
- `KEY_SERVER_SECRET`: Secret key for key server communication
- `KEY_SERVER_API`: URL of the key management service
- `DUCKDB_PATH`: Path to DuckDB database file
- `CHROMA_PATH`: Path to ChromaDB storage
- `PDF_STORAGE_PATH`: Path for document storage
- `OPERATOR_PRIVATE_KEY`: Hedera account private key
- `KEY_CONTRACT_ADDRESS`: Smart contract address
- `RELAY_ENDPOINT`: Hedera network endpoint

## API Endpoints

### Document Management
- `POST /upload`: Upload new document with chunks
- `GET /get_document_pdf`: Retrieve document PDF
- `GET /get_document_price`: Get document pricing
- `GET /get_documents`: List available documents
- `POST /delete_document`: Remove document

### Chunk Operations
- `GET /get_chunk`: Retrieve specific chunk
- `POST /buy-chunks`: Purchase access to chunks

### Query Interface
- `POST /query`: Perform similarity search

### Rating System
- `POST /rate-chunk-id`: Rate document chunks
- `GET /get_document_ratings`: Get document ratings
- `GET /get_document_rating/{document_id}`: Get specific document rating

## Security

The server implements several security measures:
- Client-side encryption of document chunks
- Server-side authentication using `RAG_SERVER_SECRET`
- Secure integration with Hedera smart contracts
- Encrypted storage of sensitive data

## Citation

If you use this component in your research, please cite the ChainShare project:

```bibtex
@mastersthesis{nievelstein2024blockchain,
    title={Blockchain-based ecosystem for fair and ownership-preserving document-sharing in {LLM} use cases},
    author={Nievelstein, Sascha, and Wolfgang, Prinz and Rose, Thomas},
    year={2025},
    school={RWTH Aachen University},
    address={Aachen, Germany},
    type={Master's Thesis},
    month={February}
}
```