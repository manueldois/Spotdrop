const User = require("../models/user"),
  Drop = require("../models/drop"),
  Post = require("../models/post");



function saveNewUser(user) {
  // console.log("Saving user: "+user.info.name)
  return user.save()
}
function saveNewDrop(drop, first_post) {

  first_post.owner = drop.owner;
  first_post.drop = drop._id;
  first_post.creation_date = drop.creation_date;

  drop.posts_list = [first_post._id]
  drop.creation_post = first_post._id;
  drop.best_post = null;

  return new Promise((resolve, reject) => {
    var p_save_drop = drop.save(); // Salvar o drop
    var p_save_post = first_post.save() // Salvar o post
    p_save_post.then(() => { return p_save_drop }).then(drop_saved => {
      // Guardar novo drop e novo post na lista de drops e posts do owner
      User.findById(drop_saved.owner)
        .exec(function (err, user_found) {
          if (err || !user_found) {
            reject("Failed to saved drop")
          }
          user_found.drops_list.push(drop_saved._id);
          user_found.posts_list.push(first_post._id); // first_post já tem ID qnd é criado

          // Enviar noticia a todos os followers do user
          var news = {
            type: "new drop",
            objectId: drop_saved._id,
            title: drop_saved.title,
            hashtag: drop_saved.hashtag,
            color: drop_saved.color,
            thumbnail: first_post.images[0],
            owner: {
              username: user_found.username,
              id: user_found._id
            },
            date: new Date().toISOString()
          }
          var criteria = {
            _id: { $in: user_found.users_followers }
          }
          User.update(criteria, { $push: { following_news: news } }, { multi: true }, function (err, raw) {
            if (err) { console.log(err) }
          })

          user_found.save().then(() => resolve(drop_saved)) // Return do drop guardado
        })
    })
  })
}
function saveNewPost(post) {
  User.findById(post.owner, function (err, user_found) {
    if (user_found) {
      console.log("Found user: ", user_found.username)
      user_found.posts_list.push(post._id);
      user_found.save()
    } else {
      console.log("Did not find that user")
    }

    Drop.findById(post.drop).populate([{
      path: "creation_post",
      model: "Post",
      select: "images",
    }]).exec(function (err, drop_found) {
      if (drop_found) {
        console.log("Found drop: ", drop_found._id);
        drop_found.posts_list.push(post._id);
        drop_found.save()

        // Enviar novidade a todos os k seguem este drop
        var thumbnail = user_found.info.profile_pic
        var news = {
          type: "new post",
          objectId: drop_found._id,
          title: drop_found.title,
          hashtag: drop_found.hashtag,
          color: drop_found.color,
          thumbnail: thumbnail,
          owner: {
            username: user_found.username,
            id: user_found._id
          },
          date: new Date().toISOString()
        }

        var criteria = {
          _id: { $in: drop_found.followers_list }
        }
        User.update(criteria, { $push: { following_news: news } }, { multi: true }, function (err, raw) {
          if (err) { console.log(err) }
        })
        // E ao dono do drop
        User.update({ _id: drop_found.owner }, { $push: { notifications: news } }, function (err, raw) {
          if (err) { console.log(err) }
        })

      } else {
        console.log("Did not find that drop")
      }
    })
  })

  return post.save();
}
function saveNewReply(reply) {
  User.findById(reply.owner, function (err, user_found) { // Não é preciso esperar por isto
    user_found.replies_list.push(reply._id);
    user_found.save()

    Post.findById(reply.post).populate([{
      path: "drop",
      model: "Drop",
      select: "title hashtag title color followers_list _id",
    }]).exec(function (err, post_found) {
      post_found.replies_list.push(reply._id)
      post_found.save()

      // Enviar novidade ao dono do post
      var thumbnail = user_found.info.profile_pic
      var news = {
        type: "new reply",
        objectId: post_found.drop._id,
        title: post_found.drop.title,
        hashtag: post_found.drop.hashtag,
        color: post_found.drop.color,
        thumbnail: thumbnail,
        owner: {
          username: user_found.username,
          id: user_found._id
        },
        date: new Date().toISOString()
      }

      User.update({ _id: post_found.owner }, { $push: { notifications: news } }, function (err, raw) {
        if (err) { console.log(err) }
      })

    })
  })
  return reply.save();
}
function saveNewHashtag(hashtag) {
  return hashtag.save()
}

exports.saveNewUser = saveNewUser;
exports.saveNewDrop = saveNewDrop;
exports.saveNewPost = saveNewPost;
exports.saveNewReply = saveNewReply;

exports.getDropsToMap = function () {
  return new Promise((resolve, reject) => {
    Drop.find({}).populate([{
      path: "owner",
      model: "User",
      select: "username info _id",
    }, {
      path: "creation_post",
      model: "Post"
    }, {
      path: "hashtag",
      model: "Hashtag"
    }, {
      path: "best_post",
      model: "Post"
    }]).exec(function (err, drops) {
      if (err) { console.log(err); reject(err) }

      resolve(drops)
    })
  })
}
exports.getDropToPage = function (drop_id) {
  return new Promise((resolve, reject) => {

    Drop.findById(drop_id).populate([
      {
        path: "owner",
        model: "User",
        select: "username info.profile_pic _id",
      }, {
        path: "posts_list",
        model: "Post",
        populate: [{
          path: 'replies_list',
          model: 'Reply',
          populate: {
            path: 'owner',
            model: "User",
            select: "username info _id",
          }
        }, {
          path: 'owner',
          model: "User",
          select: "username info.profile_pic _id",
        }, {
          path: 'likes_list',
          model: 'User',
          select: "_id",
        }]
      }, {
        path: "best_post",
        model: "Post"
      }, {
        path: "hashtag",
        model: "Hashtag"
      }
    ]).exec(function (err, drop) {
      if (err) { console.log(err); reject(err) }
      drop.posts_list.forEach(post => {
        post.images = post.images.map(urls_concat => urls_concat.split(', ')[0])
      })
      resolve(drop)
    })

  })
}
exports.getFollowingNews = function (user_id) {

  return new Promise((resolve, reject) => {
    User.findById(user_id).then((user) => {
      if (!user) { reject("User not found") }

      resolve(user.following_news)
    })
  })

}
exports.getNotifications = function (user_id) {
  return new Promise((resolve, reject) => {
    User.findById(user_id).then((user) => {
      if (!user) { reject("User not found") }

      resolve(user.notifications)

    })
  })
}
exports.getLatestActivity = function (user_id) { // only drops
  var drops_id = [];
  return new Promise((resolve, reject) => {
    User.findById(user_id).then((user) => {
      if (!user) { reject("User not found") }
      drops_id = user.drops_list.slice(0, 50)

      var criteria = {
        _id: { $in: drops_id }
      }
      var p_drops = Drop.find(criteria).populate([{
        path: "creation_post",
        model: "Post",
        select: "images comment _id"
      }]).exec()

      p_drops.then(drops => {
        drops.forEach(drop => {
          if (drop.creation_post.images) {
            drop.creation_post.images = drop.creation_post.images.map(urls_concat => {
              if(urls_concat){
                return urls_concat.split(', ')[0]
              }else{
                return ''
              }
            })
          }
        })
        resolve(drops)
      })

    })
  })
}

exports.updateUserInfo = function (user_id, new_info) {
  console.log("Updating user..")
  return User.findByIdAndUpdate(user_id, { "username": new_info.username, "info.about": new_info.about, "info.profile_pic": new_info.profile_pic, "info.city": new_info.city }, { new: true }).exec()
}
exports.getUsersAndDropsFollowing = function (user_id) {

  return new Promise((resolve, reject) => {
    User.findById(user_id).populate([{
      path: "users_following",
      model: "User",
      select: "username info.profile_pic _id",
    }, {
      path: "drops_following",
      model: "Drop",
      select: "title _id"
    }]).exec(function (err, user_found) {
      if (!user_found) {
        console.log("Didnt find that user");
        reject("Didnt find that user")
      } else {
        resolve(user_found)
      }
    })
  })

}

exports.addUserFollow = function (user_id, user_follow) {
  console.log("Adding new user to following list..")

  return new Promise((resolve, reject) => {
    User.findById(user_id, function (err, user_found) {
      if (user_found != null) {

        console.log("Found user: ", user_found.username);
        if (user_found.users_following.find(function (id) {
          return id.equals(user_follow)
        })) {
          console.log("Already following that user")
          reject("Already following that user")
        } else {

          User.findById(user_follow, function (err, new_user_found) {
            if (new_user_found) {
              console.log("Added new following: ", new_user_found.username)
              // Add new following to user
              user_found.users_following.push(user_follow);
              user_found.save()
              // Add new follower to user_follow
              new_user_found.users_followers.push(user_id);

              // Enviar novidade a todos os k seguem este drop
              var thumbnail = user_found.info.profile_pic
              var news = {
                type: "new follower",
                objectId: user_found._id,
                thumbnail: thumbnail,
                owner: {
                  username: user_found.username,
                  id: user_found._id
                },
                date: new Date().toISOString()
              }
              new_user_found.notifications.push(news)
              new_user_found.save()
              resolve()
            } else {
              console.log("Failed to find user to follow")
              reject("Failed to find user to follow")
            }

          })
        }

      } else {
        console.log("Did not find that user ", err);
        reject("Did not find that user")
      }
    })

  })
}
exports.removeUserFollow = function (user_id, user_unfollow) {
  console.log("Removing user from follow list..")

  return new Promise((resolve, reject) => {
    User.findById(user_id, function (err, user_found) {
      console.log("Found user: ", user_found.username);
      if (user_found != null) {

        User.findById(user_unfollow, function (err, new_user_found) {
          if (new_user_found) {

            console.log("Removing following: ", new_user_found.username)
            var index = user_found.users_following.findIndex(function (id) {
              return id.equals(user_unfollow)
            })
            if (index > -1) {
              console.log("Stopped following that user")
              // Remove follower from my following list
              user_found.users_following.splice(index, 1)
              user_found.save().then(() => {
                // Remove follower from user_unfollow followers list
                var index = new_user_found.users_followers.findIndex(function (id) {
                  return id.equals(user_id)
                })
                if (index > -1) {
                  new_user_found.users_followers.splice(index, 1)
                  new_user_found.save().catch((err) => {
                    console.log("Error: ", err)
                  })
                  resolve()
                } else {
                  console.log("Users lists not matching")
                }
              })

            } else {
              console.log("Not following user")
              reject("Not following user")
            }

          } else {
            console.log("Failed to find user to unfollow")
            reject("Failed to find user to unfollow")
          }

        })

      } else {
        console.log("Did not find that user ", err);
        reject("Did not find that user")
      }
    })
  })

}

exports.addDropFollow = function (user_id, drop_follow) {
  console.log("Adding new drop to follow..", drop_follow)

  return new Promise((resolve, reject) => {
    User.findById(user_id, function (err, user_found) {
      if (user_found != null) {
        console.log("Found user: ", user_found.username);
        if (user_found.drops_following.find(function (id) {
          return id.equals(drop_follow)
        })) {
          console.log("Already following that drop")
          reject("Already following that drop")
        } else {
          Drop.findById(drop_follow, function (err, drop_found) {
            if (drop_found) {
              console.log("Added new following")
              user_found.drops_following.push(drop_follow);
              user_found.save()

              drop_found.followers_list.push(user_id)
              drop_found.save()
              resolve()
            } else {
              console.log("Failed to find drop to follow")
              reject("Failed to find drop to follow")
            }

          })
        }

      } else {
        console.log("Did not find that user ", err);
        reject("Did not find that user")
      }
    })

  })

}
exports.removeDropFollow = function (user_id, drop_unfollow) {
  console.log("Unfollowing drop: ", drop_unfollow)

  return new Promise((resolve, reject) => {
    User.findById(user_id, function (err, user_found) {
      if (user_found != null) {
        console.log("Found user: ", user_found.username);
        var index = user_found.drops_following.findIndex(function (id) {
          return id.equals(drop_unfollow)
        })
        if (index >= 0) {
          console.log("Stopped following that drop")
          user_found.drops_following.splice(index, 1)
          user_found.save()

          // Remover tmb do drop
          Drop.findById(drop_unfollow, function (err, drop_found) {
            index = drop_found.followers_list.findIndex(function (id) {
              return id.equals(user_id)
            })
            if (index >= 0) {
              console.log("Removed user from drop followers list")
              drop_found.followers_list.splice(index, 1)
              drop_found.save()
            }
          })

        } else {
          console.log("Not following drop")
          reject("Not following drop")
        }

      } else {
        console.log("Did not find that user ", err);
        reject("Did not find that user")
      }
    })

  })
}

exports.likePost = function (user_id, post_like) {
  console.log("Liking the post..")

  return new Promise((resolve, reject) => {
    Post.findById(post_like).populate([{
      path: "drop",
      model: "Drop",
      select: "title hashtag title color creation_post followers_list _id",
      populate: {
        path: 'creation_post',
        model: 'Post',
        select: 'images'
      }
    }]).exec(function (err, post_found) {
      console.log("Found post: ", post_found)
      if (post_found) {

        var index = post_found.likes_list.findIndex((id) => {
          var result = id.equals(user_id)
          return result
        })
        if (index >= 0) {
          console.log("Already liked");
          reject("Already liked")
        } else {
          console.log("Liking");
          post_found.likes_list.push(user_id);
          post_found.save()

          // Alertar o dono do post k tem um novo like

          User.findById(user_id).exec(function (err, user_found) {
            var thumbnail = user_found.info.profile_pic
            var news = {
              type: "new like",
              objectId: post_found.drop._id,
              title: post_found.drop.title,
              hashtag: post_found.drop.hashtag,
              color: post_found.drop.color,
              thumbnail: thumbnail,
              owner: {
                username: user_found.username,
                id: user_found._id
              },
              date: new Date().toISOString()
            }

            User.update({ _id: post_found.owner }, { $push: { notifications: news } }, function (err, raw) {
              if (err) { console.log(err) }
            })
          })

          resolve()
        }
      } else {
        console.log("Did not find that post");
        reject("Did not find that post")
      }
    })
  })
}
exports.dislikePost = function (user_id, post_like) {
  console.log("Disliking the post..")

  return new Promise((resolve, reject) => {
    Post.findById(post_like, function (err, post_found) {
      if (post_found) {
        console.log("Found post: ", post_found.comment)
        var index = post_found.likes_list.findIndex((id) => {
          return id.equals(user_id)
        })
        if (index >= 0) {
          console.log("Already liked");
          post_found.likes_list.splice(index, 1)
          post_found.save()
          resolve()
        } else {
          console.log("Didnt like the post anyway");
          reject("Didnt like the post anyway")
        }
      } else {
        console.log("Did not find that post");
        reject("Did not find that post")
      }
    })
  })
}

exports.seenDrop = function (user_id, drop_id) {
  return new Promise((resolve, reject) => {
    User.findById(user_id, function (err, user_found) {
      if (err) {
        reject(err)
      }
      if (user_found.drops_seen.find((drop_seen_id) => {
        return drop_seen_id.equals(drop_id)
      })) {
        console.log("Already seen that drop")
        resolve(user_found.drops_seen)
      }
      user_found.drops_seen.push(drop_id)
      user_found.save()
      resolve(user_found.drops_seen)
    })
  })
}




