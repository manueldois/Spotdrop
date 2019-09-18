console.log("Start");
// Get data from EJS
var DROP;
var USER;
passData()
function passData(){
    var drop_data = $("#drop-data").data("drop")
    DROP = drop_data
    var user_data = $("#user-data").data("user")
    if(user_data != ""){
        USER = user_data;
    }else{
        USER = null
    }
    console.log("Drop: ",DROP)
}

// Check if there's a query
checkQuery()
function checkQuery(){
    var URLparams = new URL(window.location.href).searchParams;
    var post_id = URLparams.get("post")
    var img_num = URLparams.get("img_num")
    if(post_id){
        openLargerModal(post_id,img_num)
    }else{
        
    }

}

// Show full comment on click
$(".comment").click( function() {
    var h = $(this).prop('scrollHeight');
    $(this).css("height",h).css("max-height","");
})

// Open reply form
$(".btn-reply").click(function(){
    if($("#user-data").data("user")){
        var post = $(this).closest(".post")
        console.log("Reply to: ",post.data("post-id"));
        var form = $("#reply-form");
        form.appendTo(post).removeClass("d-none").attr("action","/drop/"+post.data("drop-id")+"/"+post.data("post-id")+"/newreply")    
    }else{
        flash("failure","You need to be logged in to reply")
    }
})

// Follow / unfollow btns
$("#btn-unfollow").click(function(){
    $("#btn-follow").show()
    $(this).hide()

    console.log("Unfollow")
    postUnfollow($(this).data("id"));
})
$("#btn-follow").click(function(){
    if($("#user-data").data("user")){
        $("#btn-unfollow").show() 
        $(this).hide()

        console.log("Follow")
        postFollow($(this).data("id"));
    }else{
        flash("failure","You need to be logged in to follow a drop")
    }
})
function postFollow(id){
    $.ajax({
        url: '/api/user/follow-drop',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "follow":id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error)
                flash("failure","Error following post")
            }else{
                console.log("Success follow")
                flash("success","Now following post")
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            flash("failure","You need to be logged in")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
        }
    });
}
function postUnfollow(id){
    $.ajax({
        url: '/api/user/unfollow-drop',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "unfollow":id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error);
                flash("failure","Error unfollowing post - "+data.error)
            }else{
                console.log("Success unfollow")
                flash("success","Unfollowed post")
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            flash("failure","You need to be logged in")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
        }
    });
}


// Like / dislike
renderLikeBtns()
$(".btn-star").click(function(){
    var btn = $(this);
    var post_id = btn.closest(".post").attr("data-post-id");
    console.log("Post: ",btn.closest(".post"), " id: ",post_id)
    console.log("btn-star: ",post_id);

    if(findIfILikePost(post_id)){
        postUnlike(post_id);
    }else{
        postLike(post_id);
    }
})
function renderLikeBtns(){
    var all_btns = $(".btn-star");
    for(var i = 0; i < all_btns.length; i++){
        var btn = all_btns.eq(i);
        var star = btn.find("img")
        var count = btn.next("span")
        var post_id = btn.closest(".post").attr("data-post-id")
        if(post_id){
            if(!findIfILikePost(post_id)){
                star.attr("src","/icons/star-outline.svg")
                btn.data("like","0")
            }else{
                star.attr("src","/icons/star-full-yellow.svg")
                btn.data("like","1")
            }
            count.html(findLikeCount(post_id)) 
        }
    }
}
function findLikeCount(post_id){
    var post = DROP.posts_list.find((post) => {
        return post._id == post_id
    })
    return post.likes_list.length;
}
function findIfILikePost(post_id){
    if(USER){
        var post = DROP.posts_list.find((post) => {
            return post._id == post_id
        })
        console.log("Post likes: ",post.likes_list)
        console.log("User id: ",USER._id)
        var index = post.likes_list.findIndex( (liker) => {
            return liker._id == USER._id;
        })
        console.log("Index: ",index)
        if(index > -1){
            console.log("Return true")
            return true
        }else{
            console.log("Return false")
            return false
        }
    }else{
        return false;
    }
}
function postLike(post_id){
    console.log("Liking")
    $.ajax({
        url: '/api/user/like-post',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "post":post_id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error)
                return false
            }else{
                console.log("Success like")
                var post = DROP.posts_list.find((post) => {
                    return post._id == post_id
                })
                post.likes_list.push({_id: USER._id})
                renderLikeBtns()
                return true;
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            flash("failure","You need to be logged in to like")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
            return false
        }
    });
}
function postUnlike(post_id){
    console.log("Disliking")
    $.ajax({
        url: '/api/user/dislike-post',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify( { "post":post_id } ),
        processData: false,
        success: function( data, textStatus, jQxhr ){
            if(data.status != 200){
                console.log("Error ",data.status, " ",data.error)
                return false
            }else{
                console.log("Success unlike")
                var post = DROP.posts_list.find((post) => {
                    return post._id == post_id
                })
                post.likes_list.pop()
                renderLikeBtns()
                return true
            }
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log("Error")
            flash("failure","You need to be logged in to like")
            console.log(JSON.stringify( textStatus ), JSON.stringify( errorThrown ));
            return false
        }
    });
}

// Filestack upload
$(".btn-add-img").click(function(){
    console.log("Clicked on btn add img")
    openPicker()
})
var ALL_UPLOADS = []
function previewUploads(url_list){
    $(".add-img").show()
    var div_preview = $("#sbar-form-img-col").html("");

    for(var i = 0; i < url_list.length; i++){
        var url = url_list[i];
        div_preview.append("<button type='button' class='btn btn-danger btn-remove btn-remove-img p-1 ml-auto'>Remove</button>")
        div_preview.append("<img src='"+url+"' class='w-100'>")
    }
    $(".btn-remove-img").click(function(){
        var btn = $(this);
        var img = btn.next()
        var img_url = img.attr("src")
        console.log("Remove img: ",img_url)
        var index = ALL_UPLOADS.findIndex((url) => {
            return url == img_url
        })
        ALL_UPLOADS.splice(index,1)
        previewUploads(ALL_UPLOADS)
    })
    $("#sbar-form-add-more").click(function(){
        console.log("Clicked on form upload")
        openPicker()
    })
    $("#input-urls").val(JSON.stringify(ALL_UPLOADS));
    console.log("All urls: ",ALL_UPLOADS);
    
}
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
            var url_list = response.filesUploaded.map( (metadata) => {
                return metadata.url
            })
            ALL_UPLOADS = ALL_UPLOADS.concat(url_list)
            previewUploads(ALL_UPLOADS)    
        }
    })
}


// Modal view larger
$(".img-grid-img").click(function(){
    openLargerModal($(this).closest(".row").data("post-id"),$(this).data("img-num"))
})
function openLargerModal(post_id,img_num){
    var vlmodal = $("#view-larger-modal")
    console.log("Open modal..")
    console.log("Post id: ",post_id)
    console.log("Img num: ",img_num)
    
    vlmodal.attr("data-post-id",post_id);
    // Reset like btn
    vlmodal.find(".btn-star").attr("src","/icons/star-outline.svg")
    
    var post = DROP.posts_list.find((post) => {
        return post._id == post_id
    })
    var img_url = post.images[img_num]

    vlmodal.find(".username").html(post.owner.username)
    console.log("Post date: ",post.creation_date)
    vlmodal.find(".txt-date").html(moment(post.creation_date).fromNow())
    vlmodal.find(".txt-date").data("converted",1)
    vlmodal.find(".likes-count").html(post.likes_list.length)
    vlmodal.find(".sbar-profile-img").css("background-image","url('"+post.owner.info.profile_pic+"')")
    vlmodal.find(".modal-post-img").attr("src",img_url)
    vlmodal.find(".modal-comment").text(post.comment)
    renderLikeBtns()
    vlmodal.modal("show")
    
}

// Flash messages
function flash(type,message){
    console.log("Flashing")
    console.log(type,message)
    if(type == "success"){
        var div_flash = $("#flash-success").show();
        var span_flash = div_flash.find("span")
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


// Show dates as time ago
var txt_date_list = $(".txt-date");
for(var i = 0; i < txt_date_list.length; i++){
    var el = txt_date_list.eq(i)
    if(el.data("date-iso") && (el.data("converted") == 0 || el.data("converted") == undefined)){
        var date_ISO = el.data("date-iso")
        el.html( moment(date_ISO).fromNow() )
        el.data("converted",1)
    }
}

// Handle erros nas images

// Redirect to user profile on click avatar
$(".sbar-profile-img").click(function(){
    var owner_id = $(this).closest(".post").data("owner-id");
    console.log(owner_id);
    var url = "/user/"+owner_id;
    $(location).attr('href',url)
})