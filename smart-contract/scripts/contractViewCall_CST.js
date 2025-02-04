const { ethers } = require("hardhat");

module.exports = async (address) => {

  const wallet = (await ethers.getSigners())[0];

  const token = await hre.ethers.getContractAt("ChainShareToken", address, wallet);

  const callRes = await token.balanceOf(wallet.address);

  const decimal = await token.decimals();

  console.log(`Contract call result: ${callRes} with decimal of ${decimal}`);

  return callRes;
};
