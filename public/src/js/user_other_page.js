import '../scss/user_other_page.scss';


// Get data from EJS
var USER_P;
var USER;
passData()
function passData(){
    var profile_data = $("#profile-data").data("profile");
    USER_P = profile_data;
    var user_data = $("#user-data").data("user");
    if(user_data){
        USER = user_data
    }else{
        USER = null
    }
    console.log("Profile: ",USER_P);
    console.log("User: ", USER);
}

// Render follow
renderFollow()
function renderFollow(){
    if(USER){
        $("#div-follow").show()
        var follwing = findIfIFollowUserP()
        if(follwing){
            $("#btn-follow").hide()
            $("#btn-unfollow").show()
            $("#following-info").html("Following this user")
        }else{
            $("#btn-follow").show()
            $("#btn-unfollow").hide()
            $("#following-info").html("")
        }
    }
}
function findIfIFollowUserP(){
    if(USER){
        // console.log("Users_following: ",USER.users_following)
        var index = USER.users_following.findIndex((following)=>{
            // console.log("User_P._id: ",USER_P._id)
            // console.log("Following: ",following)
            return following == USER_P._id
        })
        // console.log("Index: ",index)
        if(index > -1){
           return true; 
        }
        return false
    }
}

$("#btn-unfollow").click(function(){
    console.log("Unfollow")
    var success = postUnfollow();
    if(success){
        $("#btn-follow").show()
        $("#following-info").html("You are no longer following this user")
        $(this).hide()
    }
})
$("#btn-follow").click(function(){
    console.log("Follow")
    var success = postFollow();
    if(success){
        $("#btn-unfollow").show()
        $("#following-info").html("You are now following this user")
        $(this).hide()
    }    
})
function postFollow(){
    $.ajax({
        url: '/api/user/follow-user',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "follow":USER_P._id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error)
                flash("failure","error")
                return false
            }else{
                console.log("Success follow")
                flash("success","You are now following this user")
                USER.users_following.push(USER_P._id)
                renderFollow()
                return true
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
            flash("failure","error")
            return false
        }
    });
}
function postUnfollow(){
    $.ajax({
        url: '/api/user/unfollow-user',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "unfollow":USER_P._id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error)
                flash("failure","error")
                return false
            }else{
                console.log("Success unfollow")
                flash("success","You are no longer following this user")
                USER.users_following.pop()
                renderFollow()
                return true
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
            flash("failure","error")
            return false
        }
    });
}

// Convert date ISO to preety date
$(".txt-date").show(function(){
    var date_ISO = $(this).data("date")
    $(this).html(moment(date_ISO).format('MMMM Do YYYY'))
})
$(".txt-ago").show(function(){
    var date_ISO = $(this).data("date")
    $(this).html(moment(date_ISO).fromNow())
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
