# ChainShare Backend

This repository contains the Node.js backend server for ChainShare, a blockchain-based ecosystem for privacy-preserving and ownership-aware document sharing in LLM applications. The backend serves as the central API server, managing user authentication, document processing, chat functionality, and transaction handling.

## Architecture

The backend is built using Express.js and integrates with multiple services:
- DuckDB for local data storage
- Azure OpenAI for chat completions
- Hedera blockchain for transaction processing
- External RAG server for document processing and retrieval
- Key server for encryption management

## Features

- User authentication with JWT and Ethereum wallet signatures
- Real-time chat functionality with Azure OpenAI integration
- Document purchase and ownership management
- Chunk-level access control and pricing
- Transaction history and balance management
- Rating system for document chunks
- Integration with Hedera blockchain for payments

## Prerequisites

- Node.js >= 18
- DuckDB >= 0.9
- Hedera testnet account
- Azure OpenAI API access
- MetaMask wallet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nievelstone/master-thesis-chainshare.git
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_OPENAI_VERSION=
AZURE_OPENAI_DEPLOYMENT_NAME=

# Hedera
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_LONG_PRIVATE_KEY=
TOKEN_CONTRACT_ID=

# RAG Server
RAG_SERVER_SECRET=
RAG_SERVER_API=

# JWT
JWT_SECRET_KEY=

# Pricing
BASE_FEE=
MAX_CHUNK_PRICE=
```

## Database Schema

The backend uses DuckDB with the following tables:

- `users`: User accounts and token balances
- `conversations`: Chat conversations
- `messages`: Chat messages
- `transactions`: Payment history
- `purchases`: Document and chunk ownership records

## API Endpoints

### Authentication
- `POST /api/login`: Authenticate user with wallet signature
- `POST /api/verify-token`: Verify JWT token
- `GET /api/user-info`: Get user information

### Chat
- `GET /api/conversations`: List user conversations
- `POST /api/conversations`: Create new conversation
- `GET /api/conversations/:id/messages`: Get conversation messages
- `POST /api/messages`: Add message to conversation
- `POST /api/chat`: Process chat completion with Azure OpenAI

### Documents
- `POST /api/upload`: Upload new document
- `GET /api/get_documents`: List available documents
- `GET /api/get_chunk`: Retrieve document chunk
- `GET /api/get_document_pdf`: Download document PDF

### Purchases
- `POST /api/get_document_price`: Get document price
- `POST /api/buy_document`: Purchase document
- `GET /api/user-purchases`: List user purchases

### Ratings
- `POST /api/rate-chunk-id`: Rate document chunk
- `GET /api/document-ratings`: Get document ratings
- `POST /api/get-chunk-ratings`: Get chunk ratings

### Transactions
- `GET /api/user-transactions`: Get transaction history
- `GET /api/hbar-conversion`: Convert HBAR to tokens
- `POST /api/withdraw-request`: Withdraw tokens to HBAR

## Development

Start the development server:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## Testing

```bash
npm test
```

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the terms specified in the root repository.

## Acknowledgments

This backend is part of the ChainShare project, developed as part of a master's thesis at RWTH Aachen University in cooperation with Fraunhofer FIT.