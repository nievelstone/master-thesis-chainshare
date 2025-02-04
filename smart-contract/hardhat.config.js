require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

task("show-balance-cst", async () => {
  const showBalance = require("./scripts/showBalance_CST");
  return showBalance();
});

task("deploy-contract-cst", async () => {
  const deployContract = require("./scripts/deployContract_CST");
  return deployContract();
});

task("contract-view-call-cst", async (taskArgs) => {
  const contractViewCall = require("./scripts/contractViewCall_CST");
  return contractViewCall(taskArgs.contractAddress);
});

task("contract-call-cst", async (taskArgs) => {
  const contractCall = require("./scripts/contractCall_CST");
  return contractCall(taskArgs.contractAddress, taskArgs.msg);
});

task("deploy-contract-kc", async () => {
  const deployContract = require("./scripts/deployContract_KC");
  return deployContract();
});

task("deposit-tokens-kc", async (taskArgs) => {
  const depositTokens = require("./scripts/depositTokens_KC");
  return depositTokens(taskArgs.contractAddress, taskArgs.amount);
});

task("request-chunks-kc", async (taskArgs) => {
  const requestChunks = require("./scripts/requestChunks_KC");
  return requestChunks(taskArgs.contractAddress, taskArgs.chunkIds, taskArgs.prices, taskArgs.keyServerPublicKey);
});

task("publish-chunk-keys-kc", async (taskArgs) => {
  const publishChunkKeys = require("./scripts/publishChunkKeys_KC");
  return publishChunkKeys(taskArgs.contractAddress, taskArgs.chunkIds, taskArgs.keys, taskArgs.keyOwners);
});
task("rate-key-owner-kc", async (taskArgs) => {
  const rateKeyOwner = require("./scripts/rateKeyOwner_KC");
  return rateKeyOwner(taskArgs.contractAddress, taskArgs.keyOwner, taskArgs.rating);
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  mocha: {
    timeout: 3600000,
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 21,
    enabled: true
  },
  // This specifies network configurations used when running Hardhat tasks
  defaultNetwork: "testnet",
  networks: {
    local: {
      // Your Hedera Local Node address pulled from the .env file
      url: process.env.LOCAL_ENDPOINT,
      // Your local node operator private key pulled from the .env file
      accounts: [process.env.LOCAL_PRIVATE_KEY],
    },
    testnet: {
      // HashIO testnet endpoint from the TESTNET_ENDPOINT variable in the .env file
      url: process.env.TESTNET_ENDPOINT,
      // Your ECDSA account private key pulled from the .env file
      accounts: [process.env.TESTNET_PRIVATE_KEY],
    },

    /**
     * Uncomment the following to add a mainnet network configuration
     */
    //   mainnet: {
    //     // HashIO mainnet endpoint from the MAINNET_ENDPOINT variable in the .env file
    //     url: process.env.MAINNET_ENDPOINT,
    //     // Your ECDSA account private key pulled from the .env file
    //     accounts: [process.env.MAINNET_OPERATOR_PRIVATE_KEY],
    // },

    /**
     * Uncomment the following to add a previewnet network configuration
     */
    //   previewnet: {
    //     // HashIO previewnet endpoint from the PREVIEWNET_ENDPOINT variable in the .env file
    //     url: process.env.PREVIEWNET_ENDPOINT,
    //     // Your ECDSA account private key pulled from the .env file
    //     accounts: [process.env.PREVIEWNET_OPERATOR_PRIVATE_KEY],
    // },
  },
};
