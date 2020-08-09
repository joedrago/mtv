(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var endedTimer, escapeHtml, onPlayerReady, onPlayerStateChange, play, player, playing, socket, tick;

player = null;

socket = null;

playing = false;

endedTimer = null;

escapeHtml = function(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// autoplay video
onPlayerReady = function(event) {
  return event.target.playVideo();
};

// when video ends
onPlayerStateChange = function(event) {
  var videoData;
  if (endedTimer != null) {
    clearTimeout(endedTimer);
    endedTimer = null;
  }
  videoData = player.getVideoData();
  if ((videoData != null) && (videoData.title != null)) {
    console.log(`Title: ${videoData.title}`);
    window.document.title = `${videoData.title} - [[MTV]]`;
  }
  if (event.data === 0) {
    console.log("ENDED");
    return endedTimer = setTimeout(function() {
      return playing = false;
    }, 2000);
  }
};

play = function(id, startSeconds = null, endSeconds = null) {
  var opts;
  console.log(`Playing: ${id}`);
  opts = {
    videoId: id
  };
  if ((startSeconds != null) && (startSeconds >= 0)) {
    opts.startSeconds = startSeconds;
  }
  if ((endSeconds != null) && (endSeconds >= 1)) {
    opts.endSeconds = endSeconds;
  }
  player.loadVideoById(opts);
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
    playerVars: {
      'autoplay': 1,
      'controls': 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
  socket = io();
  socket.on('play', function(pkt) {
    console.log(pkt);
    return play(pkt.id, pkt.start, pkt.end);
  });
  return setInterval(tick, 5000);
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLG1CQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUVWLFVBQUEsR0FBYTs7QUFFYixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNULFNBQU8sQ0FDTCxDQUFDLE9BREksQ0FDSSxJQURKLEVBQ1UsT0FEVixDQUVMLENBQUMsT0FGSSxDQUVJLElBRkosRUFFVSxNQUZWLENBR0wsQ0FBQyxPQUhJLENBR0ksSUFISixFQUdVLE1BSFYsQ0FJTCxDQUFDLE9BSkksQ0FJSSxJQUpKLEVBSVUsUUFKVixDQUtMLENBQUMsT0FMSSxDQUtJLElBTEosRUFLVSxRQUxWO0FBREUsRUFOYjs7O0FBZUEsYUFBQSxHQUFnQixRQUFBLENBQUMsS0FBRCxDQUFBO1NBQ2QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFiLENBQUE7QUFEYyxFQWZoQjs7O0FBbUJBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBQyxLQUFELENBQUE7QUFDdEIsTUFBQTtFQUFFLElBQUcsa0JBQUg7SUFDRSxZQUFBLENBQWEsVUFBYjtJQUNBLFVBQUEsR0FBYSxLQUZmOztFQUlBLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFBO0VBQ1osSUFBRyxtQkFBQSxJQUFlLHlCQUFsQjtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxPQUFBLENBQUEsQ0FBVSxTQUFTLENBQUMsS0FBcEIsQ0FBQSxDQUFaO0lBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFoQixHQUF3QixDQUFBLENBQUEsQ0FBRyxTQUFTLENBQUMsS0FBYixDQUFBLFVBQUEsRUFGMUI7O0VBSUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLENBQWpCO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsVUFBQSxHQUFhLFVBQUEsQ0FBWSxRQUFBLENBQUEsQ0FBQTthQUN2QixPQUFBLEdBQVU7SUFEYSxDQUFaLEVBRVgsSUFGVyxFQUZmOztBQVZvQjs7QUFnQnRCLElBQUEsR0FBTyxRQUFBLENBQUMsRUFBRCxFQUFLLGVBQWUsSUFBcEIsRUFBMEIsYUFBYSxJQUF2QyxDQUFBO0FBQ1AsTUFBQTtFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxTQUFBLENBQUEsQ0FBWSxFQUFaLENBQUEsQ0FBWjtFQUNBLElBQUEsR0FBTztJQUNMLE9BQUEsRUFBUztFQURKO0VBR1AsSUFBRyxzQkFBQSxJQUFrQixDQUFDLFlBQUEsSUFBZ0IsQ0FBakIsQ0FBckI7SUFDRSxJQUFJLENBQUMsWUFBTCxHQUFvQixhQUR0Qjs7RUFFQSxJQUFHLG9CQUFBLElBQWdCLENBQUMsVUFBQSxJQUFjLENBQWYsQ0FBbkI7SUFDRSxJQUFJLENBQUMsVUFBTCxHQUFrQixXQURwQjs7RUFFQSxNQUFNLENBQUMsYUFBUCxDQUFxQixJQUFyQjtTQUNBLE9BQUEsR0FBVTtBQVZMOztBQVlQLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtFQUNMLElBQUcsQ0FBSSxPQUFKLElBQWdCLGdCQUFuQjtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtXQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixDQUFBLENBQXJCLEVBRkY7O0FBREs7O0FBS1AsTUFBTSxDQUFDLHVCQUFQLEdBQWlDLFFBQUEsQ0FBQSxDQUFBO0VBQy9CLE9BQU8sQ0FBQyxHQUFSLENBQVkseUJBQVo7RUFFQSxNQUFBLEdBQVMsSUFBSSxFQUFFLENBQUMsTUFBUCxDQUFjLFFBQWQsRUFBd0I7SUFDL0IsS0FBQSxFQUFPLE1BRHdCO0lBRS9CLE1BQUEsRUFBUSxNQUZ1QjtJQUcvQixPQUFBLEVBQVMsYUFIc0I7SUFJL0IsVUFBQSxFQUFZO01BQUUsVUFBQSxFQUFZLENBQWQ7TUFBaUIsVUFBQSxFQUFZO0lBQTdCLENBSm1CO0lBSy9CLE1BQUEsRUFBUTtNQUNOLE9BQUEsRUFBUyxhQURIO01BRU4sYUFBQSxFQUFlO0lBRlQ7RUFMdUIsQ0FBeEI7RUFXVCxNQUFBLEdBQVMsRUFBQSxDQUFBO0VBQ1QsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFFBQUEsQ0FBQyxHQUFELENBQUE7SUFDaEIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO1dBQ0EsSUFBQSxDQUFLLEdBQUcsQ0FBQyxFQUFULEVBQWEsR0FBRyxDQUFDLEtBQWpCLEVBQXdCLEdBQUcsQ0FBQyxHQUE1QjtFQUZnQixDQUFsQjtTQUlBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0FBbkIrQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInBsYXllciA9IG51bGxcbnNvY2tldCA9IG51bGxcbnBsYXlpbmcgPSBmYWxzZVxuXG5lbmRlZFRpbWVyID0gbnVsbFxuXG5lc2NhcGVIdG1sID0gKHQpIC0+XG4gICAgcmV0dXJuIHRcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcbiAgICAgIC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKVxuICAgICAgLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcbiAgICAgIC5yZXBsYWNlKC8nL2csIFwiJiMwMzk7XCIpXG5cbiMgYXV0b3BsYXkgdmlkZW9cbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XG4gIGV2ZW50LnRhcmdldC5wbGF5VmlkZW8oKVxuXG4jIHdoZW4gdmlkZW8gZW5kc1xub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgLT5cbiAgaWYgZW5kZWRUaW1lcj9cbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcbiAgICBlbmRlZFRpbWVyID0gbnVsbFxuXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxuICBpZiB2aWRlb0RhdGE/IGFuZCB2aWRlb0RhdGEudGl0bGU/XG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxuXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxuICAgICAgcGxheWluZyA9IGZhbHNlXG4gICAgLCAyMDAwKVxuXG5wbGF5ID0gKGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXG4gIG9wdHMgPSB7XG4gICAgdmlkZW9JZDogaWRcbiAgfVxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXG4gICAgb3B0cy5zdGFydFNlY29uZHMgPSBzdGFydFNlY29uZHNcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChvcHRzKVxuICBwbGF5aW5nID0gdHJ1ZVxuXG50aWNrID0gLT5cbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcbiAgICBzb2NrZXQuZW1pdCAncmVhZHknLCB7fVxuXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcblxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdwbGF5ZXInLCB7XG4gICAgd2lkdGg6ICcxMDAlJ1xuICAgIGhlaWdodDogJzEwMCUnXG4gICAgdmlkZW9JZDogJ3hwbVFLX3VQRHBnJyAjIG55YW4gY2F0LCB0aGlzIHdpbGwgYmUgcmVwbGFjZWQgYWxtb3N0IGltbWVkaWF0ZWx5XG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnY29udHJvbHMnOiAwIH1cbiAgICBldmVudHM6IHtcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBzb2NrZXQgPSBpbygpXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XG4gICAgY29uc29sZS5sb2cgcGt0XG4gICAgcGxheShwa3QuaWQsIHBrdC5zdGFydCwgcGt0LmVuZClcblxuICBzZXRJbnRlcnZhbCh0aWNrLCA1MDAwKVxuIl19
