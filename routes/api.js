var express = require("express"),
    User = require("../models/user"),
    Drop = require("../models/drop"),
    Hashtag = require("../models/hashtag"),
    DatabaseCtrl = require("../controllers/database"),
    UserCtrl = require("../controllers/user"),
    StorageCtrl = require("../controllers/storage"),
    uuidv1 = require('uuid/v1'),
    escapeStringRegexp = require('escape-string-regexp');

var app = express.Router();

app.post('/api/drop/upload-photo', function(req, res, next){
    req.filePath = '/Drops'
    req.fileName = uuidv1()
    next()
}, StorageCtrl.upload.single('photo'), function (req, res) {
    console.log("Photo upload: ", req.file.cloudUrl)
    if(req.file && req.file.cloudUrl){
        res.status(200).json({cloudUrl: req.file.cloudUrl})
    }else{
        res.sendStatus(400)
    }
})
app.get("/api/drops", function (req, res) {

    var p_drops = DatabaseCtrl.getDropsToMap();
    p_drops.then((drops) => {
        var json_data = JSON.stringify({ success: true, drops: drops });
        res.json(json_data)
    }).catch((reason) => {
        res.json(JSON.stringify({ success: false, err: reason }))
    })

});
app.post("/api/user/follow-user", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post follow:")

    DatabaseCtrl.addUserFollow(req.user._id, req.body.follow).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/unfollow-user", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post unfollow:")

    DatabaseCtrl.removeUserFollow(req.user._id, req.body.unfollow).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/follow-drop", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post follow drop:")

    DatabaseCtrl.addDropFollow(req.user._id, req.body.follow).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/unfollow-drop", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post unfollow drop:")
    DatabaseCtrl.removeDropFollow(req.user._id, req.body.unfollow).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/like-post", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post like post:")

    DatabaseCtrl.likePost(req.user._id, req.body.post).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/dislike-post", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user post dislike post:")
    console.log("Req user: ", req.user)
    DatabaseCtrl.dislikePost(req.user._id, req.body.post).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/user/seen-drop", UserCtrl.isLoggedIn, function (req, res) {
    console.log("API user seen drop:")
    console.log("Req user: ", req.user.username)
    DatabaseCtrl.seenDrop(req.user._id, req.body.drop).then(() => {
        var response = {
            status: 200,
            success: 'Updated Successfully'
        }
        res.end(JSON.stringify(response));
    }).catch((reason) => {
        var response = {
            status: 400,
            error: reason
        }
        res.end(JSON.stringify(response));
    })
})
app.post("/api/search", function (req, res) {
    console.log("Search - ", req.body.search, " type - ", req.body.type)
    var string = escapeStringRegexp(req.body.search)
    var type = escapeStringRegexp(req.body.type)
    var regex = new RegExp(string, 'i')
    console.time("find")
    if (type == "all") {
        var p_users = User.find({ "username": regex }, "username info.name info.city info.profile_pic _id").limit(5).lean()
        var p_drops = Drop.find({ "title": regex }, "color icon location title").limit(5).lean()
        var p_hashtags = Hashtag.find({ "hashtag": regex }).limit(8).lean()
    } else if (type == "hashtag") {
        var p_users = Promise.resolve([])
        var p_drops = Promise.resolve([])
        var p_hashtags = Hashtag.find({ "hashtag": regex }).limit(8).lean()
    }

    Promise.all([p_users, p_drops, p_hashtags]).then((results) => {
        var users = results[0]
        var drops = results[1]
        var hashtags = results[2]
        console.log("Matches - ", results.length)
        console.log(results)
        console.timeEnd("find")
        var response = {
            status: 200,
            success: 'Search ok',
            results: { users: users, drops: drops, hashtags: hashtags }
        }
        res.end(JSON.stringify(response));
    })
})
module.exports = app