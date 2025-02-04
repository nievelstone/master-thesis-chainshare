import requests
import base64
from Crypto.Cipher import AES
from Crypto.Hash import MD5
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_API = os.getenv('BACKEND_API', 'http://localhost:3001')

def get_public_key(token):
    try:
        response = requests.get(
            BACKEND_API + '/api/public-key',
            headers={'Authorization': f'Bearer {token}'}
        )

        if response.status_code == 200:
            data = response.json()
            return data.get('publicKey')
        else:
            print(response.text)
            print('Failed to retrieve public key')
            return -1
    except requests.RequestException as error:
        print('Error retrieving public key:', error)
        return -1
    

def test_document_decrypt():
    with open(os.path.join("documents", "2d90cae2-1e2f-402e-bc5d-7f3c3a8c5373.raw"), "rb") as encrypted_file:
        encrypted_data = encrypted_file.read()

    decrypted_data = decrypt_pdf_file(encrypted_data, "37a5e724194e736252cb03f0ce136b0f0279f2cc2d2fdb0d199318ef23673a84")

    with open(os.path.join("documents", "decrypted.pdf"), "wb") as decrypted_file:
        decrypted_file.write(decrypted_data)

    print("Decryption successful")
    

def decrypt_pdf_file(encrypted_data, passphrase):
    def unpad(s):
        return s[:-ord(s[len(s)-1:])]

    def derive_key_and_iv(password, salt, key_length, iv_length):
        d = d_i = b''
        while len(d) < key_length + iv_length:
            d_i = MD5.new(d_i + password.encode() + salt).digest()
            d += d_i
        return d[:key_length], d[key_length:key_length+iv_length]

    salt = encrypted_data[8:16]
    encrypted_data = encrypted_data[16:]
    key, iv = derive_key_and_iv(passphrase, salt, 32, 16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return base64.b64decode(unpad(cipher.decrypt(encrypted_data)))


def decrypt(encrypted_data, passphrase):
    def unpad(s):
        try:
            padding_length = ord(s[len(s)-1:])
            if padding_length > 16 or padding_length < 1:
                raise ValueError("Invalid padding")
            for i in range(padding_length):
                if ord(s[len(s)-1-i:len(s)-i]) != padding_length:
                    raise ValueError("Invalid padding")
            return s[:-padding_length]
        except:
            raise ValueError("Wrong passphrase - padding error")

    def derive_key_and_iv(password, salt, key_length, iv_length):
        d = d_i = b''
        while len(d) < key_length + iv_length:
            d_i = MD5.new(d_i + password.encode() + salt).digest()
            d += d_i
        return d[:key_length], d[key_length:key_length+iv_length]

    try:
        encrypted_data = base64.b64decode(encrypted_data)
        if len(encrypted_data) < 16:
            raise ValueError("Wrong passphrase - data too short")
            
        salt = encrypted_data[8:16]
        encrypted_data = encrypted_data[16:]
        key, iv = derive_key_and_iv(passphrase, salt, 32, 16)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return unpad(cipher.decrypt(encrypted_data)).decode('utf-8')
    except UnicodeDecodeError:
        raise ValueError("Wrong passphrase - decoding error")
    except Exception as e:
        if "Wrong passphrase" in str(e):
            raise
        raise ValueError("Wrong passphrase - decryption error")