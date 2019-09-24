const { Storage } = require('@google-cloud/storage'),
    fs = require('fs'),
    multer = require('multer'),
    path = require('path'),
    stream = require('stream'),
    sharp = require('sharp'),
    util = require('util'),
    pipeline = util.promisify(stream.pipeline);

const GCStorage = new Storage({
    projectId: 'spotdrop',
    keyFilename: './config/keys_plaintext/google-service-account.json'
})
const SpotdropBucket = GCStorage.bucket('spotdrop-media')

class StoragePipeline {
    constructor() { }

    _handleFile(req, file, cb) {
        resizeAndUploadFileAsJPEG(file, req.filePath, req.fileName).then(cloudUrl => {
            cb(null, cloudUrl)
        }).catch(err => {
            console.error(err)
            cb(err)
        })
    }

    _removeFile(req, file, cb) {
        cb(null)
    }
}

function resizeAndUploadFileAsJPEG(file, path, name) {
    const Gcloud_file_1x = SpotdropBucket.file(`${path}/1x/${name}.jpg`)
    const Gcloud_file_4x = SpotdropBucket.file(`${path}/4x/${name}.jpg`)
    const Gcloud_file_16x = SpotdropBucket.file(`${path}/16x/${name}.jpg`)

    const resize_and_upload_stream_pipeline_1x = pipeline(
        file.stream,
        sharp({ failOnError: false }).resize(1024).jpeg(),
        Gcloud_file_1x.createWriteStream()
    )

    const resize_and_upload_stream_pipeline_4x = pipeline(
        file.stream,
        sharp({ failOnError: false }).resize(256).jpeg(),
        Gcloud_file_4x.createWriteStream()
    )

    const resize_and_upload_stream_pipeline_16x = pipeline(
        file.stream,
        sharp({ failOnError: false }).resize(64).jpeg(),
        Gcloud_file_16x.createWriteStream()
    )

    return Promise.all([
        resize_and_upload_stream_pipeline_1x,
        resize_and_upload_stream_pipeline_4x,
        resize_and_upload_stream_pipeline_16x,
    ])
        .then(() => Promise.all([
            Gcloud_file_1x.getMetadata(),
            Gcloud_file_4x.getMetadata(),
            Gcloud_file_16x.getMetadata()
        ]))
        .then(uploaded_files_metadatas => {
            return {
                cloudUrl: {
                    _1x: uploaded_files_metadatas[0][0].mediaLink,
                    _4x: uploaded_files_metadatas[1][0].mediaLink,
                    _16x: uploaded_files_metadatas[2][0].mediaLink
                }
            }
        })
}

const upload = multer({ storage: new StoragePipeline() })
exports.upload = upload


