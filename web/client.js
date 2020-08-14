(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var endedTimer, onPlayerReady, onPlayerStateChange, play, player, playing, serverEpoch, socket, tick;

player = null;

socket = null;

playing = false;

serverEpoch = null;

endedTimer = null;

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
      socket.emit('ready', {});
    }
    return serverEpoch = server.epoch;
  });
  return setInterval(tick, 5000);
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUNWLFdBQUEsR0FBYzs7QUFFZCxVQUFBLEdBQWEsS0FMYjs7O0FBUUEsYUFBQSxHQUFnQixRQUFBLENBQUMsS0FBRCxDQUFBO1NBQ2QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFiLENBQUE7QUFEYyxFQVJoQjs7O0FBWUEsbUJBQUEsR0FBc0IsUUFBQSxDQUFDLEtBQUQsQ0FBQTtBQUN0QixNQUFBO0VBQUUsSUFBRyxrQkFBSDtJQUNFLFlBQUEsQ0FBYSxVQUFiO0lBQ0EsVUFBQSxHQUFhLEtBRmY7O0VBSUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7RUFDWixJQUFHLG1CQUFBLElBQWUseUJBQWxCO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLE9BQUEsQ0FBQSxDQUFVLFNBQVMsQ0FBQyxLQUFwQixDQUFBLENBQVo7SUFDQSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQWhCLEdBQXdCLENBQUEsQ0FBQSxDQUFHLFNBQVMsQ0FBQyxLQUFiLENBQUEsVUFBQSxFQUYxQjs7RUFJQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsQ0FBakI7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7V0FDQSxVQUFBLEdBQWEsVUFBQSxDQUFZLFFBQUEsQ0FBQSxDQUFBO2FBQ3ZCLE9BQUEsR0FBVTtJQURhLENBQVosRUFFWCxJQUZXLEVBRmY7O0FBVm9COztBQWdCdEIsSUFBQSxHQUFPLFFBQUEsQ0FBQyxFQUFELEVBQUssZUFBZSxJQUFwQixFQUEwQixhQUFhLElBQXZDLENBQUE7QUFDUCxNQUFBO0VBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFNBQUEsQ0FBQSxDQUFZLEVBQVosQ0FBQSxDQUFaO0VBQ0EsSUFBQSxHQUFPO0lBQ0wsT0FBQSxFQUFTO0VBREo7RUFHUCxJQUFHLHNCQUFBLElBQWtCLENBQUMsWUFBQSxJQUFnQixDQUFqQixDQUFyQjtJQUNFLElBQUksQ0FBQyxZQUFMLEdBQW9CLGFBRHRCOztFQUVBLElBQUcsb0JBQUEsSUFBZ0IsQ0FBQyxVQUFBLElBQWMsQ0FBZixDQUFuQjtJQUNFLElBQUksQ0FBQyxVQUFMLEdBQWtCLFdBRHBCOztFQUVBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQXJCO1NBQ0EsT0FBQSxHQUFVO0FBVkw7O0FBWVAsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0VBQ0wsSUFBRyxDQUFJLE9BQUosSUFBZ0IsZ0JBQW5CO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUEsQ0FBckIsRUFGRjs7QUFESzs7QUFLUCxNQUFNLENBQUMsdUJBQVAsR0FBaUMsUUFBQSxDQUFBLENBQUE7RUFDL0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWjtFQUVBLE1BQUEsR0FBUyxJQUFJLEVBQUUsQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUF3QjtJQUMvQixLQUFBLEVBQU8sTUFEd0I7SUFFL0IsTUFBQSxFQUFRLE1BRnVCO0lBRy9CLE9BQUEsRUFBUyxhQUhzQjtJQUkvQixVQUFBLEVBQVk7TUFBRSxVQUFBLEVBQVksQ0FBZDtNQUFpQixVQUFBLEVBQVk7SUFBN0IsQ0FKbUI7SUFLL0IsTUFBQSxFQUFRO01BQ04sT0FBQSxFQUFTLGFBREg7TUFFTixhQUFBLEVBQWU7SUFGVDtFQUx1QixDQUF4QjtFQVdULE1BQUEsR0FBUyxFQUFBLENBQUE7RUFDVCxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtJQUNoQixPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7V0FDQSxJQUFBLENBQUssR0FBRyxDQUFDLEVBQVQsRUFBYSxHQUFHLENBQUMsS0FBakIsRUFBd0IsR0FBRyxDQUFDLEdBQTVCO0VBRmdCLENBQWxCO0VBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFFBQUEsQ0FBQyxNQUFELENBQUE7SUFDbEIsSUFBRyxxQkFBQSxJQUFpQixDQUFDLFdBQUEsS0FBZSxNQUFNLENBQUMsS0FBdkIsQ0FBcEI7TUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGdGQUFaO01BQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUEsQ0FBckIsRUFGRjs7V0FHQSxXQUFBLEdBQWMsTUFBTSxDQUFDO0VBSkgsQ0FBcEI7U0FNQSxXQUFBLENBQVksSUFBWixFQUFrQixJQUFsQjtBQXpCK0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgdmlkZW9EYXRhID0gcGxheWVyLmdldFZpZGVvRGF0YSgpXHJcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xyXG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcclxuICAgIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9IFwiI3t2aWRlb0RhdGEudGl0bGV9IC0gW1tNVFZdXVwiXHJcblxyXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxyXG4gICAgY29uc29sZS5sb2cgXCJFTkRFRFwiXHJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cclxuICAgICAgcGxheWluZyA9IGZhbHNlXHJcbiAgICAsIDIwMDApXHJcblxyXG5wbGF5ID0gKGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cclxuICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6ICN7aWR9XCJcclxuICBvcHRzID0ge1xyXG4gICAgdmlkZW9JZDogaWRcclxuICB9XHJcbiAgaWYgc3RhcnRTZWNvbmRzPyBhbmQgKHN0YXJ0U2Vjb25kcyA+PSAwKVxyXG4gICAgb3B0cy5zdGFydFNlY29uZHMgPSBzdGFydFNlY29uZHNcclxuICBpZiBlbmRTZWNvbmRzPyBhbmQgKGVuZFNlY29uZHMgPj0gMSlcclxuICAgIG9wdHMuZW5kU2Vjb25kcyA9IGVuZFNlY29uZHNcclxuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChvcHRzKVxyXG4gIHBsYXlpbmcgPSB0cnVlXHJcblxyXG50aWNrID0gLT5cclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgY29uc29sZS5sb2cgXCJSZWFkeVwiXHJcbiAgICBzb2NrZXQuZW1pdCAncmVhZHknLCB7fVxyXG5cclxud2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuXHJcbiAgcGxheWVyID0gbmV3IFlULlBsYXllciAncGxheWVyJywge1xyXG4gICAgd2lkdGg6ICcxMDAlJ1xyXG4gICAgaGVpZ2h0OiAnMTAwJSdcclxuICAgIHZpZGVvSWQ6ICdBQjd5a09mQWdJQScgIyBNVFYgbG9hZGluZyBzY3JlZW4sIHRoaXMgd2lsbCBiZSByZXBsYWNlZCBhbG1vc3QgaW1tZWRpYXRlbHlcclxuICAgIHBsYXllclZhcnM6IHsgJ2F1dG9wbGF5JzogMSwgJ2NvbnRyb2xzJzogMCB9XHJcbiAgICBldmVudHM6IHtcclxuICAgICAgb25SZWFkeTogb25QbGF5ZXJSZWFkeVxyXG4gICAgICBvblN0YXRlQ2hhbmdlOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgcGxheShwa3QuaWQsIHBrdC5zdGFydCwgcGt0LmVuZClcclxuXHJcbiAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxyXG4gICAgaWYgc2VydmVyRXBvY2g/IGFuZCAoc2VydmVyRXBvY2ggIT0gc2VydmVyLmVwb2NoKVxyXG4gICAgICBjb25zb2xlLmxvZyBcIlNlcnZlciBlcG9jaCBjaGFuZ2VkISBUaGUgc2VydmVyIG11c3QgaGF2ZSByZWJvb3RlZC4gUmVxdWVzdGluZyBmcmVzaCB2aWRlby4uLlwiXHJcbiAgICAgIHNvY2tldC5lbWl0ICdyZWFkeScsIHt9XHJcbiAgICBzZXJ2ZXJFcG9jaCA9IHNlcnZlci5lcG9jaFxyXG5cclxuICBzZXRJbnRlcnZhbCh0aWNrLCA1MDAwKVxyXG4iXX0=
