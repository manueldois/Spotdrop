var express = require("express");
var passport = require("passport");

var IndexCtrl = require("../controllers/index.js")

var app = express.Router();

app.get("/index",IndexCtrl.renderIndex)



module.exports = app