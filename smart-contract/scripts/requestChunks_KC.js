const { ethers } = require("hardhat");

module.exports = async (address, chunkIds, prices, keyServerPublicKey) => {
  const wallet = (await ethers.getSigners())[0];

  const contract = await ethers.getContractAt("KeyContract", address, wallet);

  const updateTx = await contract.requestChunkKeys(chunkIds, prices, keyServerPublicKey);
  await updateTx.wait();

  console.log(`Updated call result: ${updateTx}`);

  console.log(`Chunk IDs: ${chunkIds}`);
  console.log(`Prices: ${prices}`);
  console.log(`Key server public key: ${keyServerPublicKey}`);

  const chunkKeyRequest = await contract.getChunkKeyRequest(keyServerPublicKey);
  console.log(`Chunk key request: ${chunkKeyRequest}`);

  return chunkKeyRequest;
};