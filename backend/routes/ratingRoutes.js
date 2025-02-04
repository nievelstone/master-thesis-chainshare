const jwt = require('jsonwebtoken');
const { getPublicKeyFromAuthKey } = require('../helpers');

function createRatingRoutes(db, app) {
  const RAG_SERVER_SECRET = process.env.RAG_SERVER_SECRET;
  const RAG_SERVER_API = process.env.RAG_SERVER_API;

  app.post('/api/rate-chunk-id', async (req, res) => {
    const { authKey, chunkId, rating } = req.body;

    const publicKey = await getPublicKeyFromAuthKey(authKey);

    if (publicKey == -1) {
      return res.status(401).json({
        error: 'Failed to retrieve public key. Not authenticated to rate chunks.'
      });
    }

    //Check if the user has purchased this chunk
    const conversation = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM purchases WHERE public_key = ? AND chunk_id = ?`, publicKey, chunkId,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    console.log(conversation);

    if (conversation.length == 0) {
      return res.status(401).json({
        error: 'You have not purchased this chunk.'
      });
    }

    const pythonResponse = await fetch(RAG_SERVER_API + '/rate-chunk-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ragServerSecret: RAG_SERVER_SECRET,
        publicKey: publicKey,
        chunkId: chunkId,
        rating: rating,
      }),
    });

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json();
      console.error('Error in rate-chunk-id route:', errorData);
      return res.status(500).json({ error: errorData });
    }

    const data = await pythonResponse.json();
    res.json(data);
  }
  );

  app.get('/api/document-ratings', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const userPk = await getPublicKeyFromAuthKey(token);

      // Retrieve the document ratings from DuckDB
      db.all(`
      WITH chunk_ratings AS (
        SELECT 
          p.document_id,
          COALESCE(SUM(r.rating), 0) as total_rating
        FROM purchases p
        LEFT JOIN ratings r ON p.chunk_id = r.chunk_id
        GROUP BY p.document_id
      )
      SELECT 
        d.document_id,
        d.document_name,
        COALESCE(cr.total_rating, 0) as rating
      FROM documents d
      LEFT JOIN chunk_ratings cr ON d.document_id = cr.document_id
    `, (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ documentRatings: rows });
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/get-chunk-ratings', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const token = authHeader.split(' ')[1];
      const userPk = await getPublicKeyFromAuthKey(token);
      const { chunkIds } = req.body;

      if (!chunkIds || !Array.isArray(chunkIds)) {
        return res.status(400).json({ error: 'Invalid chunkIds array provided' });
      }

      // Forward the request to the RAG server
      const ragResponse = await fetch(RAG_SERVER_API + '/get-chunk-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ragServerSecret: RAG_SERVER_SECRET,
          chunkIds: chunkIds,
          publicKey: userPk
        })
      });

      if (!ragResponse.ok) {
        throw new Error('Failed to fetch ratings from RAG server');
      }

      const data = await ragResponse.json();
      res.json(data);

    } catch (error) {
      console.error('Error in get-chunk-ratings:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { createRatingRoutes };