var User = require("../models/user"),
    mongoose = require("mongoose"),
    LocalStrategy = require("passport-local").Strategy,
    GoogleStrategy = require("passport-google-oauth20"),
    FacebookStrategy = require('passport-facebook').Strategy,
    keys = require("./keys.js"),
    util = require("util")

module.exports = function(passport){

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // LOCAL
    passport.use("local-signup",new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true
        },handleSignup))
    
    async function handleSignup(req,username,password,done){
        console.log("Sign up")

        var p_user = User.findOne({"email": req.body.email})
        
        // Wait to find a user with the save name if exists
        p_user.then( (userfound) => {
            if (userfound){
                console.log("User already registered")
                return done(null,false,req.flash("failure","That email is already taken"))
            }else{
                return CreateUser(req)
            }
        }).catch( (reason) => {
            console.log("Error: ",reason)
            return done(reason)
        })

        await p_user;

        async function CreateUser(req){
            console.log("Creating user")
            var newUser = new User()
            newUser.username = req.body.username;
            newUser.email = req.body.email;
            newUser.login_type = "local";            
            newUser.info.name = req.body.name;
            newUser.info.city = req.body.city;
            newUser.info.profile_pic = req.body.profilepic;
            newUser.info.about = "";
            newUser.info.creation_date = new Date().toISOString();
            await newUser.generateHash(req.body.password).then( (hash) => {
                newUser.password = hash
                console.log("Hash: ",hash)
            })
            await newUser.save().then( (usersaved) => {
                console.log("User Saved: ", usersaved)
                req.login(usersaved,function(err){
                    return done(null, usersaved, req.flash("success","User created!"))
                })
            });
        }
                
        async function LoginUser(req,usersaved){
            await req.login(usersaved,function(err){
                return done(null, usersaved, req.flash("success","Sign up succesful!"))
            })
        } 
    }

    passport.use("local-login",new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
        },handleLogin));
    
    function handleLogin(req,username,password,done){
        console.log("Log in...")
        console.log("req.body : ",req.body)
        var p_user = User.findOne({"email": req.body.email}).exec();

        p_user.then(function(userfound){
            console.log("User: ",userfound)
            if(userfound){
                
                console.log("Found user: ",userfound.username);
                if(userfound.login_type == "local" && userfound.comparePassword(req.body.password,userfound.password)){
                    console.log("Password match")
                    return done(null,userfound,req.flash("success","Log in successful!"))
                }else{
                    console.log("Password wrong")
                    return done(null,false,req.flash("failure","Password wrong"))
                    // req.flash("success","Log in failed: wrong password")
                }
                
            }else{
                console.log("Log-in user not found");
                return done(null,false,req.flash("failure","User not found!"))
                // 
            }
        }).catch( (reason) => {
            console.log("catch error: ",reason)
            return done(reason)
        })
    }


    // GOOGLE
    passport.use("google",new GoogleStrategy({
        callbackURL: "https://spotdrop.herokuapp.com/logingoogle/redirect",
        clientID: "972621277016-llbl9uljfuqp6fsrtebmkg8c0rod4d5p.apps.googleusercontent.com",
        clientSecret: "l2QRnnZBL-haUoZIldDZ-J9C",
        profileFields: ['id', 'displayName','emails','picture.type(large)'],
        passReqToCallback: true
    },handleExternalLogin))

    // FACEBOOK
    passport.use("facebook",new FacebookStrategy({
        clientID: "162839377767254",
        clientSecret: "c04e6b9cdb703f52e0df203a039142ae",
        enableProof: true,
        callbackURL: "https://spotdrop.herokuapp.com/loginfacebook/redirect",
        profileFields: ['id', 'displayName','emails','picture.type(large)'],
        passReqToCallback: true
    }, handleExternalLogin))


    async function handleExternalLogin(req, accessToken, refreshToken, data, done){
        console.log("External login - ",util.inspect(data,true,null));
        console.log("Access token: ",accessToken)

        var provider = data.provider;
        if(provider == "facebook"){
            var name = data.displayName;
            var email = data.emails[0].value;
            var avatar = data.photos[0].value;
            var id = data.id;
        }
        if(provider == "google"){
            var name = data.displayName;
            var email = data.emails[0].value;
            var avatar = data.photos[0].value.split("?")[0]
            var id = data.id;
        }
        console.log("Avatar url: ",avatar)
        
        

        var p_user = User.findOne({"email": email}) // is the user already registered?

        p_user.then( (userfound) => {
            if (userfound){
                console.log("User already registered")
                return done(null,userfound,{isNew: false})
            }else{
                CreateExternalUser(name,email,avatar,id,provider).then( (usersaved) => { // if not create one
                    console.log("User Saved: ", usersaved)
                    return done(null, usersaved,{isNew: true, provider: provider, user: {email: email, name: name, avatar: avatar} })
                }); 
            }
        }).catch( (reason) => {
            console.log("Error: ",reason)
            return done(reason)
        })

        await p_user;

        async function CreateExternalUser(name,email,avatar,id,provider){
            console.log("Creating user")
            var newUser = new User()
            newUser.login_type = provider;
            newUser.external_id = id;
            newUser.username = "empty";
            newUser.email = email;
            newUser.info.name = name;
            newUser.info.city = "empty";
            newUser.info.profile_pic = avatar;
            newUser.info.about = "";
            newUser.info.creation_date = new Date().toISOString();
            await newUser.generateHash(provider).then( (hash) => {
                newUser.password = hash
                console.log("Hash: ",hash)
            })
            return newUser.save();
        }
    }
}