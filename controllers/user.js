var passport = require("passport"),
    User = require("../models/user"),
    DatabaseCtrl = require("../controllers/database"),
    util = require("util"),
    mongoose = require('mongoose');


exports.renderSignup = function (req, res) {
    res.render("signup_page.ejs", {})
}
exports.renderUser = function (req, res) {
    var user_p;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.sendStatus(400)
        return
    }
    DatabaseCtrl.getUsersAndDropsFollowing(req.params.id).then((user_found) => {
        user_p = user_found;
    }).then(() => {
        return DatabaseCtrl.getLatestActivity(req.params.id)
    }).then((latestActivity) => {
        if (req.user) {
            res.render("user_other_page.ejs", { user_p: user_p, user: req.user, latestActivity: latestActivity })
        } else {
            res.render("user_other_page.ejs", { user_p: user_p, user: null, latestActivity: latestActivity })
        }
    }).catch((reason) => {
        console.log("Err ", reason)
        res.redirect("/map")
    })
}
exports.renderUserSelf = function (req, res) {
    var users_following = [];
    var user_p;
    DatabaseCtrl.getUsersAndDropsFollowing(req.user._id).then((user_found) => {
        user_p = user_found;
        return DatabaseCtrl.getLatestActivity(user_p._id)
    }).then((latestActivity) => {
        res.render("user_self_page.ejs", { user: user_p, latestActivity: latestActivity })
    }).catch((reason) => {
        console.log("Err ", reason)
        res.redirect("/map")
    })
}

exports.newUser = passport.authenticate("local-signup", {
    successRedirect: "/map",
    failureRedirect: "/signup",
    failureFlash: true,
})
exports.login = passport.authenticate("local-login", {
    successRedirect: "/map",
    failureRedirect: "/map",
    failureFlash: true,
    passReqToCallback: true,
})
exports.loginGoogle = passport.authenticate("google", {
    scope: ['profile', 'email']
})
exports.loginGoogleCB = function (req, res) {
    console.log("Redirect login..", req.authInfo)

    if (req.authInfo.isNew) {
        res.render("signup_external_page.ejs", { user: req.authInfo.user })
    } else {
        req.flash("success", "Welcome back " + req.user.username)
        res.redirect("/map")
    }
}

exports.loginFacebook = passport.authenticate('facebook', { scope: ['email'] });
exports.loginFacebookCB = function (req, res) {
    console.log("Redirect login..", req.authInfo)

    if (req.authInfo.isNew) {

        res.render("signup_external_page.ejs", { user: req.authInfo.user })
    } else {
        req.flash("success", "Welcome back " + req.user.username)
        res.redirect("/map")
    }
}

exports.completeSignup = function (req, res) {
    console.log("Complete sign-up..");
    console.log("user id: ", req.user._id, " req.body: ", req.body)

    DatabaseCtrl.updateUserInfo(req.user._id, { username: req.body.username, city: req.body.city, about: "", profile_pic: req.body.profile_pic }).then((user_updated) => {
        req.login(user_updated, function (err) {
            if (err) { return next(err); }
            return res.redirect('/map');
        });
    }).catch((err) => {
        console.log("Error", err);
        res.redirect("/map")
    })
}

exports.logout = function (req, res) {
    req.logout();
    res.redirect("/");
}

exports.editUser = function (req, res) {
    console.log("Edit user: ", req.body.username)

    DatabaseCtrl.updateUserInfo(req.user._id, { username: req.body.username, city: req.body.city, about: req.body.about, profile_pic: req.body.profile_pic }).then(() => {
        req.flash("success", "Profile updated!")
        res.redirect("/myprofile")
    }).catch((err) => {
        console.log(err);
        req.flash("error", "Error updating profile")
        res.redirect("/myprofile")
    })
}

exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("User is not logged in")
    req.flash("failure", "You need to be logged in to view this page")
    res.redirect("/map");
}

exports.deleteAccount = async function (req, res, next) {
    console.log("Deleting user: ", req.user._id)
    try {
        await DatabaseCtrl.deleteUser(req.user._id)
        req.flash("success", "Your account has been deleted")
        req.logout()
        res.redirect("/map");
    } catch (error) {
        console.error(error)
        req.flash("error", error.toString())    
        res.redirect("/map");
    }

}