var mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
    drop: { //  Em k drop está
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    creation_date: String,
    comment: String,
    images: [String],

    likes_list: [{ // List dos users k fizeram like
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],  
    followers_list: [{ // emitir evento a todos os users k deixaram reply smp k há novas replies 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    replies_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply"
    }]
})

module.exports = mongoose.model("Post",PostSchema)