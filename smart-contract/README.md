# ChainShare Smart Contracts

This repository contains the smart contract implementations for the ChainShare ecosystem, a blockchain-based solution for privacy-preserving and ownership-aware document sharing in LLM applications. The contracts are deployed on the Hedera network and manage the key distribution and reward mechanism for document sharing.

## Smart Contract Architecture

The repository implements two main contracts:

- `KeyContract`: Manages the distribution of encryption keys and handles the reputation-based reward system
- `ChainShareToken`: ERC20 token implementation for the reward mechanism

### KeyContract Features

- Request and publish chunk encryption keys
- Reputation-based reward distribution system
- Key owner rating mechanism
- Token deposit and withdrawal management

## Prerequisites

- Node.js >= 18
- Hardhat development environment
- Hedera testnet account
- MetaMask wallet

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
LOCAL_ENDPOINT="http://localhost:7546"
LOCAL_PRIVATE_KEY="your_local_private_key"
TESTNET_ENDPOINT="your_hashio_testnet_endpoint"
TESTNET_PRIVATE_KEY="your_testnet_private_key"
```

## Contract Details

### KeyContract

The KeyContract manages the distribution of encryption keys for document chunks and implements a reputation-based reward system. Key features include:

- **Chunk Key Management**: Maps chunk IDs to their corresponding encryption keys
- **Request Handling**: Tracks requested chunks per key server
- **Reputation System**: Maintains key owner ratings and reputation scores
- **Token Integration**: Handles ERC20 token deposits and withdrawals for rewards

### Security Considerations

- The contract implements access control through the `isOwner` modifier
- Key publication requires verification against requested chunk IDs
- Reputation scores affect reward distribution
- Token transfers are protected by OpenZeppelin's ERC20 implementation

## Integration with ChainShare

These smart contracts form part of the larger ChainShare ecosystem:

- **Frontend**: Interacts with contracts through Web3 interface
- **Key Server**: Publishes chunk keys through contract calls
- **RAG Server**: Verifies document ownership through contract queries

## Part of ChainShare

This repository is part of the ChainShare project, a master thesis implementation at RWTH Aachen University. For more information, see the [main repository](https://github.com/nievelstone/master-thesis-chainshare).