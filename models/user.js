var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs")

var UserSchema = new mongoose.Schema({
    info: {
        name: String,
        city: String,
        profile_pic: String,
        about: String,
        creation_date: String,
    },
    username: String,
    email: String,
    login_type: String,
    external_id: String,
    password: String,

    drops_list: [{ // Historico do user
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop"
    }],
    posts_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    replies_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply"
    }],

    drops_following: [{ // Variavel
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop"
    }],
    users_following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    users_followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],


    following_news: [], 
    notifications: [], // Nova atividade sobre mim (nos meus drops/posts), novo user a seguir-me, public announcements sobre o novidades na área, etc
    new_notifications: Number, // Reset smp k user vê as notificações tipo face
    drops_seen: [{ // Drops k o user já viu. Se estiverem la lista aparecem mais pequenos no mapa
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drop"
    }]
})
UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.generateHash = function(password){
    return new Promise( (resolve, reject) => {
        bcrypt.genSalt(12, function(salt){
            bcrypt.hash(password,salt , null, function(err,hash){
                if(err){ reject(err) }else{
                    resolve(hash)
                }
            })
            
        })
    })
}
UserSchema.methods.comparePassword = function(password,hash){
   return bcrypt.compareSync(password, hash);
}

module.exports = mongoose.model("User",UserSchema)