const { AzureOpenAI } = require("openai");
const { getPublicKeyFromAuthKey } = require('./helpers');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('./authenticationMiddelware');

// Retrieve configuration from environment variables
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = process.env.AZURE_OPENAI_VERSION;

const RAG_SERVER_SECRET = process.env.RAG_SERVER_SECRET;
const RAG_SERVER_API = process.env.RAG_SERVER_API;

const client = new AzureOpenAI({ endpoint, apiKey, apiVersion });

async function processChunkPurchases(db, userPk, chunks, messageId, chunkIdsOwned) {
    // Get all previously purchased chunks for this user
    const purchasedChunks = await new Promise((resolve, reject) => {
        db.all(
            'SELECT chunk_id FROM purchases WHERE public_key = ?',
            [userPk],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => row.chunk_id));
            }
        );
    });

    //Get all documents purchased by the user
    const documentsPurchased = await new Promise((resolve, reject) => {
        db.all(
            'SELECT document_id FROM purchases WHERE public_key = ? AND chunk_id IS NULL',
            [userPk],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => row.document_id));
            }
        );
    });

    // Calculate total cost for new chunks
    let totalCost = 0;
    const newPurchases = [];
    const ownedReferences = [];

    chunks.forEach(chunk => {
        if (!purchasedChunks.includes(chunk.chunk_id) && !chunkIdsOwned.includes(chunk.chunk_id) && !documentsPurchased.includes(chunk.document_id)) {
            const chunkCost = parseFloat(process.env.MAX_CHUNK_PRICE) / parseFloat(chunk.distance + 1);
            totalCost += chunkCost;
            newPurchases.push({
                id: uuidv4(),
                chunk_id: chunk.chunk_id,
                document_id: chunk.document_id,
                document_name: chunk.document_name,
                content_preview: chunk.content_preview,
                public_key: userPk,
                price: chunkCost,
                relevance: 1 / chunk.distance,
                messageId: messageId
            });
        } else { //These are the chunks that the user already owns
            ownedReferences.push(
                {
                    id: uuidv4(),
                    chunk_id: chunk.chunk_id,
                    document_id: chunk.document_id,
                    document_name: chunk.document_name,
                    content_preview: chunk.content_preview,
                    public_key: userPk,
                    price: parseFloat(0),
                    relevance: 1 / chunk.distance,
                    messageId: messageId
                }
            );
        }
    });


    // Check if user has sufficient funds
    const userFunds = await new Promise((resolve, reject) => {
        db.all(
            'SELECT token_amount FROM users WHERE public_key = ? AND expiration > CURRENT_TIMESTAMP',
            [userPk],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Check if rows exist and handle accordingly
                    resolve(rows.length > 0 ? rows[0].token_amount : 0);
                }
            }
        );
    });

    if (userFunds < totalCost) {
        throw new Error(`Insufficient funds for chunk purchases. Required: ${totalCost}, Available: ${userFunds}`);
    }

    console.log("New purchases:", newPurchases);

    console.log("Owned references:", ownedReferences);

    // Process purchases and update user's token balance
    if (newPurchases.length > 0 || ownedReferences.length > 0) {
        const insertPurchase = await db.prepare(
            `INSERT INTO purchases (id, chunk_id, document_id, document_name, content_preview, public_key, message_id, timestamp, price, relevance) 
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`
        );

        for (const purchase of newPurchases) {
            await insertPurchase.run(
                purchase.id,
                purchase.chunk_id,
                purchase.document_id,
                purchase.document_name,
                purchase.content_preview,
                purchase.public_key,
                purchase.messageId,
                purchase.price,
                purchase.relevance
            );
        }

        for (const purchase of ownedReferences) {
            await insertPurchase.run(
                purchase.id,
                purchase.chunk_id,
                purchase.document_id,
                purchase.document_name,
                purchase.content_preview,
                purchase.public_key,
                purchase.messageId,
                purchase.price,
                purchase.relevance
            );
        }

        await insertPurchase.finalize();

        //Pay the owners of the chunks
        await fetch(RAG_SERVER_API + '/buy-chunks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    ragServerSecret: RAG_SERVER_SECRET,
                    chunkIds: newPurchases.map(purchase => purchase.chunk_id),
                    prices: newPurchases.map(purchase => purchase.price)
                }
            ),
        });

        // Update user's token balance
        const deductFee = await db.prepare(
            `UPDATE users SET token_amount = token_amount - ? WHERE public_key = ?`
        );

        await deductFee.run(
            parseFloat(totalCost),
            userPk.toLowerCase()
        );

        // Finalize the statement to release resources
        deductFee.finalize();
    }

    return { totalCost, newPurchases };
}


// Get all conversations for user

function createChatRoutes(db, app) {
    app.get('/api/conversations', isAuthenticated, async (req, res) => {
        try {
            db.all(`
            SELECT c.*, 
              (SELECT body FROM messages 
               WHERE conversation_id = c.id 
               ORDER BY created_at DESC LIMIT 1) as last_message
            FROM conversations c
            WHERE owner_pk = ?
            ORDER BY created_at DESC
          `, [req.userPk], (err, conversations) => {
                if (err) {
                    console.error('Error executing query', err);
                    return res.status(500).json({ error: 'Failed to fetch conversations' });
                }

                res.json(conversations);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get messages for a conversation
    app.get('/api/conversations/:id/messages', async (req, res) => {
        try {
          // Get messages with their purchases
          const query = `
            SELECT m.*, p.chunk_id, p.document_id, p.document_name, p.content_preview, p.relevance
            FROM messages m
            LEFT JOIN purchases p ON m.id = p.message_id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
          `;
    
          const rows = await new Promise((resolve, reject) => {
            db.all(query, [req.params.id], (err, rows) => {
              if (err) reject(err);
              resolve(rows);
            });
          });
    
          // Get the public key from the auth header
          const authHeader = req.headers.authorization;
          const token = authHeader?.split(' ')[1];
          const publicKey = await getPublicKeyFromAuthKey(token);
    
          // For each unique chunk_id, fetch its rating from the RAG server
          const uniqueChunkIds = [...new Set(rows.filter(row => row.chunk_id).map(row => row.chunk_id))];
          
          const ratingsResponse = await fetch(RAG_SERVER_API + '/get-chunk-ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ragServerSecret: RAG_SERVER_SECRET,
              chunkIds: uniqueChunkIds,
              publicKey: publicKey
            })
          });
    
          const ratingsData = await ratingsResponse.json();
          const chunkRatings = ratingsData.ratings || {};
    
          // Group purchases by message and include ratings
          const messages = rows.reduce((acc, row) => {
            const messageId = row.id;
            if (!acc[messageId]) {
              acc[messageId] = {
                id: row.id,
                conversation_id: row.conversation_id,
                sender_pk: row.sender_pk,
                body: row.body,
                created_at: row.created_at,
                purchases: []
              };
            }
    
            if (row.chunk_id) {
              acc[messageId].purchases.push({
                chunk_id: row.chunk_id,
                document_id: row.document_id,
                title: row.document_name,
                content_preview: row.content_preview,
                relevance: row.relevance < 1 ? 'low' : (row.relevance < 2 ? 'medium' : 'high'),
                rating: chunkRatings[row.chunk_id] || null
              });
            }
    
            return acc;
          }, {});
    
          res.json(Object.values(messages));
        } catch (error) {
          console.error('Error in messages route:', error);
          res.status(500).json({ error: error.message });
        }
      });
      
    // Create new conversation
    app.post('/api/conversations', isAuthenticated, async (req, res) => {
        try {
            db.run(`
                INSERT INTO conversations (id, name, owner_pk)
                VALUES ('${req.body.id}', '${req.body.name}', '${req.userPk}')
              `, function (err) {
                if (err) {
                    console.error('Error inserting conversation', err);
                    return res.status(500).json({ error: 'Failed to insert conversation' });
                }
            });


            // Send back the full conversation object
            res.json({
                id: req.body.id,
                name: req.body.name,
                owner_pk: req.userPk,
                created_at: ""
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Add message to conversation
    app.post('/api/messages', async (req, res) => {
        try {
            const { conversation_id, sender_pk, body } = req.body;

            // Validate required fields
            if (!conversation_id) {
                console.log('Missing conversation_id');
                return res.status(400).json({ error: 'conversation_id is required' });
            }

            if (!sender_pk) {
                return res.status(400).json({ error: 'sender_pk is required' });
            }

            if (!body) {
                return res.status(400).json({ error: 'message body is required' });
            }

            // Prepare the SQL statement
            const insertMessage = await db.prepare(
                `INSERT INTO messages (id, conversation_id, sender_pk, body) VALUES (?, ?, ?, ?);`
            );

            // Execute the prepared statement with the parameters
            await insertMessage.run(
                uuidv4(),                   // id
                conversation_id,             // conversation_id
                sender_pk,                   // sender_pk
                body                         // body
            );

            // Finalize the statement to release resources
            await insertMessage.finalize();

            res.json(req.body);
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Handle chat completion with Azure OpenAI
    app.post('/api/chat', isAuthenticated, async (req, res) => {
        try {

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Check base fee first
            const hasSufficientFunds = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT token_amount
                    FROM users
                    WHERE public_key = ? AND expiration > CURRENT_TIMESTAMP
                `, [req.userPk], (err, rows) => {
                    if (err) {
                        console.error('Database error:', err);
                        return reject(new Error('Internal server error'));
                    }

                    if (rows.length > 0 && rows[0].token_amount >= parseFloat(process.env.BASE_FEE || '0')) {
                        return resolve(true);
                    } else {
                        console.log("Not enough funds");
                        return resolve(false);
                    }
                });
            });

            if (!hasSufficientFunds) {
                // Send error message over SSE and end the connection
                res.write(`data: ${JSON.stringify({ error: 'Insufficient funds' })}\n\n`);
                return res.end();
            }

            const messageId = uuidv4();

            // Receive context from RAG server
            const pythonResponse = await fetch(RAG_SERVER_API + '/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ragServerSecret: RAG_SERVER_SECRET,
                    query_embedding: req.body.embeddedPrompt[0],
                    publicKey: req.userPk
                }),
            });

            const pythonResponseJson = await pythonResponse.json();

            const decryptedChunks = pythonResponseJson["chunks"];
               
               try {
                await processChunkPurchases(db, req.userPk, decryptedChunks, messageId, pythonResponseJson["chunk_ids_owned"]);
               } catch (error) {
                res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`); 
                return res.end();
               }


            //Create context from RAG response
            const context = decryptedChunks.map(chunk => chunk.content).join('\n');

            const messages = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT * FROM messages 
                    WHERE conversation_id = ? 
                    ORDER BY created_at DESC
                    LIMIT 3
                `, [req.body.conversation_id], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Reverse the order back to ascending after limiting to the last three messages and remove the most recent
                        // as this one is added later one with the query
                        resolve(rows.reverse().slice(1));
                    }
                });
            });

            const chatMessages = [{ role: "system", content: "You are a helpful assistant that uses provided context to answer questions accurately." }]

            // Format messages for OpenAI
            messages.forEach(msg => {
                chatMessages.push({
                    role: msg.sender_pk === 'AI' ? 'assistant' : 'user',
                    content: msg.body
                });
            });

            //Add the user's message
            chatMessages.push({
                role: 'user',
                content: `Context: ${context}\n\n Question: ${req.body.message}`
            });

            // Create streaming response
            const events = await client.chat.completions.create({
                messages: chatMessages,
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
                max_tokens: 1000,
                stream: true
            });

            let fullResponse = '';

            // Stream each chunk to the client
            for await (const event of events) {
                for (const choice of event.choices) {
                    const delta = choice.delta?.content;
                    if (delta !== undefined) {
                        fullResponse += delta;
                        // Send the chunk to the client
                        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
                    }
                }
            }

            try {
                // Prepare the SQL statement
                const insertMessages = await db.prepare(
                    `INSERT INTO messages (id, conversation_id, sender_pk, body) VALUES (?, ?, ?, ?);`
                );

                // Execute the prepared statement with the parameters
                await insertMessages.run(
                    messageId,                   // id
                    req.body.conversation_id,    // conversation_id
                    'AI',                        // sender_pk
                    fullResponse                    // body
                );

                // Finalize the statement to release resources
                await insertMessages.finalize();
            } catch (error) {
                console.error('Error inserting message', error);
                return res.status(500).json({ error: 'Failed to insert message' });
            }


            try {
                const deductFee = await db.prepare(
                    `UPDATE users SET token_amount = token_amount - ? WHERE public_key = ?`
                );

                await deductFee.run(
                    parseFloat(process.env.BASE_FEE),
                    req.userPk.toLowerCase()
                );

                // Finalize the statement to release resources
                deductFee.finalize();
            } catch (error) {
                console.error('Error update tokens', error);
                return res.status(500).json({ error: 'Failed to update tokens' });

            }

            try {
                // Prepare the SQL statement
                const addFeeTransaction = await db.prepare(
                    `INSERT INTO transactions (type, amount, timestamp, public_key) VALUES (?, ?, CURRENT_TIMESTAMP, ?)`
                );

                // Execute the prepared statement with the parameters
                await addFeeTransaction.run(
                    'withdraw',
                    parseFloat(process.env.BASE_FEE),
                    req.userPk.toLowerCase()
                );

                // Finalize the statement to release resources
                addFeeTransaction.finalize();
            } catch (error) {
                console.error('Error inserting message', error);
                return res.status(500).json({ error: 'Failed to insert message' });
            }


            // Send end event
            res.write('data: [DONE]\n\n');
            res.end();

        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }

    });

    app.delete('/api/conversations/:id', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader.split(' ')[1];
            const userPk = await getPublicKeyFromAuthKey(token);

            const conversation = await db.all(
                `SELECT * FROM conversations WHERE id = ? AND owner_pk = ?`,
                [req.params.id, userPk]
            );

            if (conversation.length === 0) {
                return res.status(404).json({ error: 'Conversation not found or unauthorized' });
            }

            // Delete all messages first (due to foreign key constraints)
            await new Promise((resolve, reject) => {
                db.run(
                    'DELETE FROM messages WHERE conversation_id = ?',
                    [req.params.id],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });

            // Then delete the conversation
            await new Promise((resolve, reject) => {
                db.run(
                    'DELETE FROM conversations WHERE id = ?',
                    [req.params.id],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });

            res.status(200).json({ message: 'Conversation deleted successfully' });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = { createChatRoutes };