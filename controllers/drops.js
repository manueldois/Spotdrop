var passport = require("passport"),
    Drop = require("../models/drop"),
    Post = require("../models/post"),
    Reply = require("../models/reply"),
    User = require("../models/user"),
    Hashtag = require("../models/hashtag"),
    DatabaseCtrl = require("../controllers/database"),
    util = require('util');

exports.renderDrop = function(req,res){
    DatabaseCtrl.getDropToPage(req.params.id).then( (drop) => {

        var isFollowing = false;
        if(req.user){
            var index = drop.followers_list.findIndex( (follower) => {
                return req.user._id.equals(follower)
            })
            if(index > -1){
                isFollowing = true;
            }
            console.log("Is following, index: ",index)
            res.render("drop_page.ejs",{drop: drop, user: req.user, isFollowing: isFollowing})
        }else{
            res.render("drop_page.ejs",{drop: drop, user: null, isFollowing: false})
        }
        
    }).catch( (err) => {
        req.flash("failure",err);
        res.render("index.ejs")
    } )
}
exports.newDrop = function(req,res){
    console.log("Saving new drop")

    var location = JSON.parse(req.body.location)
    var img_urls = JSON.parse(req.body.urls)

    var newDrop = new Drop();
    
    newDrop.creation_date = new Date().toISOString();
    newDrop.location = {
        lat: location.lat,
        lon: location.lon,
        name: req.body.place
    }
    newDrop.title = req.body.title;
    // Hashtag. If exists use that one. If not create one
    Hashtag.findOne({"hashtag":req.body.hashtag}).then(function(hashtag){
        console.log("Hashtag: ",hashtag)
        if(hashtag){
            newDrop.hashtag = hashtag._id;
        }else{
            var new_hashtag = new Hashtag({
                creation_date: new Date().toISOString(),
                hashtag: req.body.hashtag,
                color: req.body.color,
                drops_using: [newDrop._id]
            })
            console.log("Saving new hashtag: ",new_hashtag)
            newDrop.hashtag = new_hashtag._id;
            new_hashtag.save()
        }
    }).then( () => {
        console.log("Drop hashtag: ",newDrop.hashtag)
        
        var icon_url = img_urls[0].split("/");
        icon_url = icon_url[icon_url.length -1] // Select last element
        newDrop.icon = "https://process.filestackapi.com/resize=width:60,height:60,fit:crop/"+icon_url;

        var newPost = new Post();
        newPost.comment = req.body.comment;
        newPost.images = img_urls;

        User.findById(req.user._id,function(err,user_found){ 
            newDrop.owner = user_found._id;
            console.log("User found ",user_found.username)
            if(user_found){
                DatabaseCtrl.saveNewDrop(newDrop,newPost).then( () => {
                    req.flash("success","Drop saved successfuly!")
                    res.redirect("/index")
                }).catch( (reason) => {
                    req.flash("failure",reason)
                    res.redirect("/index")
                })
            }else{
                console.log("Did not find that user")
                req.flash("failure","Did not find that user")
                res.redirect("/index")
            }
        })
    }).catch(err => console.log(err))
}
exports.newPost = function(req,res){
    console.log("Saving new post")

    if(req.body.urls){
        var img_urls = JSON.parse(req.body.urls)
    }else{
        var img_urls = null
    }  

    var newPost = new Post();
    newPost.drop = req.params.id;
    newPost.owner = req.user._id;
    newPost.creation_date = new Date().toISOString();
    if(img_urls){
        newPost.images = img_urls;
    }
    newPost.comment = req.body.comment;

    DatabaseCtrl.saveNewPost(newPost).then( (post) => {
        if(post){
            console.log("New post:",post.comment)
            req.flash("success","Post submitted!")
            res.redirect("/drop/"+req.params.id)
        }else{
            console.log("Failed to save post")
            req.flash("Failure","Failed to submit post")
            res.redirect("/drop/"+req.params.id)
        }
    }); // quero ficar à espera k o drop entre da DB para só dps fazer refresh da pagina
}
exports.newReply = function(req,res){
    console.log("Saving new reply")
    var comment = req.body.comment;

    var newReply = new Reply();
    newReply.owner = req.user._id;
    newReply.post = req.params.post_id;
    newReply.creation_date = new Date().toISOString();
    newReply.comment = comment;

    DatabaseCtrl.saveNewReply(newReply).then( (reply) => {
        console.log("New reply: ",reply)
        res.redirect("/drop/"+req.params.drop_id)
    })
}
exports.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("failure","You need to be logged in to view this page")
    res.redirect("/index");    
}