/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/drop_page.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/drop_page.js":
/*!*****************************!*\
  !*** ./src/js/drop_page.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scss_drop_page_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/drop_page.scss */ \"./src/scss/drop_page.scss\");\n/* harmony import */ var _scss_drop_page_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_scss_drop_page_scss__WEBPACK_IMPORTED_MODULE_0__);\n // Get data from EJS\n\nvar DROP;\nvar USER;\npassData();\n\nfunction passData() {\n  var drop_data = $(\"#drop-data\").data(\"drop\");\n  DROP = drop_data;\n  var user_data = $(\"#user-data\").data(\"user\");\n\n  if (user_data != \"\") {\n    USER = user_data;\n  } else {\n    USER = null;\n  }\n\n  console.log(\"Drop: \", DROP);\n} // Check if there's a query\n\n\ncheckQuery();\n\nfunction checkQuery() {\n  var URLparams = new URL(window.location.href).searchParams;\n  var post_id = URLparams.get(\"post\");\n  var img_num = URLparams.get(\"img_num\");\n\n  if (post_id) {\n    openLargerModal(post_id, img_num);\n  } else {}\n} // Show full comment on click\n\n\n$(\".comment\").click(function () {\n  var h = $(this).prop('scrollHeight');\n  $(this).css(\"height\", h).css(\"max-height\", \"\");\n}); // Open reply form\n\n$(\".btn-reply\").click(function () {\n  if ($(\"#user-data\").data(\"user\")) {\n    var post = $(this).closest(\".post\");\n    console.log(\"Reply to: \", post.data(\"post-id\"));\n    var form = $(\"#reply-form\");\n    form.appendTo(post).removeClass(\"d-none\").attr(\"action\", \"/drop/\" + post.data(\"drop-id\") + \"/\" + post.data(\"post-id\") + \"/newreply\");\n  } else {\n    flash(\"failure\", \"You need to be logged in to reply\");\n  }\n}); // Follow / unfollow btns\n\n$(\"#btn-unfollow\").click(function () {\n  $(\"#btn-follow\").show();\n  $(this).hide();\n  console.log(\"Unfollow\");\n  postUnfollow($(this).data(\"id\"));\n});\n$(\"#btn-follow\").click(function () {\n  if ($(\"#user-data\").data(\"user\")) {\n    $(\"#btn-unfollow\").show();\n    $(this).hide();\n    console.log(\"Follow\");\n    postFollow($(this).data(\"id\"));\n  } else {\n    flash(\"failure\", \"You need to be logged in to follow a drop\");\n  }\n});\n\nfunction postFollow(id) {\n  $.ajax({\n    url: '/api/user/follow-drop',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"follow\": id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n        flash(\"failure\", \"Error following post\");\n      } else {\n        console.log(\"Success follow\");\n        flash(\"success\", \"Now following post\");\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      flash(\"failure\", \"You need to be logged in\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n    }\n  });\n}\n\nfunction postUnfollow(id) {\n  $.ajax({\n    url: '/api/user/unfollow-drop',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"unfollow\": id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n        flash(\"failure\", \"Error unfollowing post - \" + data.error);\n      } else {\n        console.log(\"Success unfollow\");\n        flash(\"success\", \"Unfollowed post\");\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      flash(\"failure\", \"You need to be logged in\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n    }\n  });\n} // Like / dislike\n\n\nrenderLikeBtns();\n$(\".btn-star\").click(function () {\n  var btn = $(this);\n  var post_id = btn.closest(\".post\").attr(\"data-post-id\");\n  console.log(\"Post: \", btn.closest(\".post\"), \" id: \", post_id);\n  console.log(\"btn-star: \", post_id);\n\n  if (findIfILikePost(post_id)) {\n    postUnlike(post_id);\n  } else {\n    postLike(post_id);\n  }\n});\n\nfunction renderLikeBtns() {\n  var all_btns = $(\".btn-star\");\n\n  for (var i = 0; i < all_btns.length; i++) {\n    var btn = all_btns.eq(i);\n    var star = btn.find(\"img\");\n    var count = btn.next(\"span\");\n    var post_id = btn.closest(\".post\").attr(\"data-post-id\");\n\n    if (post_id) {\n      if (!findIfILikePost(post_id)) {\n        star.attr(\"src\", \"/icons/star-outline.svg\");\n        btn.data(\"like\", \"0\");\n      } else {\n        star.attr(\"src\", \"/icons/star-full-yellow.svg\");\n        btn.data(\"like\", \"1\");\n      }\n\n      count.html(findLikeCount(post_id));\n    }\n  }\n}\n\nfunction findLikeCount(post_id) {\n  var post = DROP.posts_list.find(post => {\n    return post._id == post_id;\n  });\n  return post.likes_list.length;\n}\n\nfunction findIfILikePost(post_id) {\n  if (USER) {\n    var post = DROP.posts_list.find(post => {\n      return post._id == post_id;\n    });\n    console.log(\"Post likes: \", post.likes_list);\n    console.log(\"User id: \", USER._id);\n    var index = post.likes_list.findIndex(liker => {\n      return liker._id == USER._id;\n    });\n    console.log(\"Index: \", index);\n\n    if (index > -1) {\n      console.log(\"Return true\");\n      return true;\n    } else {\n      console.log(\"Return false\");\n      return false;\n    }\n  } else {\n    return false;\n  }\n}\n\nfunction postLike(post_id) {\n  console.log(\"Liking\");\n  $.ajax({\n    url: '/api/user/like-post',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"post\": post_id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n        return false;\n      } else {\n        console.log(\"Success like\");\n        var post = DROP.posts_list.find(post => {\n          return post._id == post_id;\n        });\n        post.likes_list.push({\n          _id: USER._id\n        });\n        renderLikeBtns();\n        return true;\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      flash(\"failure\", \"You need to be logged in to like\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n      return false;\n    }\n  });\n}\n\nfunction postUnlike(post_id) {\n  console.log(\"Disliking\");\n  $.ajax({\n    url: '/api/user/dislike-post',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"post\": post_id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n        return false;\n      } else {\n        console.log(\"Success unlike\");\n        var post = DROP.posts_list.find(post => {\n          return post._id == post_id;\n        });\n        post.likes_list.pop();\n        renderLikeBtns();\n        return true;\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      flash(\"failure\", \"You need to be logged in to like\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n      return false;\n    }\n  });\n} // Filestack upload\n\n\n$(\".btn-add-img\").click(function () {\n  console.log(\"Clicked on btn add img\");\n  openPicker();\n});\nvar ALL_UPLOADS = [];\n\nfunction previewUploads(url_list) {\n  $(\".add-img\").show();\n  var div_preview = $(\"#sbar-form-img-col\").html(\"\");\n\n  for (var i = 0; i < url_list.length; i++) {\n    var url = url_list[i];\n    div_preview.append(\"<button type='button' class='btn btn-danger btn-remove btn-remove-img p-1 ml-auto'>Remove</button>\");\n    div_preview.append(\"<img src='\" + url + \"' class='w-100'>\");\n  }\n\n  $(\".btn-remove-img\").click(function () {\n    var btn = $(this);\n    var img = btn.next();\n    var img_url = img.attr(\"src\");\n    console.log(\"Remove img: \", img_url);\n    var index = ALL_UPLOADS.findIndex(url => {\n      return url == img_url;\n    });\n    ALL_UPLOADS.splice(index, 1);\n    previewUploads(ALL_UPLOADS);\n  });\n  $(\"#sbar-form-add-more\").click(function () {\n    console.log(\"Clicked on form upload\");\n    openPicker();\n  });\n  $(\"#input-urls\").val(JSON.stringify(ALL_UPLOADS));\n  console.log(\"All urls: \", ALL_UPLOADS);\n}\n\nvar fsClient = filestack.init('AVXbgNWER68pe9QHJmgwgz');\n\nfunction openPicker() {\n  fsClient.pick({\n    accept: 'image/*',\n    minFiles: 1,\n    maxFiles: 1,\n    maxSize: 100 * 1024 * 1024\n  }).then(response => {\n    console.log(response);\n\n    if (response.filesUploaded.length > 0) {\n      var url_list = response.filesUploaded.map(metadata => {\n        return metadata.url;\n      });\n      ALL_UPLOADS = ALL_UPLOADS.concat(url_list);\n      previewUploads(ALL_UPLOADS);\n    }\n  });\n} // Modal view larger\n\n\n$(\".img-grid-img\").click(function () {\n  openLargerModal($(this).closest(\".row\").data(\"post-id\"), $(this).data(\"img-num\"));\n});\n\nfunction openLargerModal(post_id, img_num) {\n  var vlmodal = $(\"#view-larger-modal\");\n  console.log(\"Open modal..\");\n  console.log(\"Post id: \", post_id);\n  console.log(\"Img num: \", img_num);\n  vlmodal.attr(\"data-post-id\", post_id); // Reset like btn\n\n  vlmodal.find(\".btn-star\").attr(\"src\", \"/icons/star-outline.svg\");\n  var post = DROP.posts_list.find(post => {\n    return post._id == post_id;\n  });\n  var img_url = post.images[img_num];\n  vlmodal.find(\".username\").html(post.owner.username);\n  console.log(\"Post date: \", post.creation_date);\n  vlmodal.find(\".txt-date\").html(moment(post.creation_date).fromNow());\n  vlmodal.find(\".txt-date\").data(\"converted\", 1);\n  vlmodal.find(\".likes-count\").html(post.likes_list.length);\n  vlmodal.find(\".sbar-profile-img\").css(\"background-image\", \"url('\" + post.owner.info.profile_pic + \"')\");\n  vlmodal.find(\".modal-post-img\").attr(\"src\", img_url);\n  vlmodal.find(\".modal-comment\").text(post.comment);\n  renderLikeBtns();\n  vlmodal.modal(\"show\");\n} // Flash messages\n\n\nfunction flash(type, message) {\n  console.log(\"Flashing\");\n  console.log(type, message);\n\n  if (type == \"success\") {\n    var div_flash = $(\"#flash-success\").show();\n    var span_flash = div_flash.find(\"span\");\n    span_flash.html(message);\n    setTimeout(() => {\n      div_flash.hide();\n    }, 2000);\n  }\n\n  if (type == \"failure\") {\n    var div_flash = $(\"#flash-failure\").show();\n    var span_flash = div_flash.find(\"span\");\n    span_flash.html(message);\n    setTimeout(() => {\n      div_flash.hide();\n    }, 2000);\n  }\n} // Show dates as time ago\n\n\nvar txt_date_list = $(\".txt-date\");\n\nfor (var i = 0; i < txt_date_list.length; i++) {\n  var el = txt_date_list.eq(i);\n\n  if (el.data(\"date-iso\") && (el.data(\"converted\") == 0 || el.data(\"converted\") == undefined)) {\n    var date_ISO = el.data(\"date-iso\");\n    el.html(moment(date_ISO).fromNow());\n    el.data(\"converted\", 1);\n  }\n} // Handle erros nas images\n// Redirect to user profile on click avatar\n\n\n$(\".sbar-profile-img\").click(function () {\n  var owner_id = $(this).closest(\".post\").data(\"owner-id\");\n  console.log(owner_id);\n  var url = \"/user/\" + owner_id;\n  $(location).attr('href', url);\n});\n\n//# sourceURL=webpack:///./src/js/drop_page.js?");

/***/ }),

/***/ "./src/scss/drop_page.scss":
/*!*********************************!*\
  !*** ./src/scss/drop_page.scss ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/scss/drop_page.scss?");

/***/ })

/******/ });