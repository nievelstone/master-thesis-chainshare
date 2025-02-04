const { getPublicKeyFromAuthKey } = require('../helpers');
const { v4: uuidv4 } = require('uuid');

function createPurchaseRoutes(db, app) {
  const RAG_SERVER_SECRET = process.env.RAG_SERVER_SECRET;
  const RAG_SERVER_API = process.env.RAG_SERVER_API;

  app.post('/api/get_document_price', async (req, res) => {
    try {
      const { authKey, documentId } = req.body;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to get document price.'
        });
      }

      console.log("Getting document price for document ID:", documentId);

      const pythonResponse = await fetch(RAG_SERVER_API + '/get_document_price?' + new URLSearchParams({
        ragServerSecret: RAG_SERVER_SECRET,
        documentId: documentId
      }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Failed to get document price: ${JSON.stringify(errorData)}`);
      }

      const data = await pythonResponse.json();
      res.json(data);

    } catch (error) {
      console.error('Error in get_document_price route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/buy_document', async (req, res) => {
    try {
      const { authKey, documentId } = req.body;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to purchase documents.'
        });
      }

      console.log("Buying document with ID:", documentId);

      // Get document price from RAG server
      const buyResponse = await fetch(RAG_SERVER_API + '/buy-document?' + new URLSearchParams({
        ragServerSecret: RAG_SERVER_SECRET,
        documentId: documentId
      }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!buyResponse.ok) {
        const errorData = await buyResponse.json();
        throw new Error(`Failed to buy document: ${JSON.stringify(errorData)}`);
      }

      const { price, document_name, public_key } = await buyResponse.json();

      // Check user balance and deduct amount
      const userBalance = await new Promise((resolve, reject) => {
        db.all(`
          SELECT token_amount
          FROM users
          WHERE public_key = ? AND expiration > CURRENT_TIMESTAMP
        `, [publicKey], (err, rows) => {
          if (err) {
            console.error('Database error:', err);
            return reject(new Error('Internal server error'));
          }

          return resolve(rows[0].token_amount);
        });
      });

      if (!userBalance || userBalance < price) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Update user balance
      const deductFee = await db.prepare(
        `UPDATE users SET token_amount = token_amount - ? WHERE public_key = ?`
      );

      await deductFee.run(
        parseFloat(price),
        publicKey.toLowerCase()
      );

      await deductFee.finalize();

      // Add purchase record
      const insertPurchase = await db.prepare(
        `INSERT INTO purchases (id, chunk_id, document_id, document_name, public_key, timestamp, price) 
         VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
      );

      await insertPurchase.run(
        uuidv4(),
        documentId,
        document_name,
        publicKey,
        price
      );

      await insertPurchase.finalize();

      // Add money to the seller's account
      const addMoney = await db.prepare(
        `UPDATE users SET token_amount = token_amount + ? WHERE public_key = ?`
      );

      await addMoney.run(
        parseFloat(price),
        publicKey.toLowerCase()
      );

      await addMoney.finalize();

      res.json({
        success: true,
        remainingBalance: userBalance - price
      });
    } catch (error) {
      console.error('Error in buy_document route:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { createPurchaseRoutes };