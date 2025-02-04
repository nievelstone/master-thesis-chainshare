//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KeyContract {
    address public owner;
    address public tokenAddress;

    mapping(address => string[]) public requestedChunkKeysByKeyServer; //Maps the key server id to the chunk ids that are requested for this server
    mapping(string => uint16) public chunkPrices; //Maps the chunk id to the price of the chunk
    mapping(string => string) public chunkKeys; //Maps the chunk id to the key of the chunk
    
    mapping(address => uint16) public keyOwnerOpenRatings; //Maps the key owner address to the amount of open ratings
    mapping(address => uint16) public keyOwnerReputation; //Maps the key owner address to the reputation of the key owner

    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
    }

    function requestChunkKeys(
        string[] memory chunkIds,
        uint16[] memory prices,
        address keyServerPublicKey
    ) public isOwner {
        requestedChunkKeysByKeyServer[keyServerPublicKey] = chunkIds;
        for (uint256 i = 0; i < chunkIds.length; i++) {
            chunkPrices[chunkIds[i]] = prices[i];
        }
    }

    function publishChunkKeys(
        string[] memory chunkIds,
        string[] memory keys,
        address[] memory keyOwners
    ) public {
        require(
            chunkIds.length == keys.length &&
                chunkIds.length == keyOwners.length,
            "Arrays must have the same length"
        );
        //Check if the chunk ids are the same as the requested chunk ids
        for (uint256 i = 0; i < chunkIds.length; i++) {
            require(
                keccak256(
                    abi.encodePacked(
                        requestedChunkKeysByKeyServer[msg.sender][i]
                    )
                ) == keccak256(abi.encodePacked(chunkIds[i])),
                "Chunk ids must be the same as the requested chunk ids"
            );
        }
        // Temporary arrays to track rewards for unique keyOwners
        address[] memory uniqueKeyOwners = new address[](keyOwners.length);
        uint256[] memory keyOwnerRewards = new uint256[](keyOwners.length);
        uint256 uniqueKeyOwnerCount = 0;

        for (uint256 i = 0; i < chunkIds.length; i++) {
            uint256 chunkPrice = chunkPrices[chunkIds[i]];
            address keyOwner = keyOwners[i];

            // Store the key for the chunk
            chunkKeys[chunkIds[i]] = keys[i];

            //Allows the server to rate the key owner
            keyOwnerOpenRatings[keyOwner] += 1;

            // Accumulate the reward for each unique owner
            if (chunkPrice > 0) {
                bool keyOwnerExists = false;
                for (uint256 j = 0; j < uniqueKeyOwnerCount; j++) {
                    if (uniqueKeyOwners[j] == keyOwner) {
                        keyOwnerRewards[j] += chunkPrice;
                        keyOwnerExists = true;
                        break;
                    }
                }

                // If owner is not already in uniqueOwners, add them
                if (!keyOwnerExists) {
                    uniqueKeyOwners[uniqueKeyOwnerCount] = keyOwner;
                    keyOwnerRewards[uniqueKeyOwnerCount] = chunkPrice;
                    uniqueKeyOwnerCount++;
                }
            }
        }

        // Transfer accumulated rewards to each unique key owner
        for (uint256 i = 0; i < uniqueKeyOwnerCount; i++) {
            // KeyOnwer only gets the reward if they have a reputation
            if (keyOwnerRewards[i] > 0 && keyOwnerReputation[uniqueKeyOwners[i]] > 0) {
                IERC20(tokenAddress).transfer(
                    uniqueKeyOwners[i],
                    keyOwnerRewards[i]
                );
            }
        }
        delete requestedChunkKeysByKeyServer[msg.sender];
    }

    function rateKeyOwners(
        address[] memory keyOwners,
        bool[] memory ratings
    ) public {
        require(
            keyOwners.length == ratings.length,
            "Arrays must have the same length"
        );
        for (uint256 i = 0; i < keyOwners.length; i++) {
            require(
                keyOwnerOpenRatings[keyOwners[i]] > 0,
                "Key owner has no open ratings"
            );
            keyOwnerOpenRatings[keyOwners[i]] -= 1;
            if (ratings[i]) {
                keyOwnerReputation[keyOwners[i]] += 1;
            } else {
                keyOwnerReputation[keyOwners[i]] = 0;
            }
        }
    }

    function getChunkKeyRequest(
        address keyServerPublicKey
    ) public view returns (string[] memory) {
        return requestedChunkKeysByKeyServer[keyServerPublicKey];
    }

    function getChunkKeys(
        string[] memory chunkIds
    ) public view returns (string[] memory) {
        string[] memory keys = new string[](chunkIds.length);
        for (uint256 i = 0; i < chunkIds.length; i++) {
            keys[i] = chunkKeys[chunkIds[i]];
        }
        return keys;
    }

    function getKeyOwnerReputation(
        address keyOwner
    ) public view returns (uint16) {
        return keyOwnerReputation[keyOwner];
    }

    //--- Functions to prepare the contract by the server ---

    function depositTokens(uint256 amount) public isOwner {
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawTokens(uint256 amount) public isOwner {
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }

    function getBalance() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    modifier isOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
}
