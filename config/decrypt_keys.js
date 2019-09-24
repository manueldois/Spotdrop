const util = require('util'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    crypto = require('crypto');

/**
 * Decrypts all keys
 * @param {string} secret 
 */
function decryptAll(secret){
    if(!fs.existsSync(__dirname + '/keys_plaintext')){
        fs.mkdirSync(__dirname + '/keys_plaintext')
    }
    decrypt('mlabs', secret)
    decrypt('google-service-account',secret)
}

/**
 * Reads an encrypted key file from keys/encrypted, decrypts it using secret and writes the plaintext
 * key to keys/plaintext
 * @param {string} filename 
 * @param {string} secret HMAC JWT secret
 */
function decrypt(filename, secret){
    const key_encrypted = fs.readFileSync(__dirname + '/keys_encrypted/' + filename)
    const decipher = crypto.createDecipher('aes-256-ctr', secret);

    const key_decrypted = Buffer.concat([decipher.update(key_encrypted), decipher.final()]);

    fs.writeFileSync(__dirname + '/keys_plaintext/' + filename + '.json', key_decrypted)
}

module.exports.decrypt = decrypt
module.exports.decryptAll = decryptAll


