var prettyjson = require('prettyjson');

var startTime = 0;
var songLength = 0;
var endTime = 0;
var connected = 0;

exports.connected = function () {
    connected += 1;
};

exports.disconnected = function () {
    connected -= 1;
};

exports.play = function (song, callback) {
    console.log('Playing new song: ');
    console.log(prettyjson.render(song));
    startTime = new Date().getTime();
    songLength = song.length;
    endTime = startTime + songLength;

    callback(songLength);
};

exports.getSongTime = function (callback) {
    var currentTime = new Date().getTime();
    var timeDiff = currentTime - startTime;
    var totalSeconds = Math.round(timeDiff / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    seconds += 1; // To account for starting at #0:01
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    var time = '#' + minutes + ':' + seconds;

    console.log('Time of the song is: '  + time);

    callback(time);
};