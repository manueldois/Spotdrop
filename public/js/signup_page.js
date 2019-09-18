console.log("hi")


// Filestack upload

$("#btn-uploadpic").click(function(e){
    openPicker()
})
var PROFILE_PIC_URL = "";
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
    $("#input-profile-pic").val(PROFILE_PIC_URL)
}


// Form
$( "form" ).submit(function( event ) {
    if($("#input-profile-pic").val()){
        if($("input[name='password']").val() == $("input[name='confirmpassword']").val()){
            return true
        }else{
            alert("Passwords dont match")
            event.preventDefault();
            return false
        }
        
    }else{
        alert("Upload a profile pic")
        event.preventDefault();
        return false
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
