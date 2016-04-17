function makePlaylist(data, tags){
	var i, j;
	var totalsongs = new Array();
	for(i = 0; i < data.length; i++){
		var songs = i.songs;
		for(j = 0; j < songs.length; j++){
			var song = songs[j];
			song.weight = 0;
			song.weight += numOccurrences(song, data);

			song.weight -= Math.abs(song.danceability - tags.danceability);
			song.weight -= Math.abs(song.energy - tags.energy);
			song.weight -= Math.abs(song.speechiness - tags.speechiness);
			song.weight -= Math.abs(song.acousticness - tags.acousticness);
			song.weight -= Math.abs(song.instrumentalness - tags.instrumentalness);
			song.weight -= Math.abs(song.valence - tags.valence);
			totalsongs.push(song);
		}
	}

	totalsongs.sort(function(a, b){
		if(a.weight > b.weight){
			return 1;
		} else {
			return -1;
		}
	});
	postSpotify("https://api.spotify.com/v1/users/" + userid + "/playlists", {name: "Test Playlist 73"}, function(bool, data){
		if(!bool){
			return;
		}
		var songsforjson;
		for(var i = 0; i < 50; i++){
			songsforjson+= "spotify:track:" + totalsongs[i].id;
			if(i != 49){
				songsforjson += ",";
			}
		}
		postSpotify("https://api.spotify.com/v1/users/" + userid + "/playlists/" + data.id + "/tracks", {uris: songsforjson}, function(){

		});
	});

}

function numOccurrences(song, data){
	var occ = 0;
	for(var i = 0; i < data.length; i++){
		var songs = i.songs;
		for(var j = 0; j < songs.length; j++){
			if(songs[j].id == song.id){
				occ++;
			}
		}
	}
	return occ;
}

