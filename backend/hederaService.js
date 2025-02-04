const axios = require('axios');
const { AccountId, Hbar, PrivateKey, Client, ContractExecuteTransaction, ContractFunctionParameters} = require("@hashgraph/sdk");
const ethers = require("ethers");
const {getLatestTransactionTimestamp, formatDate} = require('./helpers');
const db = require('./db');
const {convertHbartoTokens} = require('./tokenService');
require('dotenv').config();

const ACCOUNT_ID = process.env.HEDERA_OPERATOR_ID

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/';

async function listenForHbarTransfers() {
  console.log(`Listening for HBAR transfers to account: ${ACCOUNT_ID}`);
  try {
    const response = await fetch(MIRROR_NODE_URL + 'api/v1/transactions?account.id=' + ACCOUNT_ID + '&limit=100&order=desc&transactiontype=ETHEREUMTRANSACTION');

    const result = await response.json();

    const latestRecordedTimestamp = await getLatestTransactionTimestamp();

    for(var i=0; i<result.transactions.length; i++){
      const transfers = result.transactions[i].transfers;

      const amountReceived = transfers.find(transfer => transfer.account === ACCOUNT_ID.toString()).amount;

      const senderHederaAddress = (transfers.reduce((prev, current) => (prev.amount < current.amount) ? prev : current).account);

      const accountRequest= await fetch(MIRROR_NODE_URL + 'api/v1/accounts/' + senderHederaAddress + "?limit=1");

      const accountResult = await accountRequest.json();

      const senderPublicKey = accountResult.evm_address;

      let timestamp = result.transactions[i].consensus_timestamp;

      // Define milliseconds for an hour
      const oneHourInMs = 60 * 60 * 1000;

      // Get the transaction date based on the timestamp
      const transactionDate = new Date(timestamp * 1000);

      // Calculate the UTC offset in hours for Germany (CET or CEST)
      const offsetHours = transactionDate.getTimezoneOffset() / -60; // CET is +1, CEST is +2

      // Calculate the timezone adjustment in milliseconds
      const timeZoneAdjustmentInMs = offsetHours * oneHourInMs;

      // Add the timezone adjustment to the transaction timestamp
      const timestampDate = formatDate(new Date(timestamp * 1000 + timeZoneAdjustmentInMs));

      if((latestRecordedTimestamp == null || new Date(timestampDate) > new Date(latestRecordedTimestamp)) && amountReceived > 0){
        console.log(`Received ${Hbar.fromTinybars(amountReceived).toString()} from ${senderPublicKey} at ${timestampDate}`);
        // Insert transaction into database
        const tokenAmount = await convertHbartoTokens(amountReceived/10**8);

        try {
          
        } catch (error) {
          
        }
        // Prepare the SQL statement
        const preparedStatement = await db.prepare(
          `INSERT INTO transactions (type, amount, timestamp, public_key) VALUES (?, ?, ?, ?)`
        );

        // Execute the prepared statement with the parameters
        await preparedStatement.run(
          'deposit',             // type
          tokenAmount,           // amount
          timestampDate,         // timestamp
          senderPublicKey        // public_key
        );

        // Finalize the statement to release resources
        preparedStatement.finalize();


        // Prepare the SQL statement
        const preparedStatement2 = await db.prepare(
          `UPDATE users SET token_amount = token_amount + ? WHERE public_key = ?`
        );

        // Execute the prepared statement with the parameters
        await preparedStatement2.run(
          tokenAmount,       // token_amount to add
          senderPublicKey    // public_key to match
        );

        // Finalize the statement to release resources
        preparedStatement2.finalize();

      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    // Wait for 10 seconds before retrying in case of an error
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

async function withdrawTokens(amount, recipient) {
  //Configure accounts and client 
  const operatorID = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_LONG_PRIVATE_KEY);

  const client = Client.forTestnet();

  client.setOperator(operatorID, operatorKey);

  const amountWithDecimals = ethers.parseUnits(amount.toString(), 0);

  // Create the transfer transaction
  const transaction = new ContractExecuteTransaction()
  .setContractId(process.env.TOKEN_CONTRACT_ID)
  .setGas(100000)
  .setFunction(
      "transfer",new ContractFunctionParameters()
      .addAddress(recipient)
      .addUint256(amount)
  );

  // Execute the transaction
  const response = await transaction.execute(client);

  const receipt = await response.getReceipt(client);

  console.log(`Transfer status: ${receipt.status}`);
  console.log(`Transferred ${amount} tokens to ${recipient}`);

  return receipt.status;
}

module.exports = { listenForHbarTransfers, withdrawTokens};