const axios = require('axios');

let hbarPrice = 0;

async function getHbarConversion(amount) {
  try {    
    const hbarAmount = (amount / 100) / hbarPrice; // Convert cents to HBAR
    return { hbarAmount: hbarAmount.toFixed(8) };
  } catch (error) {
    console.error('Error fetching HBAR price:', error);
  }
}

async function convertHbartoTokens(amount) {
  try {    
    const tokens = hbarPrice * amount * 100;
    return tokens
  } catch (error) {
    console.error('Error fetching HBAR price:', error);
  }
}

async function updateHbarPrice(){
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=eur');
        hbarPrice = response.data['hedera-hashgraph'].eur;
    }
    catch (error) {
        console.error('Error fetching HBAR price:', error);
    }
}



updateHbarPrice();
setInterval(updateHbarPrice, 1000 * 60 * 5); // Update HBAR price every 5 minutes

module.exports = {
  getHbarConversion,
  convertHbartoTokens
};