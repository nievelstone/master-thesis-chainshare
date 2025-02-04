const { ethers } = require("hardhat");

module.exports = async () => {
  let wallet = (await ethers.getSigners())[0];
  
  // Token address to be passed to the constructor
  const tokenAddress = "0x758f28218db83125c3a3cd723222b76011d68dc6";

  const KeyContract = await ethers.getContractFactory("KeyContract", wallet);

  console.log(wallet.address);

  // Pass tokenAddress to the constructor during deployment
  const contract = await KeyContract.deploy(tokenAddress);

  const contractAddress = (await contract.deployTransaction.wait())
    .contractAddress;

  console.log(`KeyContract deployed to: ${contractAddress}`);

  return contractAddress;
};