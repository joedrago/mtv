(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var endedTimer, onPlayerReady, onPlayerStateChange, play, player, playing, qs, sendReady, serverEpoch, socket, tick;

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
  id = id.replace(/_/g, "");
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
  if (!playing && (player != null)) {
    return sendReady();
  }
};

window.onYouTubePlayerAPIReady = function() {
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxPQUFBLEdBQVU7O0FBQ1YsV0FBQSxHQUFjOztBQUVkLFVBQUEsR0FBYTs7QUFFYixFQUFBLEdBQUssUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUNMLE1BQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtFQUFFLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3RCLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsTUFBeEI7RUFDUCxLQUFBLEdBQVEsSUFBSSxNQUFKLENBQVcsTUFBQSxHQUFTLElBQVQsR0FBZ0IsbUJBQTNCO0VBQ1IsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWDtFQUNWLElBQUcsQ0FBSSxPQUFKLElBQWUsQ0FBSSxPQUFPLENBQUMsQ0FBRCxDQUE3QjtBQUNFLFdBQU8sS0FEVDs7QUFFQSxTQUFPLGtCQUFBLENBQW1CLE9BQU8sQ0FBQyxDQUFELENBQUcsQ0FBQyxPQUFYLENBQW1CLEtBQW5CLEVBQTBCLEdBQTFCLENBQW5CO0FBUEosRUFQTDs7O0FBaUJBLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLEtBQUQsQ0FBQTtTQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBYixDQUFBO0FBRGMsRUFqQmhCOzs7QUFxQkEsbUJBQUEsR0FBc0IsUUFBQSxDQUFDLEtBQUQsQ0FBQTtBQUN0QixNQUFBO0VBQUUsSUFBRyxrQkFBSDtJQUNFLFlBQUEsQ0FBYSxVQUFiO0lBQ0Es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QUFDO0VBSkgsQ0FBcEI7U0FNQSxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtBQXpCK0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG4jIGF1dG9wbGF5IHZpZGVvXHJcbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XHJcbiAgZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpXHJcblxyXG4jIHdoZW4gdmlkZW8gZW5kc1xyXG5vblBsYXllclN0YXRlQ2hhbmdlID0gKGV2ZW50KSAtPlxyXG4gIGlmIGVuZGVkVGltZXI/XHJcbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcclxuICAgIGVuZGVkVGltZXIgPSBudWxsXHJcblxyXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxyXG4gIGlmIHZpZGVvRGF0YT8gYW5kIHZpZGVvRGF0YS50aXRsZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVGl0bGU6ICN7dmlkZW9EYXRhLnRpdGxlfVwiXHJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxyXG5cclxuICBpZiBldmVudC5kYXRhID09IDBcclxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxyXG4gICAgZW5kZWRUaW1lciA9IHNldFRpbWVvdXQoIC0+XHJcbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxyXG4gICAgLCAyMDAwKVxyXG5cclxucGxheSA9IChpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgaWQgPSBpZC5yZXBsYWNlKC9fL2csIFwiXCIpXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcclxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXHJcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXHJcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXHJcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxuc2VuZFJlYWR5ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciB9XHJcblxyXG50aWNrID0gLT5cclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc2VuZFJlYWR5KClcclxuXHJcbndpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJvbllvdVR1YmVQbGF5ZXJBUElSZWFkeVwiXHJcblxyXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ3BsYXllcicsIHtcclxuICAgIHdpZHRoOiAnMTAwJSdcclxuICAgIGhlaWdodDogJzEwMCUnXHJcbiAgICB2aWRlb0lkOiAnQUI3eWtPZkFnSUEnICMgTVRWIGxvYWRpbmcgc2NyZWVuLCB0aGlzIHdpbGwgYmUgcmVwbGFjZWQgYWxtb3N0IGltbWVkaWF0ZWx5XHJcbiAgICBwbGF5ZXJWYXJzOiB7ICdhdXRvcGxheSc6IDEsICdjb250cm9scyc6IDAgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBwa3RcclxuICAgIHBsYXkocGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gIHNvY2tldC5vbiAnc2VydmVyJywgKHNlcnZlcikgLT5cclxuICAgIGlmIHNlcnZlckVwb2NoPyBhbmQgKHNlcnZlckVwb2NoICE9IHNlcnZlci5lcG9jaClcclxuICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxyXG4gICAgICBzZW5kUmVhZHkoKVxyXG4gICAgc2VydmVyRXBvY2ggPSBzZXJ2ZXIuZXBvY2hcclxuXHJcbiAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcclxuIl19
