import os
import json
from web3 import Web3
from dotenv import load_dotenv
import time

load_dotenv()

KEY_CONTRACT_ADDRESS = os.getenv('KEY_CONTRACT_ADDRESS')

def getRequestedKeys():
    # Convert the address to checksum format
    address = Web3.to_checksum_address(KEY_CONTRACT_ADDRESS)
    
    # Load the ABI from the JSON file
    with open('./contract/KeyContract.json') as f:
        abi = json.load(f)['abi']
    
    # Initialize a Web3 instance
    web3 = Web3(Web3.HTTPProvider(os.getenv("RELAY_ENDPOINT")))
    
    # Add the operator's private key to the wallet
    wallet = web3.eth.account.from_key(os.getenv("OPERATOR_PRIVATE_KEY"))
    
    # Initialize the contract
    KeyContract = web3.eth.contract(address=address, abi=abi)
    
    # Call the contract method
    call_res = KeyContract.functions.getChunkKeys(["1", "2"]).call({'from': wallet.address, 'gas': 300000})
    
    # Print the result of the contract call
    print(f"Contract call result: {call_res}")


async def request_chunk_keys(chunk_ids, prices, key_server_public_key):
    # Convert the address to checksum format
    address = Web3.to_checksum_address(KEY_CONTRACT_ADDRESS)
    
    # Load the ABI from the JSON file
    with open('./contract/KeyContract.json') as f:
        abi = json.load(f)['abi']
    
    # Initialize a Web3 instance
    web3 = Web3(Web3.HTTPProvider(os.getenv("RELAY_ENDPOINT")))
    
    # Add the operator's private key to the wallet
    wallet = web3.eth.account.from_key(os.getenv("OPERATOR_PRIVATE_KEY"))
    
    # Initialize the contract
    KeyContract = web3.eth.contract(address=address, abi=abi)
    
    # Prepare the transaction
    transaction = KeyContract.functions.requestChunkKeys(chunk_ids, prices, key_server_public_key).build_transaction({
        'from': wallet.address,
        'gas': 600000,
        'nonce': web3.eth.get_transaction_count(wallet.address)
    })
    
    # Sign the transaction with the operator's private key
    signed_tx = web3.eth.account.sign_transaction(transaction, private_key=os.getenv("OPERATOR_PRIVATE_KEY"))
    
    # Send the transaction and wait for the result
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"Updated call result: {tx_receipt}")

def rateKeyOwners(keyOwner, rating):
     # Convert the address to checksum format
     #Wait 5 seconds for the transaction to be mined
    time.sleep(10)
    address = Web3.to_checksum_address(KEY_CONTRACT_ADDRESS)
    
    # Load the ABI from the JSON file
    with open('./contract/KeyContract.json') as f:
        abi = json.load(f)['abi']
    
    # Initialize a Web3 instance
    web3 = Web3(Web3.HTTPProvider(os.getenv("RELAY_ENDPOINT")))
    
    # Add the operator's private key to the wallet
    wallet = web3.eth.account.from_key(os.getenv("OPERATOR_PRIVATE_KEY"))
    
    # Initialize the contract
    KeyContract = web3.eth.contract(address=address, abi=abi)

    # keyowner array to web3 checksum format
    keyOwner = [Web3.to_checksum_address(owner) for owner in keyOwner]

    print("KeyOwner: ", keyOwner)
    print("Rating: ", rating)
    
    # Prepare the transaction
    transaction = KeyContract.functions.rateKeyOwners(keyOwner, rating).build_transaction({
        'from': wallet.address,
        'gas': 600000,
        'nonce': web3.eth.get_transaction_count(wallet.address)
    })
    
    # Sign the transaction with the operator's private key
    signed_tx = web3.eth.account.sign_transaction(transaction, private_key=os.getenv("OPERATOR_PRIVATE_KEY"))
    
    # Send the transaction and wait for the result
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"Updated call result: {tx_receipt}")