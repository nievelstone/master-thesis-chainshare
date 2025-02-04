const hre = require("hardhat");
const { expect } = require("chai");

describe("CST", function () {
  let contractAddress;
  let signers;

  before(async function () {
    signers = await hre.ethers.getSigners();
  });

  it("should be able to get the account balance", async function () {
    const balance = await hre.run("show-balance-cst");
    expect(Number(balance)).to.be.greaterThan(0);
  });

  it("should be able to deploy a contract", async function () {
    contractAddress = await hre.run("deploy-contract-cst");
    expect(contractAddress).to.not.be.null;
  });

  it("should be able to call the balance of deployer", async function () {
    balance = await hre.run("contract-view-call-cst", { contractAddress});
    expect(balance).to.be.equal(1000000000);
  });
});
