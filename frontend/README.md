# ChainShare Frontend

This repository contains the React-based web application for ChainShare, implementing the user interface for secure document sharing and AI-powered knowledge access.

## Features

- **Secure Document Management**
  - Client-side PDF chunking and encryption
  - Intelligent document processing with TensorFlow.js
  - Real-time progress tracking for uploads

- **AI Chat Interface**
  - Interactive conversations with context-aware responses
  - Document reference tracking and rating system
  - Token-based access control

- **Token Economy**
  - MetaMask integration for HBAR transactions
  - Real-time token balance monitoring
  - Transaction history visualization

- **Document Marketplace**
  - Purchase and access management
  - Rating and reputation system
  - Chunk-level content preview

## Technology Stack

- **Core Framework**: React 18 with Vite
- **UI Components**: Material-UI (MUI) v6
- **State Management**: Context API
- **Charts & Visualization**: Recharts
- **ML Processing**: TensorFlow.js
- **Blockchain Integration**: Hedera SDK, ethers.js
- **PDF Processing**: pdf.js
- **Styling**: Tailwind CSS (core utilities only)

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── chat/          # Chat interface components
│   ├── documents/     # Document management
│   ├── token/         # Token management
│   └── upload/        # Document upload
├── context/           # React Context providers
├── services/          # API and blockchain services
│   ├── api/          # REST API clients
│   └── tfService.js  # TensorFlow.js wrapper
├── styles/           # Global styles and theme
└── pages/            # Main application views
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MetaMask wallet with Hedera testnet configuration
- Access to ChainShare backend services

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Update the following variables in `.env`:
```
VITE_API_URL=your_backend_url
VITE_KEY_SERVER_URL=your_keyserver_url
VITE_TOKEN_ADDRESS=your_token_contract_address
```

3. Start development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Architecture

### Client-Side Processing

Document processing happens entirely client-side to ensure privacy:

1. PDF Chunking: Documents are split into semantic chunks
2. Embedding Generation: TensorFlow.js generates embeddings
3. Encryption: Each chunk is encrypted with AES-256
4. Key Management: Encryption keys are managed through smart contracts

### Security Considerations

- All document processing occurs client-side
- Content remains encrypted until legitimately purchased
- MetaMask handles all blockchain transactions
- No private keys are ever transmitted

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please ensure your code follows the existing style conventions and includes appropriate tests.

## Performance Optimization

The application includes several optimizations:

- Code splitting with React.lazy
- Service worker for caching
- WebAssembly for PDF processing
- Efficient embedding caching
- Optimized TensorFlow.js operations

## Known Limitations

- Maximum file size: 100MB
- Supported formats: PDF only
- Browser compatibility: Modern browsers only
- MetaMask required for all operations

## Troubleshooting

Common issues and solutions:

1. **MetaMask Connection Issues**
   - Ensure Hedera testnet is properly configured
   - Check HBAR balance for transactions

2. **Upload Failures**
   - Verify file size and format
   - Check browser console for errors
   - Ensure sufficient memory for processing

3. **Performance Issues**
   - Clear browser cache
   - Check system memory usage
   - Disable unnecessary browser extensions