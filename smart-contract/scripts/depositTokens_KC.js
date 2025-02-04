const { ethers } = require("hardhat");

module.exports = async (address, amount) => {
  const wallet = (await ethers.getSigners())[0];

  const tokenAddress = "0x758f28218db83125c3a3cd723222b76011d68dc6";

  const tokenContract = await ethers.getContractAt("IERC20", tokenAddress);
  //We approve an unlimited amount
  const approveTx = await tokenContract.approve(address, 1000000);
  await approveTx.wait(); // Wait for approval transaction to be mined

  const contract = await ethers.getContractAt("KeyContract", address, wallet);

  const updateTx = await contract.depositTokens(amount);
  await updateTx.wait();

  console.log(`Updated call result: ${updateTx}`);

  const balance = await contract.getBalance();
  console.log(`Balance: ${balance}`);

  return balance;
};