import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

class TokenService {
  async getUserTokenHolding() {
    return apiClient.get(API_ENDPOINTS.USER.INFO);
  }

  async getUserTransactions() {
    return apiClient.get(API_ENDPOINTS.USER.TRANSACTIONS);
  }

  async getHbarConversion(amount) {
    return apiClient.get('/api/hbar-conversion', {
      amount
    });
  }

  async triggerTransferUpdate() {
    return apiClient.get('/api/trigger-transfer-update');
  }

  async withdrawRequest(amount, recipient) {
    return apiClient.post('/api/withdraw-request', {
      amount: parseFloat(amount),
      recipient
    });
  }

  // Blockchain interaction methods
  async addTokenToMetaMask(tokenAddress, symbol, decimals, imageUrl = '') {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: symbol,
            decimals: decimals,
            image: imageUrl,
          },
        },
      });

      return wasAdded;
    } catch (error) {
      throw new Error(`Error adding token to MetaMask: ${error.message}`);
    }
  }

  async switchToHederaTestnet() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }], // Hedera Testnet chain ID
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x128',
              chainName: 'Hedera Testnet',
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18,
              },
              rpcUrls: ['https://testnet.hedera.com'],
              blockExplorerUrls: ['https://hashscan.io/testnet'],
            }],
          });
          return true;
        } catch (addError) {
          throw new Error('Failed to add Hedera Testnet to MetaMask');
        }
      }
      throw new Error('Failed to switch to Hedera Testnet');
    }
  }
}

export const tokenService = new TokenService();