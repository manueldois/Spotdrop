var passport = require("passport"),
    User = require("../models/user"),
    DatabaseCtrl = require("../controllers/database"),
    util = require("util")


exports.renderSignup = function(req,res){
    res.render("sign-up.ejs",{})
}
exports.renderUser = function(req,res){
    console.log("Render User: ",req.params.id)

    var user_p;
    DatabaseCtrl.getUsersAndDropsFollowing(req.params.id).then( (user_found) => {
        user_p = user_found;
     }).then( () => {
        return DatabaseCtrl.getLatestActivity(req.params.id)
     }).then( (latestActivity) => {
        console.log("User found ",user_p.username)
        if(req.user){
            res.render("user-profile.ejs",{user_p: user_p, user: req.user, latestActivity: latestActivity})
        }else{
            res.render("user-profile.ejs",{user_p: user_p, user: null, latestActivity: latestActivity})
        }
     }).catch( (reason) => {
        console.log("Err ",reason)
        res.redirect("/index")
    })    
}
exports.renderUserSelf = function(req,res){
    var users_following = [];
    var user_p;
    console.log("Render user self");
    
    DatabaseCtrl.getUsersAndDropsFollowing(req.user._id).then( (user_found) => {
        console.log("User found ",user_found)
        user_p = user_found;
        return DatabaseCtrl.getLatestActivity(user_p._id)
    }).then( (latestActivity) => {
        res.render("user-profile-self.ejs",{user: user_p, latestActivity: latestActivity})
    }).catch( (reason) => {
        console.log("Err ",reason)
        res.redirect("/index")
    })    
}

exports.newUser = passport.authenticate("local-signup",{
    successRedirect: "/index",
    failureRedirect: "/signup",
    failureFlash: true,
})
exports.login = passport.authenticate("local-login",{
    successRedirect: "/index",
    failureRedirect: "/index",
    failureFlash: true,
    passReqToCallback:true,
})
exports.loginGoogle = passport.authenticate("google",{
    scope: ['profile','email']
})
exports.loginGoogleCB = function(req,res){
    console.log("Redirect login..",req.authInfo)

    if(req.authInfo.isNew){
        res.render("sign-up-external.ejs",{user: req.authInfo.user})
    }else{
        req.flash("success","Welcome back "+req.user.username)
        res.redirect("/index")
    }
}

exports.loginFacebook = passport.authenticate('facebook', { scope : ['email'] });
exports.loginFacebookCB = function(req,res){
    console.log("Redirect login..",req.authInfo)

    if(req.authInfo.isNew){
     
        res.render("sign-up-external.ejs",{user: req.authInfo.user})
    }else{
        req.flash("success","Welcome back "+req.user.username)
        res.redirect("/index")
    }
}

exports.completeSignup = function(req,res){
    console.log("Complete sign-up..");
    console.log("user id: ",req.user._id, " req.body: ",req.body)

    DatabaseCtrl.updateUserInfo(req.user._id,{username: req.body.username, city: req.body.city, about: "", profile_pic: req.body.profile_pic}).then( (user_updated) => {
        req.login(user_updated, function(err) {
            if (err) { return next(err); }
            return res.redirect('/index');
        });
    }).catch( (err) => {
        console.log("Error",err);
        res.redirect("/index")
    })
}

exports.logout = function(req,res){
    req.logout();
    res.redirect("/");
}

exports.editUser = function(req,res){
    console.log("Edit user: ", req.body.username)
    
    DatabaseCtrl.updateUserInfo(req.user._id,{username: req.body.username, city: req.body.city, about: req.body.about, profile_pic: req.body.profile_pic}).then( () => {
        req.flash("success","Profile updated!")
        res.redirect("/myprofile")
    }).catch( (err) => {
        console.log(err);
        req.flash("error","Error updating profile")
        res.redirect("/myprofile")
    })
}

exports.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    console.log("User is not logged in")
    req.flash("failure","You need to be logged in to view this page")
    res.redirect("/index");    
}
