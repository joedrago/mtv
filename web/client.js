(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var escapeHtml, onPlayerReady, onPlayerStateChange, play, player, playing, socket, tick;

player = null;

socket = null;

playing = false;

escapeHtml = function(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// autoplay video
onPlayerReady = function(event) {
  return event.target.playVideo();
};

// when video ends
onPlayerStateChange = function(event) {
  if (event.data === 0) {
    // player.loadVideoById('PBwAxmrE194')
    console.log("Playing: false");
    return playing = false;
  }
};

play = function(id) {
  console.log(`Playing: ${id}`);
  player.loadVideoById(id);
  return playing = true;
};

tick = function() {
  if (!playing && (player != null)) {
    console.log("Ready");
    return socket.emit('ready', {});
  }
};

window.onYouTubePlayerAPIReady = function() {
  console.log("onYouTubePlayerAPIReady");
  player = new YT.Player('player', {
    width: '100%',
    height: '100%',
    videoId: 'xpmQK_uPDpg', // nyan cat, this will be replaced almost immediately
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
  socket = io();
  socket.on('play', function(pkt) {
    console.log(pkt);
    return play(pkt.id);
  });
  return setInterval(tick, 3000);
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxPQUFBLEdBQVU7O0FBRVYsVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFDVCxTQUFPLENBQ0wsQ0FBQyxPQURJLENBQ0ksSUFESixFQUNVLE9BRFYsQ0FFTCxDQUFDLE9BRkksQ0FFSSxJQUZKLEVBRVUsTUFGVixDQUdMLENBQUMsT0FISSxDQUdJLElBSEosRUFHVSxNQUhWLENBSUwsQ0FBQyxPQUpJLENBSUksSUFKSixFQUlVLFFBSlYsQ0FLTCxDQUFDLE9BTEksQ0FLSSxJQUxKLEVBS1UsUUFMVjtBQURFLEVBSmI7OztBQWFBLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLEtBQUQsQ0FBQTtTQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBYixDQUFBO0FBRGMsRUFiaEI7OztBQWlCQSxtQkFBQSxHQUFzQixRQUFBLENBQUMsS0FBRCxDQUFBO0VBQ3BCLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxDQUFqQjs7SUFFRSxPQUFPLENBQUMsR0FBUixDQUFZLGdCQUFaO1dBQ0EsT0FBQSxHQUFVLE1BSFo7O0FBRG9COztBQU10QixJQUFBLEdBQU8sUUFBQSxDQUFDLEVBQUQsQ0FBQTtFQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLENBQUEsQ0FBWSxFQUFaLENBQUEsQ0FBWjtFQUNBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLEVBQXJCO1NBQ0EsT0FBQSxHQUFVO0FBSEw7O0FBS1AsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0VBQ0wsSUFBRyxDQUFJLE9BQUosSUFBZ0IsZ0JBQW5CO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUEsQ0FBckIsRUFGRjs7QUFESzs7QUFLUCxNQUFNLENBQUMsdUJBQVAsR0FBaUMsUUFBQSxDQUFBLENBQUE7RUFDL0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWjtFQUVBLE1BQUEsR0FBUyxJQUFJLEVBQUUsQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUF3QjtJQUMvQixLQUFBLEVBQU8sTUFEd0I7SUFFL0IsTUFBQSxFQUFRLE1BRnVCO0lBRy9CLE9BQUEsRUFBUyxhQUhzQjtJQUkvQixNQUFBLEVBQVE7TUFDTixPQUFBLEVBQVMsYUFESDtNQUVOLGFBQUEsRUFBZTtJQUZUO0VBSnVCLENBQXhCO0VBVVQsTUFBQSxHQUFTLEVBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsR0FBRCxDQUFBO0lBQ2hCLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWjtXQUNBLElBQUEsQ0FBSyxHQUFHLENBQUMsRUFBVDtFQUZnQixDQUFsQjtTQUlBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0FBbEIrQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInBsYXllciA9IG51bGxcclxuc29ja2V0ID0gbnVsbFxyXG5wbGF5aW5nID0gZmFsc2VcclxuXHJcbmVzY2FwZUh0bWwgPSAodCkgLT5cclxuICAgIHJldHVybiB0XHJcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcclxuICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcclxuICAgICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIilcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZXZlbnQuZGF0YSA9PSAwXHJcbiAgICAjIHBsYXllci5sb2FkVmlkZW9CeUlkKCdQQndBeG1yRTE5NCcpXHJcbiAgICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6IGZhbHNlXCJcclxuICAgIHBsYXlpbmcgPSBmYWxzZVxyXG5cclxucGxheSA9IChpZCkgLT5cclxuICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6ICN7aWR9XCJcclxuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChpZClcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxudGljayA9IC0+XHJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxyXG4gICAgc29ja2V0LmVtaXQgJ3JlYWR5Jywge31cclxuXHJcbndpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJvbllvdVR1YmVQbGF5ZXJBUElSZWFkeVwiXHJcblxyXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ3BsYXllcicsIHtcclxuICAgIHdpZHRoOiAnMTAwJSdcclxuICAgIGhlaWdodDogJzEwMCUnXHJcbiAgICB2aWRlb0lkOiAneHBtUUtfdVBEcGcnICMgbnlhbiBjYXQsIHRoaXMgd2lsbCBiZSByZXBsYWNlZCBhbG1vc3QgaW1tZWRpYXRlbHlcclxuICAgIGV2ZW50czoge1xyXG4gICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XHJcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgY29uc29sZS5sb2cgcGt0XHJcbiAgICBwbGF5KHBrdC5pZClcclxuXHJcbiAgc2V0SW50ZXJ2YWwodGljaywgMzAwMClcclxuIl19
