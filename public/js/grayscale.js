window.onload = function() {

    var socket = io();
    var currentSong;
    var artwork = false;

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
            currentSong = data.song;
            console.log(data.song.name);
            document.getElementById('song-name').innerHTML = data.song.name + ' - ' + data.song.artist;
            showArtwork(artwork, currentSong);
            socket.emit('refresh');
            console.log(data.song.uri);
            window.location.href = data.song.uri + data.song.time;
            document.title = data.song.name;
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

    document.getElementById('imageButton').onclick = function() {
        if (artwork) {
            artwork = false;
        } else {
            artwork = true;
        }
        showArtwork(artwork, currentSong);
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

var showArtwork = function(artwork, song) {
    if(artwork && song) {
        console.log("Setting background to album artwork: ");
        var text;
        console.log(text);
        document.getElementById('heading').style.display = 'none';
        document.getElementById('artwork').src = song.image;
        document.getElementById('artwork-div').style.display = '';
    } else {
        console.log("Setting background to default");
        document.getElementById('artwork-div').style.display = 'none';
        document.getElementById('artwork').src = '';
        document.getElementById('heading').style.display = '';
    }
};