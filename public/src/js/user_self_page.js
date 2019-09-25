import '../scss/user_self_page.scss';
import * as Uppy from 'uppy'
import 'uppy/dist/uppy.min.css'


$(".btn-edit").click(function (e) {
    var input = $("#" + $(this).data().input);
    input.removeAttr("readonly");
    input.focus()
    $("#btn-submit").removeClass("d-none")
    return false
})

// Profile pic via Uppy
const uppy = Uppy.Core({allowMultipleUploads: false})
    .use(Uppy.Dashboard, { trigger: '.open-uppy' })
    .use(Uppy.XHRUpload, { endpoint: '/api/drop/upload-photo', fieldName: 'photo' })
    .on('complete', (result) => {
        if (result.successful.length > 0) {
            const url_list = result.successful.map(upload_event => {
                return upload_event.response.body.cloudUrl["_4x"]
            })
            console.log("Uploaded url: ", result.successful, "url_list: ", url_list)
            $("#input-profile-pic").val(url_list[0])
            $('#self-profile-pic').css("background-image", `url(${url_list[0]})`)
        }
        uppy.getPlugin('Dashboard').closeModal()
    })


function modalCopyUrl() {
    var input = $("#input-profile-pic-modal");
    $("#input-profile-pic").val(input.val());
    $("#self-profile-pic").attr("style", "background-image: url('" + input.val() + "')");
}

// handle Unfollow user/post
$(".btn-remove").click(function () {
    $(this).parent().hide()
    var type = $(this).data("type");
    var id = $(this).data("id");
    console.log("Unfollow ", type, id)
    if (type == "user") {
        postUnfollowUser(id);
    }
    if (type == "drop") {
        postUnfollowDrop(id)
    }

})
function postUnfollowUser(id) {
    $.ajax({
        url: '/api/user/unfollow-user',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ "unfollow": id }),
        processData: false,
        success: function (data, textStatus, jQxhr) {
            if (data.status != 200) {
                console.log("Error ", data.status, " ", data.error)
            } else {
                console.log("Success unfollow")
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("Error")
            console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));
        }
    });
}
function postUnfollowDrop(id) {
    $.ajax({
        url: '/api/user/unfollow-drop',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ "unfollow": id }),
        processData: false,
        success: function (data, textStatus, jQxhr) {
            if (data.status != 200) {
                console.log("Error ", data.status, " ", data.error)
            } else {
                console.log("Success unfollow")
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("Error")
            console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));
        }
    });
}

// Convert date ISO to preety date
$(".txt-date").show(function () {
    var date_ISO = $(this).data("date")
    $(this).html(moment(date_ISO).format('MMMM Do YYYY'))
})
$(".txt-ago").show(function () {
    var date_ISO = $(this).data("date")
    $(this).html(moment(date_ISO).fromNow())
})

// Flash messages
window.flash = flash
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
