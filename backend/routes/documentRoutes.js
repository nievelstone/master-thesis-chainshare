const { getPublicKeyFromAuthKey } = require('../helpers');

function createDocumentRoutes(db, app) {
  const RAG_SERVER_SECRET = process.env.RAG_SERVER_SECRET;
  const RAG_SERVER_API = process.env.RAG_SERVER_API;

  app.post('/api/upload', async (req, res) => {
    try {
      const { chunks, encryptedDocument, authKey, documentId, documentTitle, keyServerPublicKey } = req.body;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to upload documents.'
        });
      }

      const pythonResponse = await fetch(RAG_SERVER_API + '/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chunks: chunks,
          encryptedDocument: encryptedDocument,
          publicKey: publicKey,
          documentId: documentId,
          documentTitle: documentTitle,
          keyServerPublicKey: keyServerPublicKey,
          ragServerSecret: RAG_SERVER_SECRET
        }),
      });

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Python backend error: ${JSON.stringify(errorData)}`);
      }

      const data = await pythonResponse.json();
      res.json(data);

    } catch (error) {
      console.error('Error in upload route:', error);
      if (error.message.includes("Document with that name already exists")) {
        res.status(409).json({ error: "Document with that name already exists. Please choose another one." });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/get_documents', async (req, res) => {
    try {
      const { authKey } = req.query;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to get documents.'
        });
      }

      const pythonResponse = await fetch(
        `${RAG_SERVER_API}/get_documents?publicKey=${publicKey}&ragServerSecret=${RAG_SERVER_SECRET}`
      );

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Python backend error: ${JSON.stringify(errorData)}`);
      }

      const data = await pythonResponse.json();
      res.json(data);
    } catch (error) {
      console.error('Error in get_documents route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/get_chunk', async (req, res) => {
    try {
      const { authKey, chunkId } = req.query;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to get documents.'
        });
      }

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

      if (conversation.length == 0) {
        return res.status(401).json({
          error: 'You have not purchased this chunk.'
        });
      }

      console.log('conversation:', conversation);

      const pythonResponse = await fetch(
        `${RAG_SERVER_API}/get_chunk?chunkId=${chunkId}&ragServerSecret=${RAG_SERVER_SECRET}`
      );

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Python backend error: ${JSON.stringify(errorData)}`);
      }

      const data = await pythonResponse.json();
      res.json(data);

    } catch (error) {
      console.error('Error in get_chunk route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/get_document_pdf', async (req, res) => {
    const { authKey, documentId } = req.query;
    const publicKey = await getPublicKeyFromAuthKey(authKey);
  
    if (publicKey == -1) {
      return res.status(401).json({
        error: 'Failed to retrieve public key. Not authenticated to get document PDF.'
      });
    }
  
    //Check if the user has bought this document
    const conversation = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM purchases WHERE public_key = ? AND document_id = ? AND chunk_id IS NULL`, publicKey, documentId,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  
    if (conversation.length == 0) {
      return res.status(401).json({
        error: 'You have not purchased this document.'
      });
    }
  
    try {
      // Forward to Python backend with exact matching structure
      const pythonResponse = await fetch(RAG_SERVER_API + '/get_document_pdf?' + new URLSearchParams({
        ragServerSecret: RAG_SERVER_SECRET,
        documentId: documentId
      }), {
        method: 'GET',
      });
  
      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Python backend error: ${JSON.stringify(errorData)}`);
      }
  
      // Set appropriate headers for PDF response
      res.setHeader('Content-Type', 'application/pdf');
  
      // Use Streams API to pipe the response
      await pythonResponse.body.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        }
      }));
    } catch (error) {
      console.error('Error in get_document_pdf route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/delete_document', async (req, res) => {
    try {
      const { authKey, documentName } = req.body;
      const publicKey = await getPublicKeyFromAuthKey(authKey);

      if (publicKey == -1) {
        return res.status(401).json({
          error: 'Failed to retrieve public key. Not authenticated to delete documents.'
        });
      }

      const pythonResponse = await fetch(RAG_SERVER_API + '/delete_document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ragServerSecret: RAG_SERVER_SECRET,
          publicKey: publicKey,
          documentName: documentName
        }),
      });

      if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json();
        throw new Error(`Python backend error: ${JSON.stringify(errorData)}`);
      }

      const data = await pythonResponse.json();
      res.json(data);

    } catch (error) {
      console.error('Error in delete_document route:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { createDocumentRoutes };