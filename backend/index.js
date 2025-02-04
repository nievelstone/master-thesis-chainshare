const express = require('express');
const cors = require('cors');
const ethUtil = require('ethereumjs-util');
const jwt = require('jsonwebtoken');
const { getHbarConversion } = require('./tokenService');
const db = require('./db');
const { resetTokens, getPublicKeyFromAuthKey } = require('./helpers');
const { listenForHbarTransfers, withdrawTokens } = require('./hederaService');
const { createChatRoutes } = require('./chatService');
const { Status } = require("@hashgraph/sdk");
const { v4: uuidv4 } = require('uuid');
const { createAuthRoutes } = require('./routes/authRoutes.js');
const { createDocumentRoutes } = require('./routes/documentRoutes.js');
const { createTransactionRoutes } = require('./routes/transactionRoutes.js');
const { createPurchaseRoutes } = require('./routes/purchaseRoutes.js');
const { createRatingRoutes } = require('./routes/ratingRoutes.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET_KEY;

app.get('/api/trigger-transfer-update', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);

    listenForHbarTransfers();
    res.json({ message: 'Transfer update triggered' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

listenForHbarTransfers();

createChatRoutes(db, app);
createAuthRoutes(db, app);
createDocumentRoutes(db, app);
createTransactionRoutes(db, app);
createPurchaseRoutes(db, app);
createRatingRoutes(db, app);

// Reset tokens every 24 hours
setInterval(resetTokens, 24 * 60 * 60 * 1000);

//Update received payments in HBAR eveery five minutes
setInterval(listenForHbarTransfers, 1000 * 60 * 5);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});