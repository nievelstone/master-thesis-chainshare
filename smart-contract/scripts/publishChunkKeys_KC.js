const { ethers } = require("hardhat");

module.exports = async (address, chunkIds, keys, keyOwners) => {
  const wallet = (await ethers.getSigners())[0];

  const contract = await ethers.getContractAt("KeyContract", address, wallet);

  const updateTx = await contract.publishChunkKeys(chunkIds, keys, keyOwners);
  await updateTx.wait();

  console.log(`Chunk IDs: ${chunkIds}`);
  console.log(`Keys: ${keys}`);
  console.log(`Key owners: ${keyOwners}`);

  console.log(`Updated call result: ${updateTx}`);

  const chunkKeys = await contract.getChunkKeys(chunkIds);
  console.log(`Chunk keys: ${chunkKeys}`);

  return chunkKeys;
};
