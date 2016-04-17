
"use strict";

var maxPlaylists = 1000;
var maxPlaylistsToDisplay = 1000;
var credentials = null;

var totalTracks = 0;
var totalPlaylistCount = 0;

var abortFetching = false;
var popNormalize = false;

var allPlaylists = [];
var topTracks = null;
var allTracks = {};

var userObj = null;

function error(s) {
    info(s);
}

function info(s) {
    $("#info").text(s);
}

function callSpotify(url, data) {
    return $.ajax(url, {
        dataType: 'json',
        data: data,
        headers: {
            'Authorization': 'Bearer ' + credentials.token
        }
    });
}

function postSpotify(url, json, callback) {
    $.ajax(url, {
        type: "POST",
        data: JSON.stringify(json),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + credentials.token,
            'Content-Type': 'application/json'
        },
        success: function(r) {
            callback(true, r);
        },
        error: function(r) {
            // 2XX status codes are good, but some have no
            // response data which triggers the error handler
            // convert it to goodness.
            if (r.status >= 200 && r.status < 300) {
                callback(true, r);
            } else {
                callback(false, r);
            }
        }
    });
}

function getSpotify(url, callback, isAsync) {
	$.ajax(url, {
        type: "GET",
        async: isAsync,
        headers: {
            'Authorization': 'Bearer ' + credentials.token,
        },
        success: function(r) {
            callback(true, r);
        },
        error: function(r) {
            // 2XX status codes are good, but some have no
            // response data which triggers the error handler
            // convert it to goodness.
            if (r.status >= 200 && r.status < 300) {
                callback(true, r);
            } else {
                callback(false, r);
            }
        }
    });
}

function getMetrics(url, callback, songJson){
    var items = songJson.items;
	var i;
    for(i = 0; i < items.length; i++){
        var songurl = url + encodeURIComponent(items[i].id);
        getSpotify(url, callback, false);
    }
}

function go() {
    $("#top").hide(200);
    var text = $("#playlist-terms").val()
    if (text.length > 0) {
        info("");
        $(".keywords").text(text);
        $(".results").hide();
        $("#playlist-link").show();
        createPlaylistLink(text);
		
		postPlaylist();
    } else {
        info("Enter a playlist title first");
    }
}

function postPlaylist() {
  //var form, newUserInput;
  
  //form = $("#new-playlist");
  
  //newUserInput = $("#userInput");
  //newUserInput.value = userObj;
  
  //form.submit();
  
  var name = $("#playlist-terms").value;
  
  var obj = new Object();
  obj.ownerId = credentials.user_id;
  obj.playlistName = name;
  obj.userData = userObj;
  
  var data = JSON.stringify(obj);
  
  console.log(data);
  
  /*$.ajax({
      type: "POST",
      url: "/new",       
      data: data
  }).done(function(){
      alert (data);    
  });*/
}

function createPlaylistLink(text) {
	// parse text into list of user names
	//var users = text.split(",");
	//users = users.map(Function.prototype.call, String.prototype.trim);
	//console.log(users);
	var playlistTitle= text.trim();
	//https://api.spotify.com/v1/me/top/{type}
	var url = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term";
	var songJson;
	getSpotify(url, function(ok, data) {
		if (ok) {
			songJson = data;
		} else {
			error("Didn't work");
		}
	}, false);

    var songs = new Array();
    var url = "https://api.spotify.com/v1/audio-features/";
    getMetrics(url, function(ok, data){
        if(ok){
            delete data["key"];
            delete data["loudness"];
            delete data["mode"];
            delete data["tempo"];
            delete data["type"];
            delete data["uri"];
            delete data["track_href"];
            delete data["analysis_url"];
            delete data["duration_ms"];
            delete data["time_signature"];
            songs.push(data);
        } else {
            console.log("data metrics error");
        }
    }, JSON.parse(songJson));
    userObj = {userId: credentials.user_id, songs: songs};
    console.log(userObj);
	
}


function initApp() {
    $(".intro-form").hide();
    $(".results").hide();
    $("#playlist-terms").keyup(
        function(event) {
            if (event.keyCode == 13) {
                go();
            }
        }
    );
    $("#go").on('click', function() {
        go();
    });

    $(".stop-button").on('click', function() {
        abortFetching = true;
    });

    $("#fetch-tracks").on('click', function() {
        fetchAllTracksFromPlaylist();
    });

    $("#login-button").on('click', function() {
        loginWithSpotify();
    });
    $("#save-button").on('click', function() {
        savePlaylist();
    });

    $("#norm-for-pop").on('click', function() {
        popNormalize = $("#norm-for-pop").is(':checked');
        refreshTrackList(allTracks);
    });
}


function loginWithSpotify() {
    var client_id = '67b42727bf66410aace5a6becef09d63';
    var redirect_uri = 'https://djdj.herokuapp.com/new';
    var scopes = 'playlist-modify-public user-top-read';

    //if (document.location.hostname == 'localhost') {
    //    redirect_uri = 'http://localhost:8000/index.html';
    //}

    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    document.location = url;
}

function getTime() {
    return Math.round(new Date().getTime() / 1000);
}

function performAuthDance() {
    // if we already have a token and it hasn't expired, use it,
    if ('credentials' in localStorage) {
        credentials = JSON.parse(localStorage.credentials);
    }

    if (credentials && credentials.expires > getTime()) {
        $("#search-form").show();
    } else {
    // we have a token as a hash parameter in the url
    // so parse hash
        var hash = location.hash.replace(/#/g, '');
        var all = hash.split('&');
        var args = {};

        all.forEach(function(keyvalue) {
            var idx = keyvalue.indexOf('=');
            var key = keyvalue.substring(0, idx);
            var val = keyvalue.substring(idx + 1);
            args[key] = val;
        });

        if (typeof(args['access_token']) != 'undefined') {
            var g_access_token = args['access_token'];
            var expiresAt = getTime() + 3600;

            if (typeof(args['expires_in']) != 'undefined') {
                var expires = parseInt(args['expires_in']);
                expiresAt = expires + getTime();
            }

            credentials = {
                token:g_access_token,
                expires:expiresAt
            }

            callSpotify('https://api.spotify.com/v1/me').then(
                function(user) {
                    credentials.user_id = user.id;
                    localStorage['credentials'] = JSON.stringify(credentials);
                    location.hash = '';
                    $("#search-form").show();
                },
                function() {
                    error("Can't get user info");
                }
            );
        } else {
    // otherwise, got to spotify to get auth
            $("#login-form").show();
        }
    }
}


$(document).ready(
    function() {
        initApp();
        performAuthDance();
    }
);
