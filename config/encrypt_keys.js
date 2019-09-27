const fs = require('fs'),
    crypto = require('crypto'),
    path = require('path');

main()
async function main() {
    const secret = fs.readFileSync(__dirname + '/secret.txt', 'utf-8')
    encryptKeyFile('google-service-account.json', secret)
    encryptKeyFile('mlabs.json', secret)
    encryptKeyFile('oauth.json', secret)
    console.log("Encrypted all keys")
}


function encryptKeyFile(filename, secret) {
    const key_plaintext = fs.readFileSync(__dirname + '/keys_plaintext/' + filename)
    const cipher = crypto.createCipher('aes-256-ctr', secret);

    const key_encrypted = Buffer.concat([cipher.update(key_plaintext), cipher.final()]);

    fs.writeFileSync(__dirname + '/keys_encrypted/' + path.basename(filename, '.json'), key_encrypted)
}


