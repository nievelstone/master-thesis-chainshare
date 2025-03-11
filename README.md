# ChainShare

ChainShare is a blockchain-based ecosystem for privacy-preserving and ownership-aware document sharing in Large Language Model (LLM) applications. The system enables secure knowledge sharing while ensuring fair compensation through smart contracts. [Click here to watch an introductory video about ChainShare on YouTube](https://www.youtube.com/watch?v=h-gxD1tQAVY).

The theoretical foundation and implementation details of this system are described in detail in the associated master's thesis. The system implements a novel approach to document sharing that combines client-side processing, chunk-level encryption, and blockchain-based access control to create a trustless knowledge marketplace.

## Academic Citation

If you use ChainShare in your research, please cite:

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


## Repository Structure

```
chainshare/
├── frontend/          # React-based web application
├── backend/           # Node.js API server
├── rag-server/        # Python RAG pipeline implementation
├── key-server/        # Key management service
└── smart-contract/   # Hedera smart contracts
```

## Prerequisites

- Node.js >= 18
- Python >= 3.10
- MetaMask wallet
- DuckDB >= 0.9
- Hedera testnet account

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/nievelstone/master-thesis-chainshare.git
```

2. Install dependencies for each component:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# RAG Server
cd ../rag-server
pip install -r requirements.txt

# Key Server
cd ../key-server
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env` in each component directory
- Update with your specific configurations

4. Start development servers

## Documentation

Each component has its own detailed README in its respective directory:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [RAG Server Documentation](./rag-server/README.md)
- [Key Server Documentation](./key-server/README.md)
- [Smart Contracts Documentation](./smart-contract/README.md)

## Research Publications

This work has been developed as part of a master's thesis at RWTH Aachen University in cooperation with Fraunhofer FIT.

## Research Opportunities

Several promising research directions remain open for investigation:

- Integration of homomorphic encryption for secure similarity search
- Enhanced game-theoretic analysis of the reputation system

We welcome academic collaboration on these topics.

## Acknowledgments

This research was supported by:

- RWTH Aachen University, Department of Computer Science
- Fraunhofer Institute for Applied Information Technology FIT
- The Hedera Foundation

Special thanks to Prof. Dr. Wolfgang Prinz for his supervision and guidance throughout this research.
