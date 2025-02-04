const { ethers } = require("hardhat");

module.exports = async () => {
  let wallet = (await ethers.getSigners())[0];

  const ChainShareToken = await ethers.getContractFactory("ChainShareToken", wallet);

  const token = await ChainShareToken.deploy();

  const contractAddress = (await token.deployTransaction.wait())
    .contractAddress;

  console.log(`ChainShareToken deployed to: ${contractAddress}`);

  return contractAddress;
};
