var express = require("express");
var passport = require("passport");

var DropsCtrl = require("../controllers/drops");


var app = express.Router();

app.get("/drop/:id",DropsCtrl.renderDrop)
app.post("/newdrop",DropsCtrl.isLoggedIn,DropsCtrl.newDrop);
app.post("/drop/:id/newpost",DropsCtrl.isLoggedIn,DropsCtrl.newPost);
app.post("/drop/:drop_id/:post_id/newreply",DropsCtrl.isLoggedIn,DropsCtrl.newReply)

module.exports = app