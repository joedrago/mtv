(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var endedTimer, onPlayerReady, onPlayerStateChange, play, player, playing, qs, sendReady, serverEpoch, socket, tick, youtubeReady;

player = null;

socket = null;

playing = false;

serverEpoch = null;

endedTimer = null;

qs = function(name) {
  var regex, results, url;
  url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  results = regex.exec(url);
  if (!results || !results[2]) {
    return null;
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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

sendReady = function() {
  var user;
  console.log("Ready");
  user = qs('user');
  return socket.emit('ready', {
    user: user
  });
};

tick = function() {
  var user;
  if (!playing && (player != null)) {
    sendReady();
    return;
  }
  user = qs('user');
  return socket.emit('playing', {
    user: user
  });
};

youtubeReady = false;

window.onYouTubePlayerAPIReady = function() {
  var showControls;
  if (youtubeReady) {
    return;
  }
  youtubeReady = true;
  console.log("onYouTubePlayerAPIReady");
  showControls = 0;
  if (qs('controls')) {
    showControls = 1;
  }
  player = new YT.Player('player', {
    width: '100%',
    height: '100%',
    videoId: 'AB7ykOfAgIA', // MTV loading screen, this will be replaced almost immediately
    playerVars: {
      'autoplay': 1,
      'controls': showControls
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
  socket.on('server', function(server) {
    if ((serverEpoch != null) && (serverEpoch !== server.epoch)) {
      console.log("Server epoch changed! The server must have rebooted. Requesting fresh video...");
      sendReady();
    }
    return serverEpoch = server.epoch;
  });
  return setInterval(tick, 5000);
};

setTimeout(function() {
  // somehow we missed this event, just kick it manually
  if (!youtubeReady) {
    console.log("kicking Youtube...");
    return window.onYouTubePlayerAPIReady();
  }
}, 3000);


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUNWLFdBQUEsR0FBYzs7QUFFZCxVQUFBLEdBQWE7O0FBRWIsRUFBQSxHQUFLLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDTCxNQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7RUFBRSxHQUFBLEdBQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUN0QixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCO0VBQ1AsS0FBQSxHQUFRLElBQUksTUFBSixDQUFXLE1BQUEsR0FBUyxJQUFULEdBQWdCLG1CQUEzQjtFQUNSLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVg7RUFDVixJQUFHLENBQUksT0FBSixJQUFlLENBQUksT0FBTyxDQUFDLENBQUQsQ0FBN0I7QUFDRSxXQUFPLEtBRFQ7O0FBRUEsU0FBTyxrQkFBQSxDQUFtQixPQUFPLENBQUMsQ0FBRCxDQUFHLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFuQjtBQVBKLEVBUEw7OztBQWlCQSxhQUFBLEdBQWdCLFFBQUEsQ0FBQyxLQUFELENBQUE7U0FDZCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWIsQ0FBQTtBQURjLEVBakJoQjs7O0FBcUJBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBQyxLQUFELENBQUE7QUFDdEIsTUFBQTtFQUFFLElBQUcsa0JBQUg7SUFDRSxZQUFBLENBQWEs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RmdCLENBQWxCO0VBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFFBQUEsQ0FBQyxNQUFELENBQUE7SUFDbEIsSUFBRyxxQkFBQSxJQUFpQixDQUFDLFdBQUEsS0FBZSxNQUFNLENBQUMsS0FBdkIsQ0FBcEI7TUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGdGQUFaO01BQ0EsU0FBQSxDQUFBLEVBRkY7O1dBR0EsV0FBQSxHQUFjLE1BQU0sQ0FBQztFQUpILENBQXBCO1NBTUEsV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBbEI7QUFqQytCOztBQW1DakMsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBLEVBQUE7O0VBRVQsSUFBRyxDQUFJLFlBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaO1dBQ0EsTUFBTSxDQUFDLHVCQUFQLENBQUEsRUFGRjs7QUFGUyxDQUFYLEVBS0UsSUFMRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInBsYXllciA9IG51bGxcbnNvY2tldCA9IG51bGxcbnBsYXlpbmcgPSBmYWxzZVxuc2VydmVyRXBvY2ggPSBudWxsXG5cbmVuZGVkVGltZXIgPSBudWxsXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG4jIGF1dG9wbGF5IHZpZGVvXG5vblBsYXllclJlYWR5ID0gKGV2ZW50KSAtPlxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcblxuIyB3aGVuIHZpZGVvIGVuZHNcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XG4gIGlmIGVuZGVkVGltZXI/XG4gICAgY2xlYXJUaW1lb3V0KGVuZGVkVGltZXIpXG4gICAgZW5kZWRUaW1lciA9IG51bGxcblxuICB2aWRlb0RhdGEgPSBwbGF5ZXIuZ2V0VmlkZW9EYXRhKClcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xuICAgIGNvbnNvbGUubG9nIFwiVGl0bGU6ICN7dmlkZW9EYXRhLnRpdGxlfVwiXG4gICAgd2luZG93LmRvY3VtZW50LnRpdGxlID0gXCIje3ZpZGVvRGF0YS50aXRsZX0gLSBbW01UVl1dXCJcblxuICBpZiBldmVudC5kYXRhID09IDBcbiAgICBjb25zb2xlLmxvZyBcIkVOREVEXCJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxuICAgICwgMjAwMClcblxucGxheSA9IChpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxuICBvcHRzID0ge1xuICAgIHZpZGVvSWQ6IGlkXG4gIH1cbiAgaWYgc3RhcnRTZWNvbmRzPyBhbmQgKHN0YXJ0U2Vjb25kcyA+PSAwKVxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXG4gIGlmIGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+PSAxKVxuICAgIG9wdHMuZW5kU2Vjb25kcyA9IGVuZFNlY29uZHNcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcbiAgcGxheWluZyA9IHRydWVcblxuc2VuZFJlYWR5ID0gLT5cbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXG4gIHVzZXIgPSBxcygndXNlcicpXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciB9XG5cbnRpY2sgPSAtPlxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xuICAgIHNlbmRSZWFkeSgpXG4gICAgcmV0dXJuXG5cbiAgdXNlciA9IHFzKCd1c2VyJylcbiAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIgfVxuXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxud2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5ID0gLT5cbiAgaWYgeW91dHViZVJlYWR5XG4gICAgcmV0dXJuXG4gIHlvdXR1YmVSZWFkeSA9IHRydWVcblxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcblxuICBzaG93Q29udHJvbHMgPSAwXG4gIGlmIHFzKCdjb250cm9scycpXG4gICAgc2hvd0NvbnRyb2xzID0gMVxuXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ3BsYXllcicsIHtcbiAgICB3aWR0aDogJzEwMCUnXG4gICAgaGVpZ2h0OiAnMTAwJSdcbiAgICB2aWRlb0lkOiAnQUI3eWtPZkFnSUEnICMgTVRWIGxvYWRpbmcgc2NyZWVuLCB0aGlzIHdpbGwgYmUgcmVwbGFjZWQgYWxtb3N0IGltbWVkaWF0ZWx5XG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxuICAgIGV2ZW50czoge1xuICAgICAgb25SZWFkeTogb25QbGF5ZXJSZWFkeVxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxuICAgIH1cbiAgfVxuXG4gIHNvY2tldCA9IGlvKClcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICBjb25zb2xlLmxvZyBwa3RcbiAgICBwbGF5KHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxuXG4gIHNvY2tldC5vbiAnc2VydmVyJywgKHNlcnZlcikgLT5cbiAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXG4gICAgICBjb25zb2xlLmxvZyBcIlNlcnZlciBlcG9jaCBjaGFuZ2VkISBUaGUgc2VydmVyIG11c3QgaGF2ZSByZWJvb3RlZC4gUmVxdWVzdGluZyBmcmVzaCB2aWRlby4uLlwiXG4gICAgICBzZW5kUmVhZHkoKVxuICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXG5cbiAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcblxuc2V0VGltZW91dCAtPlxuICAjIHNvbWVob3cgd2UgbWlzc2VkIHRoaXMgZXZlbnQsIGp1c3Qga2ljayBpdCBtYW51YWxseVxuICBpZiBub3QgeW91dHViZVJlYWR5XG4gICAgY29uc29sZS5sb2cgXCJraWNraW5nIFlvdXR1YmUuLi5cIlxuICAgIHdpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpXG4sIDMwMDBcbiJdfQ==
