var express = require("express");
var passport = require("passport");
var flash = require("connect-flash");
var UserCtrl = require("../controllers/user.js")

var app = express.Router();

app.get("/signup",UserCtrl.renderSignup)
app.post("/signup",UserCtrl.newUser)
app.post("/login", UserCtrl.login)
app.get("/logout",UserCtrl.logout)

app.get("/logingoogle",UserCtrl.loginGoogle)
app.get("/logingoogle/redirect",passport.authenticate("google"),UserCtrl.loginGoogleCB)

app.get("/loginfacebook",UserCtrl.loginFacebook) // Make the request
app.get("/loginfacebook/redirect",passport.authenticate("facebook"),UserCtrl.loginFacebookCB) // Catch the awsner 
// If user is new, redirect to sign-up-external

app.put("/completesignup",UserCtrl.completeSignup)
app.get("/user/:id",UserCtrl.renderUser)
app.delete("/user/:id", UserCtrl.isLoggedIn, UserCtrl.deleteAccount)


app.get("/myprofile",UserCtrl.isLoggedIn,UserCtrl.renderUserSelf)
app.put("/myprofile",UserCtrl.isLoggedIn,UserCtrl.editUser)

module.exports = app