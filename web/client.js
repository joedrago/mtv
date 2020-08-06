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
  if (endedTimer != null) {
    clearTimeout(endedTimer);
    endedTimer = null;
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
      'controls': 1
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLG1CQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUVWLFVBQUEsR0FBYTs7QUFFYixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNULFNBQU8sQ0FDTCxDQUFDLE9BREksQ0FDSSxJQURKLEVBQ1UsT0FEVixDQUVMLENBQUMsT0FGSSxDQUVJLElBRkosRUFFVSxNQUZWLENBR0wsQ0FBQyxPQUhJLENBR0ksSUFISixFQUdVLE1BSFYsQ0FJTCxDQUFDLE9BSkksQ0FJSSxJQUpKLEVBSVUsUUFKVixDQUtMLENBQUMsT0FMSSxDQUtJLElBTEosRUFLVSxRQUxWO0FBREUsRUFOYjs7O0FBZUEsYUFBQSxHQUFnQixRQUFBLENBQUMsS0FBRCxDQUFBO1NBQ2QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFiLENBQUE7QUFEYyxFQWZoQjs7O0FBbUJBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBQyxLQUFELENBQUE7RUFDcEIsSUFBRyxrQkFBSDtJQUNFLFlBQUEsQ0FBYSxVQUFiO0lBQ0EsVUFBQSxHQUFhLEtBRmY7O0VBSUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLENBQWpCO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsVUFBQSxHQUFhLFVBQUEsQ0FBWSxRQUFBLENBQUEsQ0FBQTthQUN2QixPQUFBLEdBQVU7SUFEYSxDQUFaLEVBRVgsSUFGVyxFQUZmOztBQUxvQjs7QUFXdEIsSUFBQSxHQUFPLFFBQUEsQ0FBQyxFQUFELEVBQUssZUFBZSxJQUFwQixFQUEwQixhQUFhLElBQXZDLENBQUE7QUFDUCxNQUFBO0VBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFNBQUEsQ0FBQSxDQUFZLEVBQVosQ0FBQSxDQUFaO0VBQ0EsSUFBQSxHQUFPO0lBQ0wsT0FBQSxFQUFTO0VBREo7RUFHUCxJQUFHLHNCQUFBLElBQWtCLENBQUMsWUFBQSxJQUFnQixDQUFqQixDQUFyQjtJQUNFLElBQUksQ0FBQyxZQUFMLEdBQW9CLGFBRHRCOztFQUVBLElBQUcsb0JBQUEsSUFBZ0IsQ0FBQyxVQUFBLElBQWMsQ0FBZixDQUFuQjtJQUNFLElBQUksQ0FBQyxVQUFMLEdBQWtCLFdBRHBCOztFQUVBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQXJCO1NBQ0EsT0FBQSxHQUFVO0FBVkw7O0FBWVAsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0VBQ0wsSUFBRyxDQUFJLE9BQUosSUFBZ0IsZ0JBQW5CO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUEsQ0FBckIsRUFGRjs7QUFESzs7QUFLUCxNQUFNLENBQUMsdUJBQVAsR0FBaUMsUUFBQSxDQUFBLENBQUE7RUFDL0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWjtFQUVBLE1BQUEsR0FBUyxJQUFJLEVBQUUsQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUF3QjtJQUMvQixLQUFBLEVBQU8sTUFEd0I7SUFFL0IsTUFBQSxFQUFRLE1BRnVCO0lBRy9CLE9BQUEsRUFBUyxhQUhzQjtJQUkvQixVQUFBLEVBQVk7TUFBRSxVQUFBLEVBQVksQ0FBZDtNQUFpQixVQUFBLEVBQVk7SUFBN0IsQ0FKbUI7SUFLL0IsTUFBQSxFQUFRO01BQ04sT0FBQSxFQUFTLGFBREg7TUFFTixhQUFBLEVBQWU7SUFGVDtFQUx1QixDQUF4QjtFQVdULE1BQUEsR0FBUyxFQUFBLENBQUE7RUFDVCxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtJQUNoQixPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7V0FDQSxJQUFBLENBQUssR0FBRyxDQUFDLEVBQVQsRUFBYSxHQUFHLENBQUMsS0FBakIsRUFBd0IsR0FBRyxDQUFDLEdBQTVCO0VBRmdCLENBQWxCO1NBSUEsV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBbEI7QUFuQitCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwicGxheWVyID0gbnVsbFxyXG5zb2NrZXQgPSBudWxsXHJcbnBsYXlpbmcgPSBmYWxzZVxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbmVzY2FwZUh0bWwgPSAodCkgLT5cclxuICAgIHJldHVybiB0XHJcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcclxuICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcclxuICAgICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIilcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgaWYgZXZlbnQuZGF0YSA9PSAwXHJcbiAgICBjb25zb2xlLmxvZyBcIkVOREVEXCJcclxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxyXG4gICAgICBwbGF5aW5nID0gZmFsc2VcclxuICAgICwgMjAwMClcclxuXHJcbnBsYXkgPSAoaWQsIHN0YXJ0U2Vjb25kcyA9IG51bGwsIGVuZFNlY29uZHMgPSBudWxsKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxyXG4gIG9wdHMgPSB7XHJcbiAgICB2aWRlb0lkOiBpZFxyXG4gIH1cclxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXHJcbiAgICBvcHRzLnN0YXJ0U2Vjb25kcyA9IHN0YXJ0U2Vjb25kc1xyXG4gIGlmIGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+PSAxKVxyXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xyXG4gIHBsYXllci5sb2FkVmlkZW9CeUlkKG9wdHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbnRpY2sgPSAtPlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcclxuICAgIHNvY2tldC5lbWl0ICdyZWFkeScsIHt9XHJcblxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwib25Zb3VUdWJlUGxheWVyQVBJUmVhZHlcIlxyXG5cclxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdwbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ3hwbVFLX3VQRHBnJyAjIG55YW4gY2F0LCB0aGlzIHdpbGwgYmUgcmVwbGFjZWQgYWxtb3N0IGltbWVkaWF0ZWx5XHJcbiAgICBwbGF5ZXJWYXJzOiB7ICdhdXRvcGxheSc6IDEsICdjb250cm9scyc6IDEgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBwa3RcclxuICAgIHBsYXkocGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gIHNldEludGVydmFsKHRpY2ssIDUwMDApXHJcbiJdfQ==
