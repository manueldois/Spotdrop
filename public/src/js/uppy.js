import * as Uppy from 'uppy'
import 'uppy/dist/uppy.min.css'
import '@uppy/url/dist/style.css'

const uppy = Uppy.Core()
uppy.use(Uppy.Dashboard, { trigger: '.open-uppy' })
uppy.use(Uppy.GoogleDrive, { target: Uppy.Dashboard, companionUrl: document.location.origin})
uppy.use(Uppy.Instagram, { target: Uppy.Dashboard,  companionUrl: document.location.origin })
uppy.use(Uppy.Url, { target: Uppy.Dashboard,  companionUrl: document.location.origin })
uppy.use(Uppy.XHRUpload, { endpoint: document.location.origin + '/api/drop/upload-photo', fieldName: 'photo' })

export {uppy}