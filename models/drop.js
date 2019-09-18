var mongoose = require("mongoose");

var DropSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    creation_date: String,
    location: {
        lat: Number,
        lon: Number,
        name: String
    },
    hashtag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hashtag"
    },
    title: String,
    icon: String, 
    
    followers_list: [{ // emitir evento a todos os users k estão a fazer follow qnd há novos posts
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    posts_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    creation_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    best_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }
   
})

module.exports = mongoose.model("Drop",DropSchema)