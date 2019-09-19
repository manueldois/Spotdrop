
import '../scss/signup_page.scss';
import * as Uppy from 'uppy'
import 'uppy/dist/uppy.min.css'

var PROFILE_PIC_URL = "";
console.log("Signup pages")

const uppy = Uppy.Core({ allowMultipleUploads: false })
    .use(Uppy.Dashboard, {
        trigger: '#btn-uploadpic'
    })
    .use(Uppy.XHRUpload, { endpoint: 'http://localhost:3000/api/upload-profile', fieldName: 'avatar' })
    // .use(Uppy.GoogleDrive, { target: Uppy.Dashboard, companionUrl: 'http://localhost:3000', })

// Form
$("form").submit(function (event) {
    if ($("#input-profile-pic").val()) {
        if ($("input[name='password']").val() == $("input[name='confirmpassword']").val()) {
            return true
        } else {
            alert("Passwords dont match")
            event.preventDefault();
            return false
        }

    } else {
        alert("Upload a profile pic")
        event.preventDefault();
        return false
    }
})

// Flash messages
function flash(type, message) {
    console.log(type, message)
    if (type == "success") {
        var div_flash = $("#flash-success").show();
        var span_flash = div_flash.find("span")
        console.log(span_flash)
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        }, 2000)
    }
    if (type == "failure") {
        var div_flash = $("#flash-failure").show();
        var span_flash = div_flash.find("span")
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        }, 2000)
    }
}
