var mongoose = require("mongoose");

var ReplySchema = new mongoose.Schema({
    post: { //  Em k post está
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    creation_date: String,
    likes_list: [{ // List dos users k fizeram like
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comment: String
})

module.exports = mongoose.model("Reply",ReplySchema)