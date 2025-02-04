# Key Server

The Key Server is a crucial component of the ChainShare ecosystem, responsible for managing encryption keys and facilitating secure document sharing. It serves as an intermediary between the frontend application and the Hedera blockchain, ensuring secure key distribution while maintaining document ownership controls.

## Overview

The Key Server provides a FastAPI-based REST service that:
- Manages encryption keys for document chunks
- Handles secure key storage using DuckDB
- Interacts with Hedera smart contracts for key verification
- Ensures proper access control for document sharing

## Features

- Secure key storage and management
- Document-level and chunk-level key handling
- Smart contract integration for on-chain key verification
- Background task processing for blockchain interactions
- CORS support for frontend integration

## Prerequisites

- Python 3.10 or higher
- DuckDB 0.9+
- Hedera testnet account
- Web3.py
- FastAPI and Uvicorn

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```
KEY_SERVER_PUBLIC_KEY=your_public_key
KEY_CONTRACT_ADDRESS=your_contract_address
RELAY_ENDPOINT=your_hedera_endpoint
OPERATOR_PRIVATE_KEY=your_operator_key
KEY_SERVER_SECRET=your_server_secret
```

## API Endpoints

### POST /upload-keys
Upload encryption keys for document chunks.

Request body:
```json
{
    "chunkIds": ["chunk1", "chunk2"],
    "encryptionKeys": ["key1", "key2"],
    "documentId": "doc1",
    "documentKey": "docKey1",
    "publicKey": "pubKey1"
}
```

### POST /get-keys/
Retrieve encryption keys for specific chunks.

Request body:
```json
{
    "chunk_ids": ["chunk1", "chunk2"],
    "whole_document": false
}
```

### POST /get-keys-for-document
Retrieve document-level encryption key.

Request body:
```json
{
    "document_id": "doc1",
    "key_server_secret": "server_secret"
}
```

## Smart Contract Integration

The key server integrates with Hedera smart contracts through two main functions:

1. `get_chunk_key_request()`: Retrieves authorized chunk key requests from the blockchain
2. `publish_chunk_keys()`: Publishes chunk keys to the blockchain after verification

## Development

Start the development server:
```bash
python key_server.py
```

The server will run on `http://localhost:8001` by default.

## Integration with ChainShare

This key server is part of the larger ChainShare ecosystem. It works in conjunction with:
- Frontend application for user interactions
- RAG server for document processing
- Smart contracts for access control
- Backend API for system coordination

## Security Considerations

- Keep the KEY_SERVER_SECRET secure and never expose it
- Regularly rotate operator keys
- Monitor smart contract interactions for unusual patterns
- Implement rate limiting for production deployments