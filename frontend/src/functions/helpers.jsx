import {API_URL} from '../config';

const getPublicKey = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
  
    try {
      const response = await fetch(API_URL + '/api/public-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.publicKey;
      } else {
        console.error('Failed to retrieve public key');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving public key:', error);
      return null;
    }
  };

  const fetchUserTokenHolding = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
  
    try {
      const response = await fetch(API_URL + '/api/user-info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.tokenAmount;
      } else {
        console.error('Failed to retrieve public key');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving public key:', error);
      return null;
    }
  };

  const fetchUserTransactions = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
  
    try {
      const response = await fetch(API_URL + '/api/user-transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to retrieve transactions');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      return null;
    }
  };

  const triggerHbarListen = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
  
    try {
      const response = await fetch(API_URL + '/api/trigger-transfer-update', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.tokenAmount;
      } else {
        console.error('Failed to trigger update');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving update:', error);
      return null;
    }
  };

export { getPublicKey, fetchUserTokenHolding, fetchUserTransactions, triggerHbarListen};