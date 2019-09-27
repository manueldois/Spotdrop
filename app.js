const express = require("express"),
    expressSession = require("express-session"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    flash = require("connect-flash");

// Load APP_SECRET from .env
require('dotenv').config()
// Decrypt keys
require('./config/decrypt_keys').decryptAll(process.env['APP_SECRET'])


const MLABS_KEYS = require('./config/keys_plaintext/mlabs')
mongoose.connect(process.env['NODE_ENV'] === 'development' ? "mongodb://localhost/SD1" :
    `mongodb://${MLABS_KEYS.dbUser}:${MLABS_KEYS.dbPassword}@ds021884.mlab.com:21884/spotdrop`, err => {
        if (err) { console.error("Cannot connect to DB: ", err); process.exit() }
    })


var app = express();


app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(methodOverride("Access-Control-Allow-Methods"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: ['application/json','text/plain']}));


app.use(expressSession({
    secret: "hiohiihohyihiolsjoidiopiu8yiok", // String a enviar num pedido 
    resave: false, // só guarda as seessions em  é feito o login,
    saveUninitialized: false, // Não criar cookies a quem n fizer login
}));

// Attach Companion App 
const companionController = require('./controllers/companion')
app.use(companionController.router)

// Passport
app.use(passport.initialize()); // Ligar express e passport
app.use(passport.session());
app.use(flash())
require("./controllers/passport.js")(passport)

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

app.get("/", function (req, res) {
    res.render("home_page.ejs", { user: req.user });
});

app.get("/privacy", function (req, res) {
    res.render("privacy.ejs");
});

app.get("*", function (req, res) {
    res.send("<img src='https://www.completewebresources.com/wp-content/uploads/Rawnet.png'>");
});




// Start server
const server = app.listen(process.env.PORT || 3000, function () {
    console.log(`Server started on: ${process.env.PORT || 3000}`);
});
companionController.attachWebSocket(server)



