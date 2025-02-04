const db = require('./db');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const jwt = require('jsonwebtoken');

function resetTokens() {
  db.exec(`
    UPDATE users
    SET token = NULL, expiration = NULL
    WHERE expiration <= CURRENT_TIMESTAMP
  `);
  console.log('Tokens reset');
}

function getLatestTransactionTimestamp() {
    const query = `
      SELECT MAX(timestamp) as latest_timestamp
      FROM transactions;
    `;
  
    return new Promise((resolve, reject) => {
      db.all(query, (err, result) => {
        if (err) {
          console.error("Error fetching latest timestamp:", err);
          reject(err);
        } else {
          const latestTimestamp = result[0]?.latest_timestamp || null;
          resolve(latestTimestamp);
        }
      });
    });
  }


  function formatDate(date) {
    // Pad numbers to two digits
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1); // Months are 0-based
    const day = pad(date.getUTCDate());
    
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    
    // Get the microseconds (fractional part of the seconds)
    const milliseconds = date.getUTCMilliseconds();
    const microseconds = Math.floor(milliseconds * 1000);

    // Format the UTC offset (in this case, we will use UTC ±00:00)
    const utcOffset = "+00:00";

    // Construct the formatted string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}${utcOffset}`;
}

async function getPublicKeyFromAuthKey(token) {
  try {
    // Verify the token
    jwt.verify(token, JWT_SECRET);
    
    // Retrieve the public key from DuckDB using a promise
    const publicKey = await new Promise((resolve, reject) => {
      db.all(`
        SELECT public_key FROM users
        WHERE token = ? AND expiration > CURRENT_TIMESTAMP
      `, [token], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return reject(-1);
        }
        
        if (rows.length > 0) {
          resolve(rows[0].public_key);
        } else {
          resolve(-1);
        }
      });
    });

    return publicKey;

  } catch (error) {
    console.log("Error verifying token:", error);
    return -1;
  }
}

module.exports = { resetTokens, getLatestTransactionTimestamp, formatDate, getPublicKeyFromAuthKey };