var express = require("express"),
    expressSession = require("express-session"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    flash = require("connect-flash"),
    companion = require("@uppy/companion")

mongoose.connect("mongodb://localhost/SD1", err => {
    if (err) { console.error("Cannot connect to DB: ", err); process.exit() }
})


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

// Companion
const options = {
    providerOptions: {
        google: {
            key: 'GOOGLE_KEY',
            secret: 'GOOGLE_SECRET'
        }
    },
    server: {
        host: 'localhost:3000',
        protocol: 'http',
    },
    filePath: '/uploads'
}

app.use(companion.app(options))

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
var mapRoute = require("./routes/map.js"),
    usersRoute = require("./routes/users.js"),
    dropsRoute = require("./routes/drops.js"),
    apiRoute = require("./routes/api.js");

app.use(mapRoute);
app.use(usersRoute);
app.use(dropsRoute);
app.use(apiRoute)


app.listen(process.env.PORT || 3000, process.env.IP || 'localhost', function () {
    console.log(`Server started on: http://${process.env.IP || 'localhost'}:${process.env.PORT || 3000}`);
});

app.get("/", function (req, res) {
    res.render("home_page.ejs", { user: req.user });
});
app.get("/privacy", function (req, res) {
    res.render("privacy.ejs");
});

app.get("*", function (req, res) {
    res.send("<img src='https://www.completewebresources.com/wp-content/uploads/Rawnet.png'>");
});


