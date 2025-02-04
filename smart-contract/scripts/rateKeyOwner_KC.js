const { ethers } = require("hardhat");

module.exports = async (address, keyOwner, rating) => {
    const wallet = (await ethers.getSigners())[0];

    const contract = await ethers.getContractAt("KeyContract", address, wallet);

    const updateTx = await contract.rateKeyOwners(keyOwner, rating);
    await updateTx.wait();

    console.log(`Key owners: ${keyOwner}`);
    console.log(`Ratings: ${rating}`);

    console.log(`Updated call result: ${updateTx}`);

    const rating_res = await contract.getKeyOwnerReputation(keyOwner[0]);

    console.log("Rating: ", rating_res);

    return rating_res;
};
