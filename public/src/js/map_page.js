import '../scss/map_page.scss'
import { uppy } from './uppy'

console.log("Map page script running")


//  Get user data from html
var USER;
var isLogged = false;
passData()
function passData() {
    var user = $("#user-data").data("user");
    if (user) {
        USER = user
        isLogged = true
        console.log("Logged as: ", USER.username)
        // console.log("user: ",USER)
    }
}

// Map
function fromLatLngToPoint(latLng, map) {
    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: { lat: 38.816670, lng: -9.23333 },
    disableDefaultUI: true
});

// Heatmap
var heatmap_data = [
    new google.maps.LatLng(37.782551, -122.445368),
    new google.maps.LatLng(37.782745, -122.444586),
    new google.maps.LatLng(37.782842, -122.443688)
]
var heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: null
});
// Places service
var service = new google.maps.places.PlacesService(map);
// Autocomplete
var ac_service = new google.maps.places.AutocompleteService();
// Geocoder
var geocoder = new google.maps.Geocoder;
// Infowindow
var infowindow = new google.maps.InfoWindow({
    content: 'empty',
    maxWidth: 400
});
var infowindow_query = new google.maps.InfoWindow();
// Add drop marker (smp o mesmo)
var add_drop_marker = new google.maps.Marker({
    position: { lat: 0, lng: 0 },
    map: null,
    // icon: {url: "/icons/location-add.svg", scaledSize: new google.maps.Size(60, 60)},
    optimized: false,
    title: "Add drop here",
    zIndex: 5
})
var marker_query = new google.maps.Marker({
    map: map,
    position: null
});


// Click on map to upload
var map_click_event;
var add_drop_iw = $("#add-drop-iw")
map.addListener('click', function (e) {
    // Is a drop's iw open?
    if (infowindow.map != null) {
        infowindow.close()
    } else {
        // If not ask if you want to add a drop there
        map_click_event = e;
        if (map_click_event.placeId) {
            add_drop_marker.setMap(null)
        } else {
            add_drop_marker.setMap(map)
            add_drop_marker.setPosition(e.latLng)
        }
        queryPlace(e);
        $("#input-location").val(JSON.stringify({ lat: e.latLng.lat(), lon: e.latLng.lng() }))

        var click_pos = e.latLng
        var click_screen = fromLatLngToPoint(click_pos, map)

        add_drop_iw.show()
        add_drop_iw.css({ "top": click_screen.y + 50 + "px", "left": click_screen.x - add_drop_iw.width() / 2 + "px" })
    }
})
map.addListener('bounds_changed', hideAddDropIW)
map.addListener('zoom_changed', hideAddDropIW)
add_drop_marker.addListener('click', function () {
    if (isLogged) {
        setSBar("sbar-upload");
        queryPlace(map_click_event)
    } else {
        flash("failure", "You need to be logged-in to upload a drop")
    }
})
function hideAddDropIW() {
    add_drop_iw.hide()
}

// Listen to map zoom. Above zoom 13 convert to heatmap
const trigger_heatmap_zoom = 13;
var map_mode = "markers";
map.addListener('zoom_changed', handleZoomChanged)
function handleZoomChanged() {
    var zoom = map.getZoom();

    if (map_mode == "markers" && zoom <= trigger_heatmap_zoom) { // Enable heatmap
        heatmap.setOptions({
            data: heatmap_data,
            map: map
        })
        all_markers.forEach((marker) => {
            marker.setMap(null)
        })
        map_mode = "heatmap"
    }
    if (map_mode == "heatmap" && zoom > trigger_heatmap_zoom) { // Disable heatmap
        heatmap.setOptions({
            data: heatmap_data,
            map: null
        })
        all_markers.forEach((marker) => {
            marker.setMap(map)
        })
        setTimeout(colorMarkers, 2000)
        map_mode = "markers"
    }

}



// Query place functions
function queryPlace(e) {
    if (e.placeId) {
        service.getDetails({
            placeId: e.placeId
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                $("#input-place").val(place.name)
            }
        });
    } else {
        geocoder.geocode({ 'location': e.latLng }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    $("#input-place").val(results[0].formatted_address)
                } else {
                }
            } else {
            }
        });
    }
}
function queryPlace2(place_id) {
    return new Promise((resolve, reject) => {
        service.getDetails({
            placeId: place_id
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(place)
            } else {
                reject("Error query place 2")
            }
        });
    })

}


// Get drops from api via ajax
var all_drops = [];
var all_markers = [];
var p_drops_ajax = getDrops()
p_drops_ajax.then((drops) => {
    all_drops = drops;
    addAllMarkers(all_drops);
}).catch((err) => console.error(err))
function getDrops() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "get",
            url: "/api/drops",
            dataType: "json",
        }).done(data => {
            data = JSON.parse(data);
            if (data.success && data.success == true) {
                resolve(data.drops)
            } else {
                reject()
            }

        }).fail(function () {
            alert("failed to get drops");
            reject()
        })

    })
}
function filterDrops(type, reference) {
    // all_drops always has all_drops. Just hide the one that dont match the criteria

    if (type == "user") {
        var drops_by_user = all_drops.filter((drop) => {
            return drop.owner._id == reference._id
        })
        if (drops_by_user.length != 0) {
            var user = drops_by_user[0].owner
            $("#query-user").show()
            $("#query-username").html(user.username)
            $(".query-thumbnail").css("background-image", "url('" + user.info.profile_pic + "')")

            // Set all markers invisible
            all_markers.map((marker) => { marker.setMap(null) })

            // Set back to visible the ones that match drops_by_user
            all_markers.forEach((marker) => {
                var matches = drops_by_user.findIndex((drop) => {
                    return drop._id == marker.drop_id
                })
                if (matches >= 0) {
                    marker.setMap(map)
                }
            })

        } else {
        }
        return drops_by_user;
    }

    if (type == "hashtag") {
        var hashtag = reference;

        var drops_with_hashtag = all_drops.filter((drop) => {
            return drop.hashtag._id == hashtag._id;
        })
        if (drops_with_hashtag.length != 0) {

            $("#query-hashtag").show()
            $("#query-hashtag-hashtag").html(hashtag.hashtag)
            $(".query-thumbnail-hashtag").css("background-color", hashtag.color)

            // Set to invisible the ones that do not match drops_with_hashtag
            all_markers.forEach((marker) => {
                var matches = drops_with_hashtag.findIndex((drop) => {
                    return drop._id == marker.drop_id
                })
                if (matches >= 0) {

                } else {
                    marker.setMap(null)
                }
            })

        } else {
            console.log("Hashtag has no drops")
        }
        return drops_with_hashtag;
    }
}

// Add markers to map
function addAllMarkers(drops) {
    for (var i = 0; i < drops.length; i++) {
        var drop = drops[i];

        if (findIfIvSeenDrop(drop._id) == true) {
            var icon_size = new google.maps.Size(40, 40)
        } else {
            var icon_size = new google.maps.Size(50, 50)
        }

        all_markers[i] = new google.maps.Marker({
            position: { lat: drop.location.lat, lng: drop.location.lon },
            map: map,
            icon: { url: drop.icon, scaledSize: icon_size },
            optimized: false,
            title: drop.title,
        })
        all_markers[i].addListener('click', function () {
            makeIW(this.drop_id)

            // Add drop to user's drops_seen list
            if (findIfIvSeenDrop(this.drop_id) == true) {
            } else {
                console.log("Never seen that drop")
                addToDropsSeen(this.drop_id)
            }

            var icon = this.getIcon()
            icon.size.height = 30;
            icon.size.width = 30;
            this.setIcon(icon)

            infowindow.open(map, this);
            $(".map-iw-img").click(function () {
                var drop = $(this).data("drop")
                var post = $(this).data("post")
                var img = $(this).data("img")
                var link = "/drop/" + drop + "?post=" + post + "&img_num=" + img
                window.location.href = link;
            })
            $(".btn-star").click(function (e) {
                if (USER) {
                    var btn = $(this);
                    var post_id = btn.data("postid")
                    var star = btn.find("img");
                    var likes = btn.next();
                    if (btn.data("like") == 0) {
                        star.attr("src", "/icons/star-full-yellow.svg")
                        likes.text(parseInt(likes.text()) + 1)
                        btn.data("like", "1")
                        postLike(post_id)
                    } else {
                        star.attr("src", "/icons/star-outline.svg")
                        likes.text(parseInt(likes.text()) - 1)
                        btn.data("like", "0")
                        postUnlike(post_id)
                    }
                } else {
                    flash("failure", "You need to be logged in to like")
                }
            })
            add_drop_marker.setMap(null)
            var iwOuter = $('.gm-style-iw');
            var iwBackground = iwOuter.prev();
            iwBackground.children(':nth-child(4)').css({ "background-color": "rgb(26, 123, 165, 0.7)" })
            iwBackground.children(':nth-child(3)').children().children().css({ "background-color": "rgb(16, 82, 110, 0.7)" });
            hideAddDropIW();
            setSBar('none')
        });

        all_markers[i].addListener('position_changed', function () {
        })

        all_markers[i].drop_id = drop._id;
    }
    // Add color to drop thumbnails
    setTimeout(colorMarkers, 2000)
}
function makeIW(drop_id) {
    var drop_index = all_drops.findIndex((drop) => {
        return drop._id == drop_id
    })
    if (drop_index == -1) {
        return null;
    }

    var drop = all_drops[drop_index];
    var post_id = drop.creation_post._id;
    var img_num = 0;
    var contentString = '';
    if (drop.best_post == null) {
        console.log("Drop: ", drop)
        contentString = '<div class="map-iw" data-owner="' + drop.owner._id + '">' +
            '<div class="map-iw-head">' +

            '<div class="d-flex flex-row">' +

            '<div class="map-iw-profile-pic">' +
            '<a href="' + "/user/" + drop.owner._id + '" onclick="onUnload()">' +
            '<div class="sbar-profile-img" data-owner="' + drop.owner._id + '" style="background-image: url(' + drop.owner.info["profile_pic"] + ');"></div>' +
            '</a>' +
            '</div>' +

            '<div class="w-100 ml-2">' +

            '<span class="map-iw-user">' + drop.owner.username + '</span>' +
            '<br class="d-md-none">' +
            '<span class="work-sans map-iw-time ml-2">' + moment(drop.creation_date).fromNow() + '</span>' +

            '<p class="map-iw-tag">#' + drop.hashtag.hashtag + '</p>' +
            '<p class="map-iw-title">' + drop.title + '</p>' +
            '</div>' +

            '</div>' +

            '</div>' +
            '<div class="map-iw-body mt-2">' +

            '<div class="map-iw-img" data-drop=' + drop_id + ' data-post=' + post_id + ' data-img=' + img_num + ' style="background-image: url(' + drop.creation_post.images[0].split(', ')[0] + ');" >' +
            '</div>' +

            '<div class="map-iw-footer">' +
            '<div class="w-100 p-2 mt-1 d-flex flex-row align-items-center justify-content-between">' +
            '<div>' +
            '<button class="btn-star" data-like=0 data-postid="' + drop.creation_post._id + '" > <img src="/icons/star-outline.svg" width="25px" alt=""> </button>' +
            '<span class="ml-2">' + drop.creation_post.likes_list.length + '</span>' +
            '</div>' +
            '<span>' + drop.posts_list.length + ' comments' + '</span>' +
            '<a href="/drop/' + drop_id + '" onclick="onUnload()" class="btn btn-danger btn-goto-drop">Go to drop page..</a>'
        '</div>' +
            '</div>'



        '</div>' +
            '</div>';
    } else {
        contentString = '<div class="map-iw" data-owner="' + drop.owner._id + '">' +
            '<div class="map-iw-head">' +

            '<div class="row">' +

            '<div class="col-3">' +
            '<a href="' + "/user/" + drop.owner._id + '">' +
            '<div class="sbar-profile-img" data-owner="' + drop.owner._id + '" style="background-image: url(' + drop.owner.info.profile_pic + ');"></div>' +
            '</a>' +
            '</div>' +

            '<div class="col-9">' +

            '<span class="map-iw-user">' + drop.owner.username + '</span>' +
            '<span class="work-sans map-iw-time ml-2">' + moment(drop.creation_date).fromNow() + '</span>' +

            '<p class="map-iw-tag">#' + drop.hashtag + '</p>' +

            '<p class="map-iw-title">' + drop.title + '</p>' +
            '</div>' +

            '</div>' +

            '</div>' +
            '<p class="map-iw-title">' + drop.title + '</p>' +
            '<div class="map-iw-body mt-2">' +
            '<div class="row no-gutters">' +
            '<div class="col-6">' +
            '<a href="' + "drop/" + drop_id + '"><img src="' + drop.best_post.images[0] + '" class="w-100" alt="" id="iw-img-best"></a>' +
            '</div>' +
            '<div class="col-6">' +
            '<a href="' + "drop/" + drop_id + '"><img src="' + drop.creation_post.images[0] + '" class="w-100" alt="" id="iw-img-recent"></a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    infowindow.setContent(contentString)
    infowindow.drop_id = drop_id;



    return true;
}

function colorMarkers() {
    var img_list = $(".gmnoprint img")
    for (var i = 0; i < img_list.length; i++) {
        var img = img_list.eq(i);
        var src = img.attr("src");
        // Find the drop related to that image
        var drop = all_drops.find(function (drop) {
            return drop.icon == src;
        })
        if (drop) {
            var color = drop.hashtag.color;
            img.parent().addClass("border-" + drop._id)
            $("<style type='text/css'> .border-" + drop._id + "{ background-color:" + color + "; outline: 4px solid " + color + "; outline-style: solid; border-radius: 10px; opacity:1 !important;} </style>").appendTo("head");
        }
    }
}



// Handle API stuff
function postLike(post_id) {
    if (USER) {

        $.ajax({
            url: '/api/user/like-post',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ "post": post_id }),
            processData: false,
            success: function (data, textStatus, jQxhr) {
                if (data.status != 200) {
                    return false
                } else {
                    return true;
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                flash("failure", "You need to be logged in to like")
                return false
            }
        });
    }
}
function postUnlike(post_id) {
    if (USER) {
        $.ajax({
            url: '/api/user/dislike-post',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ "post": post_id }),
            processData: false,
            success: function (data, textStatus, jQxhr) {
                if (data.status != 200) {
                    return false
                } else {
                    return true
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                flash("failure", "You need to be logged in to like")
                return false
            }
        });
    }
}
function addToDropsSeen(drop_id) {
    if (USER) {
        $.ajax({
            url: '/api/user/seen-drop',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({ "drop": drop_id }),
            processData: false,
            success: function (data, textStatus, jQxhr) {
                if (data.status != 200) {
                    return false
                } else {
                    USER.drops_seen.push(drop_id)
                    return true;
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                flash("failure", "You need to be logged in to have seen a drop")
                return false
            }
        });
    }
}
function findIfIvSeenDrop(drop_id) {
    if (USER) {
        var index = USER.drops_seen.findIndex((drop_seen) => {
            return drop_seen == drop_id
        })

        if (index >= 0) {
            return true
        } else {
            return false
        }
    }
}



//  Sidebar
window.setSBar = setSBar
function setSBar(sbarID) {
    $('#navbarNav').collapse('hide');
    var sbar = $("#" + sbarID)
    if (sbar.css("display") == "none") {
        $(".sidebar").removeClass("sbar-fadein").hide();
        sbar.show().addClass("sbar-fadein");
    } else {
        $(".sidebar").removeClass("sbar-fadein").hide();
        sbar.hide()
    }

    if (sbarID == "sbar-notifications") {
        $("#badge-notifications").hide()
        localStorage.setItem("notifications_read", USER.notifications.length)
    }
    if (sbarID == "sbar-following") {
        $("#badge-following").hide()
        localStorage.setItem("following_read", USER.following_news.length)
    }

    return false;
}
$(".sbar-profile-img").click(function () {
    if (USER) {
        var url = "/myprofile"
        onUnload()
        $(location).attr('href', url)
    }
})
$(".sbar-comment").click(function () {
    var h = $(this).prop('scrollHeight');
    $(this).css("height", h).css("max-height", "");
})
$(".sidebar").hide();
$(".btn-collapse").click(function () {
    setSBar('none')
})



// Upload new drop
$(".btn-add-drop").click(function () {
    $("#add-drop-focus").show()
})
$("#close-drop-focus").click(function () {
    $("#add-drop-focus").hide()
})
$("#add-drop-iw").click(function () {
    $("#add-drop-focus").hide()
    if (USER) {
        $("#upload-drop-modal").modal("show")
    } else {
        // Open login sidebar when user clicks drop button when not logged in
        setSBar('sbar-not-loggedin')
    }
})


// Upload via uppy
var ALL_UPLOADS = []
uppy.on('complete', (result) => {
    if (result.successful.length > 0) {
        var url_list = result.successful.map(upload_event => {
            return upload_event.response.body.cloudUrl
        })
        ALL_UPLOADS = ALL_UPLOADS.concat(url_list)
        previewUploads(ALL_UPLOADS)
    }
    uppy.getPlugin('Dashboard').closeModal()
})


function previewUploads() {
    $("#sbar-form-upload-empty").hide();
    $("#sbar-form-preview-img").show();
    var row_preview = $("#sbar-form-preview-row")
    var cols_preview = row_preview.children().html("");

    var j = 0;
    for (var i = 0; i < ALL_UPLOADS.length; i++) {
        var col = cols_preview.eq(j)
        var url = ALL_UPLOADS[i]['_4x'];
        var div = $("<div></div>")
        div.addClass("mt-2").css("position", "relative")
        col.append(div)

        div.append("<img src='" + url + "' class='w-100'>")
        div.append("<button type='button' class='btn btn-danger btn-remove-img ml-auto'>Remove</button>")

        j++;
        if (j > 1) {
            j = 0;
        }
    }
    $(".btn-remove-img").click(function () {
        var btn = $(this);
        var img = btn.prev()
        var img_url = img.attr("src")
        var index = ALL_UPLOADS.findIndex((url) => {
            return url == img_url
        })
        ALL_UPLOADS.splice(index, 1)
        previewUploads(ALL_UPLOADS)
    })
    $("#btn-add-imgs").click(function () {
        openPicker()
    })
    $("#input-urls").val(JSON.stringify(ALL_UPLOADS));
}

// Search
function searchDB(val, type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "/api/search",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ "search": val, type: type }),
            success: function (data, textStatus, jQxhr) {
                if (data.status != 200) {
                    reject("Error " + data.status + " " + data.error)
                } else {
                    resolve(data.results)
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                reject("Error - " + errorThrown)
            }
        })
    })
}

// Search hashtag
if (USER) {
    var src_hashtag = document.getElementById("src-hashtag")
    $(document).click(function (e) {
        if (e.target == document.getElementById("src-hashtag")) {
        } else {
            $("#src-hashtag-drop").hide()
        }
    })
    var observable = Rx.Observable.fromEvent(src_hashtag, 'input'); // Magic
    observable
        .map(event => event.target.value)
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe({
            next: function (value) {
                if (value) {
                    searchDB(value, "hashtag").then((results) => {
                        if (results.hashtags) {
                            $("#src-drop-hashtag").show()
                        }
                        renderSrcResultsHashtag(results.hashtags)
                    }).catch((reason) => {
                        console.error(reason)
                    })
                } else {
                    var src_drop = $("#src-hashtag-drop")
                    src_drop.html("");
                    // $("#src-noresults").show()
                }
            }
        });
}
function renderSrcResultsHashtag(hashtags) {
    var src_drop = $("#src-drop-hashtag")
    src_drop.dropdown('update')

    src_drop.html("");
    for (var i = 0; i < hashtags.length; i++) {
        var hashtag = hashtags[i];
        var link = $("<div></div>").addClass("dropdown-item dropdown-hashtag").attr({ "data-hashtag": JSON.stringify(hashtag) })
        var content = $("<div></div>").addClass("d-flex flex-row align-items-center")
        var thumbnail = $("<div></div>").addClass("src-thumbnail-hashtag").css("background-color", hashtag.color)
        var title = $("<span></span>").addClass("h5 work-sans ml-3").html(hashtag.hashtag)
        var drops_using = $("<span></span>").addClass("h6 work-sans ml-3").html("in " + hashtag.drops_using.length + " drops ")

        link.append(content);
        content.append(thumbnail, title, drops_using)
        src_drop.append(link)
    }

    $(".dropdown-hashtag").click(function () {
        var hashtag = $(this).data("hashtag");
        $("#src-hashtag").val(hashtag.hashtag)
        $("#input-color").val(hashtag.color)
        $("#color-hashtag").css({ 'backgroundColor': hashtag.color, 'color': hashtag.color });

        $("#src-drop-hashtag").hide()
    })
}


// Search all
var src_bar = document.getElementById("src-bar")
$(document).click(function (e) {
    if (e.target == document.getElementById("src-bar")) {
    } else {
        $("#src-drop-all").hide()
    }
})
var observable = Rx.Observable.fromEvent(src_bar, 'input'); // Magic
observable
    .map(event => event.target.value)
    .debounceTime(500)
    .distinctUntilChanged()
    .subscribe({
        next: function (value) {
            if (value) {
                // Does the query begin with a hashtag char?
                var value_array = value.split('');
                if (value_array[0] === '#') { // If yes search just hashtags
                    value_array.splice(0, 1)
                    value = value_array.join('')
                    searchDB(value, "hashtag").then((results) => {
                        var hashtags = results.hashtags
                        if (hashtags) {
                            $("#src-drop-all").show()
                        }
                        renderSrcResults("hashtag", null, null, null, hashtags)
                    })
                } else { // If not search for users, titles, and places
                    Promise.all([searchDB(value, "all"), searchPlace(value)]).then((results) => {
                        var users = results[0].users;
                        var drops = results[0].drops;
                        var places = results[1];
                        if (users || drops || places) {
                            $("#src-drop-all").show()
                        }
                        renderSrcResults("all", users, drops, places, null)
                    }).catch((reason) => {
                    })
                }
            } else {
                var src_drop = $("#src-drop-all")
                src_drop.html("");
                src_drop.hide();
                $("#src-noresults").show()
            }
        }
    });
function searchPlace(val, local = true) {
    // https://developers.google.com/maps/documentation/javascript/reference#AutocompleteService
    return new Promise((resolve, reject) => {
        if (local) {
            var location = map.getCenter();
            var radius = 20000;
        } else {
            var location = null;
            var radius = null;
        }
        ac_service.getQueryPredictions({ input: val, location: location, radius: radius }, function (predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(predictions)
            } else {
                reject("Error searching place - ", status)
            }
        })
    })
}
function renderSrcResults(type, users, drops, places, hashtags) {
    $("#src-drop-all").dropdown('update')
    var src_drop = $("#src-drop-all")
    src_drop.html("");

    if (type == "all") {
        // Users
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var link = $("<div></div>").addClass("dropdown-item dropdown-user").attr("data-link", "/user/" + user._id)
            var content = $("<div></div>").addClass("d-flex flex-row align-items-center")
            var thumbnail = $("<div></div>").addClass("src-thumbnail").css("background-image", "url(" + user.info.profile_pic + ")")
            var username = $("<span></span>").addClass("h5 work-sans ml-3").html(user.username)

            link.append(content);
            content.append(thumbnail, username)
            src_drop.append(link)
        }
        if (users.length > 0 && drops.length > 0) {
            src_drop.append($("<div></div>").addClass("dropdown-divider"))
        }

        // Drops
        for (var i = 0; i < drops.length; i++) {
            var drop = drops[i];
            var link = $("<div></div>").addClass("dropdown-item dropdown-drop").attr("data-location", JSON.stringify(drop.location))
            var content = $("<div></div>").addClass("d-flex flex-row align-items-center")
            var thumbnail = $("<div></div>").addClass("src-thumbnail").css("background-image", "url(" + drop.icon + ")")

            var info = $("<div></div>").addClass("ml-3")
            var title = $("<h5></h5>").addClass("work-sans").html(drop.title)
            var location = $("<p></p>").addClass("h6 work-sans").html(drop.location.name)

            info.append(title, location)
            content.append(thumbnail, info)
            link.append(content);
            src_drop.append(link)
        }
        if ((drops.length > 0 || users.length > 0) && places.length > 0) {
            src_drop.append($("<div></div>").addClass("dropdown-divider"))
        }

        // Places
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var link = $("<div></div>").addClass("dropdown-item dropdown-place").attr("data-placeid", place.place_id)
            var content = $("<div></div>").addClass("d-flex flex-row align-items-center")

            var thumbnail = $("<img>").attr("src", "/icons/location-picker-sm-white.svg").css("width", "20px").addClass("d-block mr-3")
            var location = $("<h5></h5>").addClass("work-sans").html(place.structured_formatting.main_text)
            content.append(thumbnail, location);
            link.append(content)
            src_drop.append(link)
        }

        $(".dropdown-user").click(function () {
            window.location = $(this).data("link")
        })
        $(".dropdown-drop").click(function () {
            var location = $(this).data("location")
            map.setCenter({ lat: location.lat, lng: location.lon })
            map.setZoom(18)
            $("#src-drop-all").hide()
        })
        $(".dropdown-place").click(function () {
            var place_id = $(this).data("placeid")
            $("#src-drop-all").hide()
            queryPlace2(place_id).then((place) => {
                var position = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
                map.setCenter(position)

                marker_query.setMap(map);
                marker_query.setPosition(position);

                infowindow_query.setContent('<strong class="h4">' + place.name + '</strong><br>' + "<span class='h5'>" + place.types[0] + "</span><br>" + "<span>" + place.formatted_address + "</span>");
                infowindow_query.open(map, marker_query);
                var iwOuter = $('.gm-style-iw');
                var iwBackground = iwOuter.prev();
                iwBackground.children(':nth-child(4)').css({ "background-color": "rgb(26, 123, 165)" })
                iwBackground.children(':nth-child(3)').children().children().css({ "background-color": "rgb(16, 82, 110)" });
            });

        })
    }

    if (type == "hashtag") {
        // Hashtags
        for (var i = 0; i < hashtags.length; i++) {
            var hashtag = hashtags[i];
            var link = $("<div></div>").addClass("dropdown-item dropdown-hashtag").attr({ "data-hashtag": JSON.stringify(hashtag) })
            var content = $("<div></div>").addClass("d-flex flex-row align-items-center")
            var thumbnail = $("<div></div>").addClass("src-thumbnail-hashtag").css("background-color", hashtag.color)
            var title = $("<span></span>").addClass("h5 work-sans ml-3").html(hashtag.hashtag)
            var drops_using = $("<span></span>").addClass("h6 work-sans ml-3").html("in " + hashtag.drops_using.length + " drops ")

            link.append(content);
            content.append(thumbnail, title, drops_using)
            src_drop.append(link)
        }

        $(".dropdown-hashtag").click(function () {
            $("#src-drop-all").hide()
            var hashtag = $(this).data("hashtag");
            filterDrops("hashtag", hashtag)
        })
    }

}


// Flash messages
window.flash = flash
function flash(type, message) {
    if (type == "success") {
        var div_flash = $("#flash-success").show();
        var span_flash = div_flash.find("span")
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        }, 2000)
    }
    if (type == "failure") {
        var div_flash = $("#flash-failure").show();
        var span_flash = div_flash.find("span")
        span_flash.html(message)
        setTimeout(() => {
            div_flash.hide()
        }, 4000)
    }
}


// Save map position to localstorage before leave
$("a").click(onUnload)
function onUnload() {
    localStorage.setItem("map_position", JSON.stringify({ lat: map.getCenter().lat(), lng: map.getCenter().lng() }))
    localStorage.setItem("map_zoom", map.getZoom())
}


// Check for anything there on load
if (localStorage.getItem("map_position")) {
    var pos = JSON.parse(localStorage.getItem("map_position"))
    map.setCenter(pos)
}
if (localStorage.getItem("map_zoom")) {
    var zoom = localStorage.getItem("map_zoom")
    map.setZoom(parseInt(zoom))
}


// Notifications count
if (USER) {
    var notifications = USER.notifications;
    var following = USER.following_news;
    var notifications_read = localStorage.getItem("notifications_read")
    var following_read = localStorage.getItem("following_read")

    if (!notifications_read) {
        notifications_read = 0;
    }
    var new_notifications = notifications.length - notifications_read;
    if (new_notifications > 0) {
        $("#badge-notifications").text(new_notifications)
    } else {
        $("#badge-notifications").hide()
    }

    if (!following_read) {
        following_read = 0;
    }
    var new_following = following.length - following_read;
    if (new_following > 0) {
        $("#badge-following").text(following.length - following_read)
    } else {
        $("#badge-following").hide()
    }
}


// Check if there's a query
checkQuery()
function checkQuery() {
    var URLparams = new URL(window.location.href).searchParams;
    var user_query = URLparams.get("user")
    var place_query = URLparams.get("place")

    // User
    if (user_query) {

        p_drops_ajax.then((drops) => { // Already added to all_drops and all_markers in code above
            filterDrops("user", { _id: user_query })
        })

    } else {

    }

    // Place
    if (place_query) {
        searchPlace(place_query, false).then((predictions) => {
            return queryPlace2(predictions[0].place_id)
        }).then((place) => {
            map.setCenter(place.geometry.location)
            if (place.types.findIndex((el) => {
                return el == "establishment"
            }) != -1) {
                map.setZoom(18)
            } else {
                map.setZoom(12)
            }
        })
    }

    $(".query-close").click(function () {
        $(".query").hide();
        all_markers.forEach((marker) => {
            marker.setMap(map)
            // Add color to drop thumbnails
            setTimeout(colorMarkers, 2000)
        })
    })
}
