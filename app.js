var express = require("express"),
    expressSession = require("express-session"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    flash = require("connect-flash");

var app = express();

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // for parsing application/json

app.use(expressSession({
    secret: "abcdef", // String a enviar num pedido 
    resave: false, // só guarda as seessions em  é feito o login,
    saveUninitialized: false // Não criar cookies a quem n fizer login
}));

// Passport
app.use(passport.initialize()); // Ligar express e passport
app.use(passport.session());
app.use(flash())
require("./config/passport.js")(passport)

// Setup flash messages
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.messageSuccess = req.flash("success");
    res.locals.messageFailure = req.flash("failure");
    next();
});

// Rotas
var indexRoute = require("./routes/index.js"),
    usersRoute = require("./routes/users.js"),
    dropsRoute = require("./routes/drops.js");
apiRoute = require("./routes/api.js")

app.use(indexRoute);
app.use(usersRoute);
app.use(dropsRoute);
app.use(apiRoute)

// Models
var Drop = require("./models/drop.js"),
    Post = require("./models/post.js"),
    Reply = require("./models/reply.js"),
    User = require("./models/user.js"),
    Hashtag = require("./models/hashtag.js")

// Controllers
var DatabaseCtrl = require("./controllers/database"),
    UserCtrl = require("./controllers/user"),
    IndexCtrl = require("./controllers/index"),
    DropsCtrl = require("./controllers/drops")


mongoose.connect("mongodb://localhost/SD1")
// mongoose.connect("mongodb://manueldois:LjsFtukW@ds211289.mlab.com:11289/spotdropv1");

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("server started on heroku host");
});

app.get("/", function (req, res) {
    res.render("homepage.ejs", { user: req.user });
});
app.get("/privacy", function (req, res) {
    res.render("privacy.ejs");
});

app.get("*", function (req, res) {
    res.send("<img src='https://www.completewebresources.com/wp-content/uploads/Rawnet.png'>");
});


