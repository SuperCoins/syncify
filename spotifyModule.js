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
        exports.populateSongs(function(data) {
            exports.shuffleSongs(function(data) {
                console.log(prettyjson.render(data));
                songs = data;
            });
        });
    }, function(err) {
        console.log('Something went wrong when retrieving the access token', err);
    });

// This uses a function so something can be performed after all the playlist has been updated
exports.populateSongs = function(callback) {
    spotifyApi.getPlaylistTracks('zonalhaz', '4OUUYo4nUD6yTeA5mUddtQ', {
        offset: 0,
        limit: 5,
        items: 'track'
    }).then(function(data) {
        console.log('Retrieved ' + data.body.items.length + ' songs from the playlist');
        data.body.items.forEach(function(song) {
            songs.push({
                name: song.track.name,
                artist: song.track.artists[0].name,
                album: song.track.album.name,
                length: song.track.duration_ms,
                id: song.track.id,
                uri: song.track.uri
            });
        });
        // TODO: Get next batch of songs here
        console.log(songs.length + ' songs stored');
        // console.log(prettyjson.render(songs));
        if (typeof callback === 'function') {
            callback(songs);
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
// Doesn't work
exports.getArtwork = function(albumId, callback) {
    // This clones the object
    var options = JSON.parse(JSON.stringify(urlOptions));
    options.path += albumId;
    console.log(options);
    var chunk = '';

    // Code inside of this req does not run?
    var req = https.request(options, function(res) {
        console.log(res);

        res.on('data', function(data) {
            chunk += data;
        });
    });
    //req.end();

    req.on('error', function(err) {
        console.error(err);
    });

    callback(chunk);
};

exports.getSongs = function (callback) {
    callback(songs);
}

exports.newSong = function(callback) {
    song = songs.pop();
    console.log('New song:\n' + prettyjson.render(song));
    callback(song);
};