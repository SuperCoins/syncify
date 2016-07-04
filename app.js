var http = require('http');
var spotifyModule = require('./spotifyModule');
var timingModule = require('./timingModule');
var prettyjson = require('prettyjson');
var express = require('express');

var app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

var songs = spotifyModule.songs;
var currentSong;

app.get('/', function(req, res) {
    console.log('Request: Homepage');
    res.render('index', {
        songs: songs
    });
});

var port = Number(process.env.PORT || 8080);

var io = require('socket.io').listen(app.listen(port));
console.log('Listening on port ' + port);

io.sockets.on('connection', function(socket) {
    // Welcome new connections
    var check;
    if (currentSong) {
        check = true;
    } else {
        check = false;
    }
    socket.emit('init', {
        checkPlaying: check
    });

    // Display any messages received from clients
    socket.on('message', function(data) {
        console.log('Client: ' + data.message);
    });

    // Shuffle request
    socket.on('shuffle', function() {
        console.log('Client has requested a shuffle');
        spotifyModule.shuffleSongs(function(data) {
            // Notify all clients of the shuffle
            io.sockets.emit('shuffle', {
                songs: data
            });
        });
    });

    // Play request
    socket.on('play', function() {
        console.log('Client has requested a new song');

        spotifyModule.newSong(function(song) {
            currentSong = song;
            song.time = '#0:01';
            timingModule.play(song, function(endTime) {
                //TODO: Set interval here
            });
            io.sockets.emit('play', {
                song: song
            });
        });
    });

    // Socket refresh
    socket.on('refresh', function() {
        var songTime;
        timingModule.getSongTime(function(time) {
            songTime = time;
        });
        currentSong.time = songTime;
        io.sockets.emit('play', {
            song: currentSong
        });
    });

    socket.on('update', function() {
        console.log('Client has requested a song time update');
        spotifyModule.getSongs(function(songs) {
            socket.emit('update', {
                songs: songs
            });
        });
    });
});