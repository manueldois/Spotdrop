import * as Uppy from 'uppy'
import 'uppy/dist/uppy.min.css'
import '@uppy/url/dist/style.css'

function configUppy(uppyInstance) {
    uppyInstance.use(Uppy.GoogleDrive, { target: Uppy.Dashboard, companionUrl: document.location.origin })
    uppyInstance.use(Uppy.Instagram, { target: Uppy.Dashboard, companionUrl: document.location.origin })
    uppyInstance.use(Uppy.Url, { target: Uppy.Dashboard, companionUrl: document.location.origin })
    uppyInstance.use(Uppy.XHRUpload, { endpoint: document.location.origin + '/api/drop/upload-photo', fieldName: 'photo' })
}

export { configUppy }