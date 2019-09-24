const companion = require("@uppy/companion")

// Companion
const options = {
    providerOptions: {
        google: {
            key: 'AIzaSyDvq5wOunU6-xRRvIYh3TjcUWwwXH4uLQU',
            secret: 'GOOGLE_SECRET'
        }
    },
    server: {
        host: 'localhost:3000',
        protocol: 'http',
    },
    filePath: '/uploads'
}

module.exports.companionApp = companion.app(options)