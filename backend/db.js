const duckdb = require('duckdb');

// Initialize DuckDB
const db = new duckdb.Database('server.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    public_key VARCHAR PRIMARY KEY,
    token VARCHAR,
    expiration TIMESTAMP,
    token_amount DECIMAL(18, 8) DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id varchar PRIMARY KEY,
    name VARCHAR,
    owner_pk VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id varchar PRIMARY KEY,
    conversation_id varchar,
    sender_pk VARCHAR,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  );
  CREATE TABLE IF NOT EXISTS transactions (
    type VARCHAR NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    public_key VARCHAR
  );
  CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR PRIMARY KEY,
    chunk_id VARCHAR,
    document_id VARCHAR,
    document_name VARCHAR,
    content_preview VARCHAR,
    public_key VARCHAR,
    message_id VARCHAR,
    timestamp TIMESTAMP,
    price DECIMAL(18, 8),
    relevance float
  )
`, (err) => {
  if (err) {
    return console.error('Error creating tables:', err);
  }
}
);

//print db

db.all('SELECT * FROM users', (err, result) => {
  if (err) {
    console.error('Error fetching transactions:', err);
  } else {
    console.log(result);
  }
});


const testUser = "0x5bb82CB9A44748Af6bF4925Bb85865166AC4731F".toLowerCase();

db.run(`INSERT INTO users (public_key, token_amount) VALUES ('${testUser}', 10000)`, (err) => {
  if (err) {
    console.error('Error inserting user:', err);
  }
});

module.exports = db;