var passport = require("passport"),
    DatabaseCtrl = require("./database"),
    UserCtrl = require("./user")


exports.renderMap = function(req,res){
    if(req.isAuthenticated()){
        Promise.all([DatabaseCtrl.getFollowingNews(req.user._id),DatabaseCtrl.getNotifications(req.user._id)])
            .then( (results) => {
                var following_news = results[0];
                var notifications = results[1];
                res.render("map_page.ejs",{user: req.user, following_news: following_news, notifications: notifications})
            }).catch( (reason) => {
                req.flash("failure",reason)
                res.render("map_page.ejs",{user: null, following_news: null, notifications: null})
            } )
    }else{
        res.render("map_page.ejs",{user: null, following_news: null, notifications: null})
    }
}