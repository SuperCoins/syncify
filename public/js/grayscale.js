$(document).ready(onload);

function onload() {
    var port = Number(process.env.PORT || 8080);
    var socket = io.connect('http://localhost:' + port);

    socket.on('message', function(data) {
        if (data.message) {
            console.log('Server: ' + data.message);
        }
    });

    socket.on('welcome', function(data) {
        console.log('Server: Welcome');
        socket.emit('message', {message: 'Client connected'});
    });

    socket.on('play', function(data) {
        if (data.song) {
            console.log(data.song.name);
            document.getElementById('song-loc').innerHTML = data.song.name + ' - ' + data.song.artist;
            socket.emit('refresh');
            console.log(data.song.uri);
            window.location.href = data.song.uri + '#0:01';
        }
    });

    socket.on('shuffle', function(data) {
        if (data.songs) {
            console.log('Shuffle received');
            updateLabels(data.songs);
        }
    });

    socket.on('refresh', function(data) {
        console.log('Refreshing song list');
        updateLabels(data.songs);
    });

    document.getElementById('shuffleButton').onclick = function() {
        console.log('Commencing shuffle');
        socket.emit('shuffle');
    };

    document.getElementById('playButton').onclick = function() {
        console.log('Requesting Song');
        socket.emit('play');
    };
};

// Update the labels with the songs given
var updateLabels = function(songs) {
    songs.reverse();
    var song;
    for (var i = 1; i <= 5; i++) {
        if (songs[i - 1]) {
            song = songs[i - 1];
            document.getElementById('label' + i).innerHTML = song.name + ' - ' + song.artist;
        } else {
            document.getElementById('label' + i).innerHTML = '';
        }
    }
};