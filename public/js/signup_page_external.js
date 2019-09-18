console.log("hi")




// Filestack upload
$("#btn-uploadpic").click(function(e){
    openPicker()
})
var PROFILE_PIC_URL = "";
var isExternalAvatar = true;
var fsClient = filestack.init('AVXbgNWER68pe9QHJmgwgz');
function openPicker() {
    fsClient.pick({
        accept: 'image/*',
        minFiles: 1,
        maxFiles: 1,
        maxSize: (100 * 1024 * 1024)
    }).then( (response) => {
        console.log(response);
        if(response.filesUploaded.length > 0){
            var url = response.filesUploaded[0].url
            PROFILE_PIC_URL = url
            previewProfilePic()
        }
    })
}

function previewProfilePic(){
    $("#self-profile-pic-placeholder").hide()
    $("#self-profile-pic").show().attr("style","background-image: url('"+PROFILE_PIC_URL+"')");
    $("#input-profile-pic").val(PROFILE_PIC_URL);
    isExternalAvatar = false;
}


// Form
$( "form" ).submit(function( event ) {
    // Upload profile pic to filestack if its the default one
    if(isExternalAvatar){
        var default_url = $("#self-profile-pic").data("defaultURL")
        
        console.log("Default url: ",default_url)
        fsClient.storeURL(default_url)
            .then(res => {
                console.log("Stored url: ",res);
                $("#input-profile-pic").val(res);
                return true;
            });
    }else{
        return true
    }
})

// Flash messages
function flash(type,message){
    console.log(type,message)
    if(type == "success"){
        var div_flash = $("#flash-success").show();
        var span_flash = div_flash.find("span")
        console.log(span_flash)
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        },2000)
    }
    if(type == "failure"){
        var div_flash = $("#flash-failure").show();
        var span_flash = div_flash.find("span")
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        },2000)
    }
}