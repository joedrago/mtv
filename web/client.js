(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var endedTimer, fadeIn, fadeOut, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, play, player, playing, qs, sendReady, serverEpoch, showTitles, socket, tick, youtubeReady;

player = null;

socket = null;

playing = false;

serverEpoch = null;

endedTimer = null;

overTimers = [];

opinionOrder = [
  'like',
  'meh',
  'bleh',
  'hate' // always in this specific order
];

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

showTitles = true;

if (qs('hidetitles')) {
  showTitles = false;
}

fadeIn = function(elem, ms) {
  var opacity, timer;
  if (elem == null) {
    return;
  }
  elem.style.opacity = 0;
  elem.style.filter = "alpha(opacity=0)";
  elem.style.display = "inline-block";
  elem.style.visibility = "visible";
  if ((ms != null) && ms > 0) {
    opacity = 0;
    return timer = setInterval(function() {
      opacity += 50 / ms;
      if (opacity >= 1) {
        clearInterval(timer);
        opacity = 1;
      }
      elem.style.opacity = opacity;
      return elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
    }, 50);
  } else {
    elem.style.opacity = 1;
    return elem.style.filter = "alpha(opacity=1)";
  }
};

fadeOut = function(elem, ms) {
  var opacity, timer;
  if (elem == null) {
    return;
  }
  if ((ms != null) && ms > 0) {
    opacity = 1;
    return timer = setInterval(function() {
      opacity -= 50 / ms;
      if (opacity <= 0) {
        clearInterval(timer);
        opacity = 0;
        elem.style.display = "none";
        elem.style.visibility = "hidden";
      }
      elem.style.opacity = opacity;
      return elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
    }, 50);
  } else {
    elem.style.opacity = 0;
    elem.style.filter = "alpha(opacity=0)";
    elem.style.display = "none";
    return elem.style.visibility = "hidden";
  }
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

play = function(pkt, id, startSeconds = null, endSeconds = null) {
  var artist, feeling, feelings, html, i, j, k, len, len1, len2, list, o, opts, overElement, t, title;
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
  playing = true;
  console.log(pkt);
  overElement = document.getElementById("over");
  overElement.style.display = "none";
  if (showTitles) {
    artist = pkt.artist;
    artist = artist.replace(/^\s+/, "");
    artist = artist.replace(/\s+$/, "");
    title = pkt.title;
    title = title.replace(/^\s+/, "");
    title = title.replace(/\s+$/, "");
    html = `${artist}\n\"${title}\"`;
    feelings = [];
    for (i = 0, len = opinionOrder.length; i < len; i++) {
      o = opinionOrder[i];
      if (pkt.opinions[o] != null) {
        feelings.push(o);
      }
    }
    if (feelings.length === 0) {
      html += "\nNo Opinions";
    } else {
      for (j = 0, len1 = feelings.length; j < len1; j++) {
        feeling = feelings[j];
        list = pkt.opinions[feeling];
        html += `\n${feeling.charAt(0).toUpperCase() + feeling.slice(1)}: ${list.join(',')}`;
      }
    }
    overElement.innerHTML = html;
    for (k = 0, len2 = overTimers.length; k < len2; k++) {
      t = overTimers[k];
      clearTimeout(t);
    }
    overTimers = [];
    overTimers.push(setTimeout(function() {
      return fadeIn(overElement, 1000);
    }, 3000));
    return overTimers.push(setTimeout(function() {
      return fadeOut(overElement, 1000);
    }, 15000));
  }
};

sendReady = function() {
  var sfw, user;
  console.log("Ready");
  user = qs('user');
  sfw = false;
  if (qs('sfw')) {
    sfw = true;
  }
  return socket.emit('ready', {
    user: user,
    sfw: sfw
  });
};

tick = function() {
  var sfw, user;
  if (!playing && (player != null)) {
    sendReady();
    return;
  }
  user = qs('user');
  sfw = false;
  if (qs('sfw')) {
    sfw = true;
  }
  return socket.emit('playing', {
    user: user,
    sfw: sfw
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
    // console.log pkt
    return play(pkt, pkt.id, pkt.start, pkt.end);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLGFBQUEsRUFBQSxtQkFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxPQUFBLEdBQVU7O0FBQ1YsV0FBQSxHQUFjOztBQUVkLFVBQUEsR0FBYTs7QUFDYixVQUFBLEdBQWE7O0FBRWIsWUFBQSxHQUFlO0VBQUMsTUFBRDtFQUFTLEtBQVQ7RUFBZ0IsTUFBaEI7RUFBd0IsTUFBeEI7OztBQUVmLEVBQUEsR0FBSyxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ0wsTUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0VBQUUsR0FBQSxHQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDdEIsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixNQUF4QjtFQUNQLEtBQUEsR0FBUSxJQUFJLE1BQUosQ0FBVyxNQUFBLEdBQVMsSUFBVCxHQUFnQixtQkFBM0I7RUFDUixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYO0VBQ1YsSUFBRyxDQUFJLE9BQUosSUFBZSxDQUFJLE9BQU8sQ0FBQyxDQUFELENBQTdCO0FBQ0UsV0FBTyxLQURUOztBQUVBLFNBQU8sa0JBQUEsQ0FBbUIsT0FBTyxDQUFDLENBQUQsQ0FBRyxDQUFDLE9BQVgsQ0FBbUIsS0FBbkIsRUFBMEIsR0FBMUIsQ0FBbkI7QUFQSjs7QUFTTCxVQUFBLEdBQWE7O0FBQ2IsSUFBRyxFQUFBLENBQUcsWUFBSCxDQUFI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QUFBLEVBQVMsYUFIc0I7SUFJL0IsVUFBQSxFQUFZO01BQUUsVUFBQSxFQUFZLENBQWQ7TUFBaUIsVUFBQSxFQUFZO0lBQTdCLENBSm1CO0lBSy9CLE1BQUEsRUFBUTtNQUNOLE9BQUEsRUFBUyxhQURIO01BRU4sYUFBQSxFQUFlO0lBRlQ7RUFMdUIsQ0FBeEI7RUFXVCxNQUFBLEdBQVMsRUFBQSxDQUFBO0VBQ1QsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFFBQUEsQ0FBQyxHQUFELENBQUEsRUFBQTs7V0FFaEIsSUFBQSxDQUFLLEdBQUwsRUFBVSxHQUFHLENBQUMsRUFBZCxFQUFrQixHQUFHLENBQUMsS0FBdEIsRUFBNkIsR0FBRyxDQUFDLEdBQWpDO0VBRmdCLENBQWxCO0VBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFFBQUEsQ0FBQyxNQUFELENBQUE7SUFDbEIsSUFBRyxxQkFBQSxJQUFpQixDQUFDLFdBQUEsS0FBZSxNQUFNLENBQUMsS0FBdkIsQ0FBcEI7TUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGdGQUFaO01BQ0EsU0FBQSxDQUFBLEVBRkY7O1dBR0EsV0FBQSxHQUFjLE1BQU0sQ0FBQztFQUpILENBQXBCO1NBTUEsV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBbEI7QUFqQytCOztBQW1DakMsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBLEVBQUE7O0VBRVQsSUFBRyxDQUFJLFlBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaO1dBQ0EsTUFBTSxDQUFDLHVCQUFQLENBQUEsRUFGRjs7QUFGUyxDQUFYLEVBS0UsSUFMRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInBsYXllciA9IG51bGxcclxuc29ja2V0ID0gbnVsbFxyXG5wbGF5aW5nID0gZmFsc2Vcclxuc2VydmVyRXBvY2ggPSBudWxsXHJcblxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5vdmVyVGltZXJzID0gW11cclxuXHJcbm9waW5pb25PcmRlciA9IFsnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbnNob3dUaXRsZXMgPSB0cnVlXHJcbmlmIHFzKCdoaWRldGl0bGVzJylcclxuICBzaG93VGl0bGVzID0gZmFsc2VcclxuXHJcbmZhZGVJbiA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCJcclxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDBcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSArPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDFcclxuXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXHJcblxyXG5mYWRlT3V0ID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMVxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA8PSAwXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMFxyXG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgdmlkZW9EYXRhID0gcGxheWVyLmdldFZpZGVvRGF0YSgpXHJcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xyXG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcclxuICAgIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9IFwiI3t2aWRlb0RhdGEudGl0bGV9IC0gW1tNVFZdXVwiXHJcblxyXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxyXG4gICAgY29uc29sZS5sb2cgXCJFTkRFRFwiXHJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cclxuICAgICAgcGxheWluZyA9IGZhbHNlXHJcbiAgICAsIDIwMDApXHJcblxyXG5wbGF5ID0gKHBrdCwgaWQsIHN0YXJ0U2Vjb25kcyA9IG51bGwsIGVuZFNlY29uZHMgPSBudWxsKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxyXG4gIG9wdHMgPSB7XHJcbiAgICB2aWRlb0lkOiBpZFxyXG4gIH1cclxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXHJcbiAgICBvcHRzLnN0YXJ0U2Vjb25kcyA9IHN0YXJ0U2Vjb25kc1xyXG4gIGlmIGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+PSAxKVxyXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xyXG4gIHBsYXllci5sb2FkVmlkZW9CeUlkKG9wdHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgY29uc29sZS5sb2cgcGt0XHJcblxyXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXHJcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcblxyXG4gIGlmIHNob3dUaXRsZXNcclxuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcclxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG5cXFwiI3t0aXRsZX1cXFwiXCJcclxuICAgIGZlZWxpbmdzID0gW11cclxuICAgIGZvciBvIGluIG9waW5pb25PcmRlclxyXG4gICAgICBpZiBwa3Qub3BpbmlvbnNbb10/XHJcbiAgICAgICAgZmVlbGluZ3MucHVzaCBvXHJcbiAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxyXG4gICAgICBodG1sICs9IFwiXFxuTm8gT3BpbmlvbnNcIlxyXG4gICAgZWxzZVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xyXG4gICAgICAgIGxpc3QgPSBwa3Qub3BpbmlvbnNbZmVlbGluZ11cclxuICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsJyl9XCJcclxuICAgIG92ZXJFbGVtZW50LmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICBmb3IgdCBpbiBvdmVyVGltZXJzXHJcbiAgICAgIGNsZWFyVGltZW91dCh0KVxyXG4gICAgb3ZlclRpbWVycyA9IFtdXHJcbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgICBmYWRlSW4ob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgICAsIDMwMDBcclxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIGZhZGVPdXQob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgICAsIDE1MDAwXHJcblxyXG5zZW5kUmVhZHkgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbnRpY2sgPSAtPlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzZW5kUmVhZHkoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncGxheWluZycsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxyXG5cclxueW91dHViZVJlYWR5ID0gZmFsc2Vcclxud2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5ID0gLT5cclxuICBpZiB5b3V0dWJlUmVhZHlcclxuICAgIHJldHVyblxyXG4gIHlvdXR1YmVSZWFkeSA9IHRydWVcclxuXHJcbiAgY29uc29sZS5sb2cgXCJvbllvdVR1YmVQbGF5ZXJBUElSZWFkeVwiXHJcblxyXG4gIHNob3dDb250cm9scyA9IDBcclxuICBpZiBxcygnY29udHJvbHMnKVxyXG4gICAgc2hvd0NvbnRyb2xzID0gMVxyXG5cclxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdwbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgcGxheShwa3QsIHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxyXG5cclxuICBzb2NrZXQub24gJ3NlcnZlcicsIChzZXJ2ZXIpIC0+XHJcbiAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiU2VydmVyIGVwb2NoIGNoYW5nZWQhIFRoZSBzZXJ2ZXIgbXVzdCBoYXZlIHJlYm9vdGVkLiBSZXF1ZXN0aW5nIGZyZXNoIHZpZGVvLi4uXCJcclxuICAgICAgc2VuZFJlYWR5KClcclxuICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gIHNldEludGVydmFsKHRpY2ssIDUwMDApXHJcblxyXG5zZXRUaW1lb3V0IC0+XHJcbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcclxuICBpZiBub3QgeW91dHViZVJlYWR5XHJcbiAgICBjb25zb2xlLmxvZyBcImtpY2tpbmcgWW91dHViZS4uLlwiXHJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxyXG4sIDMwMDBcclxuIl19
