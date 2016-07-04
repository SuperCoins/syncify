var SpotifyWebApi = require('spotify-web-api-node');
var prettyjson = require('prettyjson');
var https = require('https');
var jQuery = require('jquery');

var songs = [];
var code;
var refresh;
var credentials = {
    clientId: '59a1376d72f949ffa70230a2012b4d3b',
    clientSecret: '71a8cb60d6d34d1eb43147f906faaf6c',
    redirectUri: 'http://localhost:8080/callback'
};
var urlOptions = {
    host: 'api.spotify.com',
    path: '/v1/albums/',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};
// var urlBase = 'https://embed.spotify.com/oembed/?url=spotify:track:';

var spotifyApi = new SpotifyWebApi(credentials);

spotifyApi.clientCredentialsGrant()
    .then(function(data) {
        console.log('Access token retrieved: ' + data.body['access_token']);
        console.log('The token expires in ' + data.body['expires_in']);
        spotifyApi.setAccessToken(data.body['access_token']);
        exports.populateSongs(0, function(data) {
            exports.shuffleSongs(function(data) {
                songs = data;
            });
        });
    }, function(err) {
        console.log('Something went wrong when retrieving the access token', err);
    });

// This uses a function so something can be performed after all the playlist has been updated
exports.populateSongs = function(off, callback) {
    spotifyApi.getPlaylistTracks('zonalhaz', '4OUUYo4nUD6yTeA5mUddtQ', {
        offset: off,
        limit: 100,
        items: 'track'
    }).then(function(data) {
        if (data.body.items.length === 0) {
            console.log(songs.length + ' songs stored');
            if (typeof callback === 'function') {
                callback(songs);
            }
            return;
        } else {
            var count = data.body.items.length + off;
            console.log('Retrieved ' + count + ' songs from the playlist');
            data.body.items.forEach(function(song) {
                // Only push the song if it isn't stored locally
                if (song.track.uri.indexOf('local') === -1) {
                    songs.push({
                        name: song.track.name,
                        artist: song.track.artists[0].name,
                        album: song.track.album.name,
                        length: song.track.duration_ms,
                        id: song.track.id,
                        image: song.track.album.images[0].url,
                        uri: song.track.uri
                    });
                }
            });
            exports.populateSongs(off + 100, callback);
        }
    }, function(err) {
        console.log('Playlist could not be retrieved', err);
        return;
    });
};

exports.shuffleSongs = function(callback) {
    var currentIndex = songs.length;
    var temporaryValue;
    var randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = songs[currentIndex];
        songs[currentIndex] = songs[randomIndex];
        songs[randomIndex] = temporaryValue;
    }
    callback(songs);
};

exports.getSongs = function(callback) {
    callback(songs);
};

exports.newSong = function(callback) {
    // If there are no songs in the playlist, refresh it
    if (songs.length === 0) {
        exports.clientCredentialsGrant();
    }
    song = songs.pop();
    callback(song);
};