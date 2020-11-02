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
  if (youtubeReady) {
    return;
  }
  youtubeReady = true;
  console.log("onYouTubePlayerAPIReady");
  player = new YT.Player('player', {
    width: '100%',
    height: '100%',
    videoId: 'AB7ykOfAgIA', // MTV loading screen, this will be replaced almost immediately
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUNWLFdBQUEsR0FBYzs7QUFFZCxVQUFBLEdBQWE7O0FBRWIsRUFBQSxHQUFLLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDTCxNQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7RUFBRSxHQUFBLEdBQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUN0QixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCO0VBQ1AsS0FBQSxHQUFRLElBQUksTUFBSixDQUFXLE1BQUEsR0FBUyxJQUFULEdBQWdCLG1CQUEzQjtFQUNSLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVg7RUFDVixJQUFHLENBQUksT0FBSixJQUFlLENBQUksT0FBTyxDQUFDLENBQUQsQ0FBN0I7QUFDRSxXQUFPLEtBRFQ7O0FBRUEsU0FBTyxrQkFBQSxDQUFtQixPQUFPLENBQUMsQ0FBRCxDQUFHLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFuQjtBQVBKLEVBUEw7OztBQWlCQSxhQUFBLEdBQWdCLFFBQUEsQ0FBQyxLQUFELENBQUE7U0FDZCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWIsQ0FBQTtBQURjLEVBakJoQjs7O0FBcUJBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBQyxLQUFELENBQUE7QUFDdEIsTUFBQTtFQUFFLElBQUcsa0JBQUg7SUFDRSxZQUFBLENBQWEs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cUJBQUEsSUFBaUIsQ0FBQyxXQUFBLEtBQWUsTUFBTSxDQUFDLEtBQXZCLENBQXBCO01BQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnRkFBWjtNQUNBLFNBQUEsQ0FBQSxFQUZGOztXQUdBLFdBQUEsR0FBYyxNQUFNLENBQUM7RUFKSCxDQUFwQjtTQU1BLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0FBN0IrQjs7QUErQmpDLFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQSxFQUFBOztFQUVULElBQUcsQ0FBSSxZQUFQO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWjtXQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLEVBRkY7O0FBRlMsQ0FBWCxFQUtFLElBTEYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG4jIGF1dG9wbGF5IHZpZGVvXHJcbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XHJcbiAgZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpXHJcblxyXG4jIHdoZW4gdmlkZW8gZW5kc1xyXG5vblBsYXllclN0YXRlQ2hhbmdlID0gKGV2ZW50KSAtPlxyXG4gIGlmIGVuZGVkVGltZXI/XHJcbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcclxuICAgIGVuZGVkVGltZXIgPSBudWxsXHJcblxyXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxyXG4gIGlmIHZpZGVvRGF0YT8gYW5kIHZpZGVvRGF0YS50aXRsZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVGl0bGU6ICN7dmlkZW9EYXRhLnRpdGxlfVwiXHJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxyXG5cclxuICBpZiBldmVudC5kYXRhID09IDBcclxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxyXG4gICAgZW5kZWRUaW1lciA9IHNldFRpbWVvdXQoIC0+XHJcbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxyXG4gICAgLCAyMDAwKVxyXG5cclxucGxheSA9IChpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcclxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXHJcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXHJcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXHJcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxuc2VuZFJlYWR5ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciB9XHJcblxyXG50aWNrID0gLT5cclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc2VuZFJlYWR5KClcclxuICAgIHJldHVyblxyXG5cclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyIH1cclxuXHJcbnlvdXR1YmVSZWFkeSA9IGZhbHNlXHJcbndpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSA9IC0+XHJcbiAgaWYgeW91dHViZVJlYWR5XHJcbiAgICByZXR1cm5cclxuICB5b3V0dWJlUmVhZHkgPSB0cnVlXHJcblxyXG4gIGNvbnNvbGUubG9nIFwib25Zb3VUdWJlUGxheWVyQVBJUmVhZHlcIlxyXG5cclxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdwbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnY29udHJvbHMnOiAwIH1cclxuICAgIGV2ZW50czoge1xyXG4gICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XHJcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgY29uc29sZS5sb2cgcGt0XHJcbiAgICBwbGF5KHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxyXG5cclxuICBzb2NrZXQub24gJ3NlcnZlcicsIChzZXJ2ZXIpIC0+XHJcbiAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiU2VydmVyIGVwb2NoIGNoYW5nZWQhIFRoZSBzZXJ2ZXIgbXVzdCBoYXZlIHJlYm9vdGVkLiBSZXF1ZXN0aW5nIGZyZXNoIHZpZGVvLi4uXCJcclxuICAgICAgc2VuZFJlYWR5KClcclxuICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gIHNldEludGVydmFsKHRpY2ssIDUwMDApXHJcblxyXG5zZXRUaW1lb3V0IC0+XHJcbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcclxuICBpZiBub3QgeW91dHViZVJlYWR5XHJcbiAgICBjb25zb2xlLmxvZyBcImtpY2tpbmcgWW91dHViZS4uLlwiXHJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxyXG4sIDMwMDBcclxuIl19
