var mongoose = require("mongoose");

var HashtagSchema = new mongoose.Schema({
    hashtag: String,
    color: String,
    creation_date: String,
    drops_using: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop"
    }]
})

module.exports = mongoose.model("Hashtag",HashtagSchema)