const hre = require("hardhat");
const { expect } = require("chai");

describe("KeyContract", function () {
  let contractAddress;
  let signers;

  before(async function () {
    signers = await hre.ethers.getSigners();
  });

  it("should be able to deploy a contract", async function () {
    contractAddress = await hre.run("deploy-contract-kc");
    expect(contractAddress).to.not.be.null;
  });

  it("should be able to deposit tokens", async function () {
    const balance = await hre.run("deposit-tokens-kc", {
      contractAddress,
      amount: 100,
    });
    expect(balance).to.equal(100);
  });

  it("should be able to request chunk keys", async function () {
    const chunkKeyRequest = await hre.run("request-chunks-kc", {
      contractAddress,
      chunkIds: ["1", "2"],
      prices: [10, 20],
      keyServerPublicKey: signers[0].address,
    });
    expect(chunkKeyRequest).to.not.be.null;
  });

  it("should be able to publish chunk keys", async function () {
    const chunkKeys = await hre.run("publish-chunk-keys-kc", {
      contractAddress,
      chunkIds: ["1", "2"],
      keys: ["key1", "key2"],
      keyOwners: [signers[0].address, signers[0].address],
    });
    expect(chunkKeys).to.not.be.null;
  });
  it("should be able to rate key owners", async function () {
    const rating = await hre.run("rate-key-owner-kc", {
      contractAddress,
      keyOwner: [signers[0].address, signers[0].address],
      rating: [true, true],
    });
    expect(rating).to.equal(2);
  });
});
