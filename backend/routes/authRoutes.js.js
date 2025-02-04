const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const { getPublicKeyFromAuthKey } = require('../helpers');
const { listenForHbarTransfers, withdrawTokens } = require('../hederaService');
const { Status } = require("@hashgraph/sdk");

function createAuthRoutes(db, app) {
  app.post('/api/login', (req, res) => {
    const { address, message, signature } = req.body;

    try {
      const decodedMessage = Buffer.from(message.slice(2), 'hex').toString('utf8');
      const msgBuffer = ethUtil.toBuffer(message);
      const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
      const signatureBuffer = ethUtil.toBuffer(signature);
      const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
      const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
      );
      const addressBuffer = ethUtil.publicToAddress(publicKey);
      const recoveredAddress = ethUtil.bufferToHex(addressBuffer);

      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        const token = jwt.sign({ address }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const upsertQuery = `
          INSERT INTO users (public_key, token, expiration)
          VALUES ('${address}', '${token}', '${expiration}')
          ON CONFLICT (public_key) DO UPDATE
          SET token = EXCLUDED.token, expiration = EXCLUDED.expiration
        `;
        db.exec(upsertQuery);

        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      res.status(400).json({ error: 'Invalid signature data' });
    }
  });

  app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      res.json({ valid: true, address: decoded.address });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  });

  app.get('/api/user-info', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      db.all(`
        SELECT public_key, token_amount, expiration
        FROM users
        WHERE public_key = ? AND expiration > CURRENT_TIMESTAMP
      `, [decoded.address], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (rows.length > 0) {
          res.json({
            publicKey: rows[0].public_key,
            tokenAmount: rows[0].token_amount,
            expiration: rows[0].expiration
          });
        } else {
          res.status(404).json({ error: 'User not found or token expired' });
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/public-key', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);

      db.all(`
        SELECT public_key FROM users
        WHERE token = ? AND expiration > CURRENT_TIMESTAMP
      `, [token], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (rows.length > 0) {
          res.json({ publicKey: rows[0].public_key });
        } else {
          res.status(404).json({ error: 'Public key not found or token expired' });
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/withdraw-request', (req, res) => {
    const authHeader = req.headers.authorization;
    const { amount, recipient } = req.body;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);

      db.all(`
        SELECT token_amount FROM users
        WHERE token = ? AND expiration > CURRENT_TIMESTAMP
      `, [token], async (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (rows.length > 0) {
          if (rows[0].token_amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
          }
          const status = await withdrawTokens(amount, recipient);

          if (status != Status.Success) {
            return res.status(500).json({ error: 'Error withdrawing tokens' });
          }

          db.exec(`
            UPDATE users
            SET token_amount = token_amount - ${amount}
            WHERE token = '${token}';
          `, (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
          });

          const query = `
            INSERT INTO transactions (type, amount, timestamp, public_key)
            VALUES ('withdraw', ${amount}, CURRENT_TIMESTAMP, '${recipient.toLowerCase()}');
          `;
          db.exec(query, (err) => {
            if (err) {
              return console.error('Error creating transactions table:', err);
            }
          });
          res.json({ message: 'Withdrawal request successful' });
        } else {
          res.status(404).json({ error: 'User not found or token expired' });
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });
}

module.exports = { createAuthRoutes };