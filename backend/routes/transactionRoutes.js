const jwt = require('jsonwebtoken');
const { getPublicKeyFromAuthKey } = require('../helpers');
const { listenForHbarTransfers } = require('../hederaService');
const { getHbarConversion } = require('../tokenService');

function createTransactionRoutes(db, app) {
  app.get('/api/user-transactions', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      db.all(`
        SELECT type, amount, timestamp
        FROM transactions
        WHERE public_key = ?
        ORDER BY timestamp DESC
      `, [decoded.address], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json(rows);
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/trigger-transfer-update', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);
      listenForHbarTransfers();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/hbar-conversion', async (req, res) => {
    const { amount } = req.query;
    try {
      const result = await getHbarConversion(amount);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/user-purchases', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const userPk = await getPublicKeyFromAuthKey(token);

      // First get the purchases
      const purchases = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            p.id, 
            p.document_id, 
            p.chunk_id,
            p.document_name,
            p.content_preview, 
            p.timestamp, 
            p.price,
            p.relevance,
            COALESCE(p.document_id, 'Full Document') AS name,
            CASE 
              WHEN p.chunk_id IS NOT NULL THEN 'Chunk'
              ELSE 'Document'
            END AS purchase_type
          FROM purchases p
          WHERE p.public_key = ?
          AND p.price > 0
          ORDER BY p.timestamp DESC
        `, [userPk], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Get document ratings from RAG server
      const ratingPromises = [...new Set(purchases.map(p => p.document_id))].map(async docId => {
        const response = await fetch(
          `${process.env.RAG_SERVER_API}/get_document_rating/${docId}?ragServerSecret=${process.env.RAG_SERVER_SECRET}`
        );
        if (!response.ok) {
          console.error(`Failed to get rating for document ${docId}`);
          return { document_id: docId, rating: 0 };
        }
        const data = await response.json();
        return { document_id: docId, rating: data.rating };
      });

      const ratings = await Promise.all(ratingPromises);
      const ratingsMap = Object.fromEntries(
        ratings.map(r => [r.document_id, r.rating])
      );

      // Group purchases by document and include ratings
      const groupedPurchases = purchases.reduce((acc, row) => {
        if (!acc[row.document_id]) {
          acc[row.document_id] = {
            document: row.document_name,
            document_id: row.document_id,
            rating: ratingsMap[row.document_id] || 0,
            chunks: [],
            fullDoc: null
          };
        }

        if (row.chunk_id) {
          acc[row.document_id].chunks.push(row);
        } else {
          acc[row.document_id].fullDoc = row;
        }

        return acc;
      }, {});

      res.json({ purchases: Object.values(groupedPurchases) });
    } catch (error) {
      console.error('Error in user-purchases route:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });
}

module.exports = { createTransactionRoutes };