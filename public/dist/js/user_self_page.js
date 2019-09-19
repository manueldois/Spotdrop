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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/user_self_page.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/user_self_page.js":
/*!**********************************!*\
  !*** ./src/js/user_self_page.js ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scss_user_self_page_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/user_self_page.scss */ \"./src/scss/user_self_page.scss\");\n/* harmony import */ var _scss_user_self_page_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_scss_user_self_page_scss__WEBPACK_IMPORTED_MODULE_0__);\n\n$(\".btn-edit\").click(function (e) {\n  var input = $(\"#\" + $(this).data().input);\n  input.removeAttr(\"readonly\");\n  input.focus();\n  $(\"#btn-submit\").removeClass(\"d-none\");\n  return false;\n});\n$(\"#self-profile-pic\").click(function (e) {\n  $(\"#edit-modal\").modal(\"show\");\n});\n$(\"#input-profile-pic-modal\").focusout(function () {\n  var url = $(this).val();\n  $(\"#profile-pic-preview\").attr(\"src\", url);\n});\n\nfunction modalCopyUrl() {\n  var input = $(\"#input-profile-pic-modal\");\n  $(\"#input-profile-pic\").val(input.val());\n  $(\"#self-profile-pic\").attr(\"style\", \"background-image: url('\" + input.val() + \"')\");\n} // handle Unfollow user/post\n\n\n$(\".btn-remove\").click(function () {\n  $(this).parent().hide();\n  var type = $(this).data(\"type\");\n  var id = $(this).data(\"id\");\n  console.log(\"Unfollow \", type, id);\n\n  if (type == \"user\") {\n    postUnfollowUser(id);\n  }\n\n  if (type == \"drop\") {\n    postUnfollowDrop(id);\n  }\n});\n\nfunction postUnfollowUser(id) {\n  $.ajax({\n    url: '/api/user/unfollow-user',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"unfollow\": id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n      } else {\n        console.log(\"Success unfollow\");\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n    }\n  });\n}\n\nfunction postUnfollowDrop(id) {\n  $.ajax({\n    url: '/api/user/unfollow-drop',\n    dataType: 'json',\n    type: 'post',\n    contentType: 'application/json',\n    data: JSON.stringify({\n      \"unfollow\": id\n    }),\n    processData: false,\n    success: function (data, textStatus, jQxhr) {\n      if (data.status != 200) {\n        console.log(\"Error \", data.status, \" \", data.error);\n      } else {\n        console.log(\"Success unfollow\");\n      }\n    },\n    error: function (jqXhr, textStatus, errorThrown) {\n      console.log(\"Error\");\n      console.log(JSON.stringify(textStatus), JSON.stringify(errorThrown));\n    }\n  });\n} // Convert date ISO to preety date\n\n\n$(\".txt-date\").show(function () {\n  var date_ISO = $(this).data(\"date\");\n  $(this).html(moment(date_ISO).format('MMMM Do YYYY'));\n});\n$(\".txt-ago\").show(function () {\n  var date_ISO = $(this).data(\"date\");\n  $(this).html(moment(date_ISO).fromNow());\n}); // Flash messages\n\nfunction flash(type, message) {\n  console.log(type, message);\n\n  if (type == \"success\") {\n    var div_flash = $(\"#flash-success\").show();\n    var span_flash = div_flash.find(\"span\");\n    console.log(span_flash);\n    span_flash.html(message);\n    setTimeout(() => {\n      div_flash.hide();\n    }, 2000);\n  }\n\n  if (type == \"failure\") {\n    var div_flash = $(\"#flash-failure\").show();\n    var span_flash = div_flash.find(\"span\");\n    span_flash.html(message);\n    setTimeout(() => {\n      div_flash.hide();\n    }, 2000);\n  }\n}\n\n//# sourceURL=webpack:///./src/js/user_self_page.js?");

/***/ }),

/***/ "./src/scss/user_self_page.scss":
/*!**************************************!*\
  !*** ./src/scss/user_self_page.scss ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/scss/user_self_page.scss?");

/***/ })

/******/ });