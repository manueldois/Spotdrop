const companion = require("@uppy/companion"),
    oauthKeys = require('../config/keys_plaintext/oauth'),
    path = require('path'),
    express = require('express'),
    router = express.Router();


if (!oauthKeys) throw new Error('Missing googleOauth keys')

/**
 * Sets up companion to allow users to upload via google drive, facebook, and instagram via uppy
 * Attaches to this express app
 */
const options = {
    providerOptions: {
        google: {
            key: oauthKeys.google.key,
            secret: oauthKeys.google.secret
        },
        instagram: {
            key: oauthKeys.instagram.key,
            secret: oauthKeys.instagram.secret
        },
        facebook: {
            key: oauthKeys.facebook.key,
            secret: oauthKeys.facebook.secret
        },
    },
    server: {
        host: 'localhost:3000',
        protocol: 'http',
    },
    debug: true,
    secret: "nevergonnagiveyouup",
    filePath: path.join(__dirname, '../uploads'),
}


router.use(companion.app(options))

function attachWebSocket(server) {
    companion.socket(server, options)
}

module.exports = {router, attachWebSocket}