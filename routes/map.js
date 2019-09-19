var express = require("express");
var passport = require("passport");

var MapCtrl = require("../controllers/map.js")

var app = express.Router();

app.get("/map",MapCtrl.renderMap)



module.exports = app