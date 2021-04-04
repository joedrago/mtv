(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var cacheOpinions, endedTimer, fadeIn, fadeOut, getData, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, play, player, playing, qs, sendReady, serverEpoch, showInfo, showTitles, socket, soloCommand, soloCount, soloDatabase, soloEnding, soloError, soloFatalError, soloFilters, soloID, soloInfoBroadcast, soloOpinions, soloPause, soloPlay, soloQueue, soloShowTimeout, soloStartup, soloTick, soloUnshuffled, soloVideo, tick, youtubeReady;

player = null;

socket = null;

playing = false;

serverEpoch = null;

soloID = null;

soloFilters = null;

soloDatabase = {};

soloUnshuffled = [];

soloQueue = [];

soloVideo = null;

soloCount = 0;

soloShowTimeout = null;

soloError = false;

soloOpinions = {};

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

showInfo = function(pkt) {
  var artist, feeling, feelings, html, k, l, len, len1, len2, list, m, o, overElement, t, title;
  console.log(pkt);
  overElement = document.getElementById("over");
  overElement.style.display = "none";
  for (k = 0, len = overTimers.length; k < len; k++) {
    t = overTimers[k];
    clearTimeout(t);
  }
  overTimers = [];
  if (showTitles) {
    artist = pkt.artist;
    artist = artist.replace(/^\s+/, "");
    artist = artist.replace(/\s+$/, "");
    title = pkt.title;
    title = title.replace(/^\s+/, "");
    title = title.replace(/\s+$/, "");
    html = `${artist}\n&#x201C;${title}&#x201D;`;
    if (soloID != null) {
      html += "\nSolo Mode";
    } else {
      html += `\n${pkt.company}`;
      feelings = [];
      for (l = 0, len1 = opinionOrder.length; l < len1; l++) {
        o = opinionOrder[l];
        if (pkt.opinions[o] != null) {
          feelings.push(o);
        }
      }
      if (feelings.length === 0) {
        html += "\nNo Opinions";
      } else {
        for (m = 0, len2 = feelings.length; m < len2; m++) {
          feeling = feelings[m];
          list = pkt.opinions[feeling];
          list.sort();
          html += `\n${feeling.charAt(0).toUpperCase() + feeling.slice(1)}: ${list.join(', ')}`;
        }
      }
    }
    overElement.innerHTML = html;
    overTimers.push(setTimeout(function() {
      return fadeIn(overElement, 1000);
    }, 3000));
    return overTimers.push(setTimeout(function() {
      return fadeOut(overElement, 1000);
    }, 15000));
  }
};

play = function(pkt, id, startSeconds = null, endSeconds = null) {
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
  playing = true;
  return showInfo(pkt);
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
  if (soloID != null) {
    return;
  }
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

// ---------------------------------------------------------------------------------------
// Solo Mode Engine
soloFatalError = function(reason) {
  console.log(`soloFatalError: ${reason}`);
  document.body.innerHTML = `ERROR: ${reason}`;
  return soloError = true;
};

getData = function(url) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          return resolve(entries);
        } catch (error) {
          return resolve(null);
        }
      }
    };
    xhttp.open("GET", url, true);
    return xhttp.send();
  });
};

soloTick = function() {
  if ((soloID == null) || soloError) {
    return;
  }
  console.log("soloTick()");
  if (!playing && (player != null)) {
    soloPlay();
  }
};

soloEnding = function() {
  return showInfo(soloVideo);
};

soloInfoBroadcast = function() {
  var info, nextVideo;
  if ((socket != null) && (soloID != null) && (soloVideo != null)) {
    nextVideo = null;
    if (soloQueue.length > 0) {
      nextVideo = soloQueue[0];
    }
    info = {
      current: soloVideo,
      next: nextVideo,
      index: soloCount - soloQueue.length,
      count: soloCount
    };
    console.log("Broadcast: ", info);
    return socket.emit('solo', {
      id: soloID,
      cmd: 'info',
      info: info
    });
  }
};

soloPlay = function(restart = false) {
  var endTime, i, index, j, k, len, soloDuration, startTime;
  if (soloError) {
    return;
  }
  if (!restart || (soloVideo == null)) {
    if (soloQueue.length === 0) {
      console.log("Reshuffling...");
      soloQueue = [soloUnshuffled[0]];
      for (index = k = 0, len = soloUnshuffled.length; k < len; index = ++k) {
        i = soloUnshuffled[index];
        if (index === 0) {
          continue;
        }
        j = Math.floor(Math.random() * (index + 1));
        soloQueue.push(soloQueue[j]);
        soloQueue[j] = i;
      }
    }
    soloVideo = soloQueue.shift();
  }
  console.log(soloVideo);
  // debug
  // soloVideo.start = 10
  // soloVideo.end = 50
  // soloVideo.duration = 40
  play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
  soloInfoBroadcast();
  startTime = soloVideo.start;
  if (startTime < 0) {
    startTime = 0;
  }
  endTime = soloVideo.end;
  if (endTime < 0) {
    endTime = soloVideo.duration;
  }
  soloDuration = endTime - startTime;
  if (soloShowTimeout != null) {
    clearTimeout(soloShowTimeout);
    soloShowTimeout = null;
  }
  if (soloDuration > 30) {
    console.log(`Showing info again in ${soloDuration - 15} seconds`);
    return soloShowTimeout = setTimeout(soloEnding, (soloDuration - 15) * 1000);
  }
};

soloPause = function() {
  if (player != null) {
    if (player.getPlayerState() === 2) {
      return player.playVideo();
    } else {
      return player.pauseVideo();
    }
  }
};

soloCommand = function(pkt) {
  if (pkt.cmd == null) {
    return;
  }
  if (pkt.id !== soloID) {
    return;
  }
  console.log("soloCommand: ", pkt);
  switch (pkt.cmd) {
    case 'skip':
      soloPlay();
      break;
    case 'restart':
      soloPlay(true);
      break;
    case 'pause':
      soloPause();
  }
};

cacheOpinions = async function(filterUser) {
  if (soloOpinions[filterUser] == null) {
    soloOpinions[filterUser] = (await getData(`/info/opinions?user=${encodeURIComponent(filterUser)}`));
    if (soloOpinions[filterUser] == null) {
      return soloFatalError(`Cannot get user opinions for ${filterUser}`);
    }
  }
};

soloStartup = async function() {
  var command, e, filter, filterFunc, filterOpinion, filterString, filterUser, id, idLookup, isMatch, k, l, len, len1, len2, m, matches, negated, pieces, property, rawFilters, ref, substring;
  filterString = qs('filters');
  if ((filterString != null) && (filterString.length > 0)) {
    soloFilters = [];
    rawFilters = filterString.split(/\r?\n/);
    for (k = 0, len = rawFilters.length; k < len; k++) {
      filter = rawFilters[k];
      filter = filter.trim();
      if (filter.length > 0) {
        soloFilters.push(filter);
      }
    }
    if (soloFilters.length === 0) {
      // No filters
      soloFilters = null;
    }
  }
  console.log("Filters:", soloFilters);
  soloDatabase = (await getData("/info/playlist"));
  if (soloDatabase == null) {
    soloFatalError("Cannot get solo database!");
    return;
  }
  soloUnshuffled = [];
  if (soloFilters != null) {
    for (id in soloDatabase) {
      e = soloDatabase[id];
      e.allowed = false;
      e.skipped = false;
    }
    for (l = 0, len1 = soloFilters.length; l < len1; l++) {
      filter = soloFilters[l];
      pieces = filter.split(/\s+/);
      property = "allowed";
      if (pieces[0] === "skip") {
        property = "skipped";
        pieces.shift();
      }
      if (pieces.length === 0) {
        continue;
      }
      substring = pieces.slice(1).join(" ");
      negated = false;
      if (matches = pieces[0].match(/^!(.+)$/)) {
        negated = true;
        pieces[0] = matches[1];
      }
      command = pieces[0];
      switch (command) {
        case 'artist':
        case 'band':
          filterFunc = function(e, s) {
            return e.artist.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'title':
        case 'song':
          filterFunc = function(e, s) {
            return e.title.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'tag':
          filterFunc = function(e, s) {
            return e.tags[s] === true;
          };
          break;
        case 'like':
        case 'meh':
        case 'bleh':
        case 'hate':
          filterOpinion = command;
          filterUser = substring;
          await cacheOpinions(filterUser);
          console.log(soloOpinions);
          filterFunc = function(e, s) {
            var ref, ref1;
            return ((ref = soloOpinions[filterUser]) != null ? (ref1 = ref[filterOpinion]) != null ? ref1[e.id] : void 0 : void 0) != null;
          };
          break;
        case 'full':
          filterFunc = function(e, s) {
            var full;
            full = e.artist.toLowerCase() + " - " + e.title.toLowerCase();
            return full.indexOf(s) !== -1;
          };
          break;
        case 'id':
        case 'ids':
          idLookup = {};
          ref = pieces.slice(1);
          for (m = 0, len2 = ref.length; m < len2; m++) {
            id = ref[m];
            idLookup[id] = true;
          }
          filterFunc = function(e, s) {
            return idLookup[e.id];
          };
          break;
        default:
          // skip this filter
          continue;
      }
      for (id in soloDatabase) {
        e = soloDatabase[id];
        isMatch = filterFunc(e, substring);
        if (negated) {
          isMatch = !isMatch;
        }
        if (isMatch) {
          e[property] = true;
        }
      }
    }
    for (id in soloDatabase) {
      e = soloDatabase[id];
      if (e.allowed && !e.skipped) {
        soloUnshuffled.push(e);
      }
    }
  } else {
// Queue it all up
    for (id in soloDatabase) {
      e = soloDatabase[id];
      soloUnshuffled.push(e);
    }
  }
  if (soloUnshuffled.length === 0) {
    soloFatalError("No matching songs in the filter!");
    return;
  }
  soloCount = soloUnshuffled.length;
  return setInterval(soloTick, 5000);
};

// ---------------------------------------------------------------------------------------
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
  player = new YT.Player('mtv-player', {
    width: '100%',
    height: '100%',
    videoId: 'AB7ykOfAgIA', // MTV loading screen, this will be replaced almost immediately
    playerVars: {
      'autoplay': 1,
      'enablejsapi': 1,
      'controls': showControls
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
  soloID = qs('solo');
  socket = io();
  socket.on('connect', function() {
    if (soloID != null) {
      socket.emit('solo', {
        id: soloID
      });
      return soloInfoBroadcast();
    }
  });
  if (soloID != null) {
    // Solo mode!
    soloStartup();
    return socket.on('solo', function(pkt) {
      if (pkt.cmd != null) {
        return soloCommand(pkt);
      }
    });
  } else {
    // Normal MTV mode
    socket.on('play', function(pkt) {
      // console.log pkt
      return play(pkt, pkt.id, pkt.start, pkt.end);
    });
    socket.on('ending', function(pkt) {
      // console.log pkt
      return showInfo(pkt);
    });
    socket.on('server', function(server) {
      if ((serverEpoch != null) && (serverEpoch !== server.epoch)) {
        console.log("Server epoch changed! The server must have rebooted. Requesting fresh video...");
        sendReady();
      }
      return serverEpoch = server.epoch;
    });
    return setInterval(tick, 5000);
  }
};

setTimeout(function() {
  // somehow we missed this event, just kick it manually
  if (!youtubeReady) {
    console.log("kicking Youtube...");
    return window.onYouTubePlayerAPIReady();
  }
}, 3000);


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLG1CQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGlCQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUNWLFdBQUEsR0FBYzs7QUFFZCxNQUFBLEdBQVM7O0FBQ1QsV0FBQSxHQUFjOztBQUNkLFlBQUEsR0FBZSxDQUFBOztBQUNmLGNBQUEsR0FBaUI7O0FBQ2pCLFNBQUEsR0FBWTs7QUFDWixTQUFBLEdBQVk7O0FBQ1osU0FBQSxHQUFZOztBQUNaLGVBQUEsR0FBa0I7O0FBQ2xCLFNBQUEsR0FBWTs7QUFDWixZQUFBLEdBQWUsQ0FBQTs7QUFFZixVQUFBLEdBQWE7O0FBQ2IsVUFBQSxHQUFhOztBQUViLFlBQUEsR0FBZTtFQUFDLE1BQUQ7RUFBUyxLQUFUO0VBQWdCLE1BQWhCO0VBQXdCLE1BQXhCOzs7QUFFZixFQUFBLEdBQUssUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUNMLE1BQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtF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QTtXQUVBLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsR0FBRCxDQUFBO01BQ2hCLElBQUcsZUFBSDtlQUNFLFdBQUEsQ0FBWSxHQUFaLEVBREY7O0lBRGdCLENBQWxCLEVBTEY7R0FBQSxNQUFBOztJQVdFLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsR0FBRCxDQUFBLEVBQUE7O2FBRWhCLElBQUEsQ0FBSyxHQUFMLEVBQVUsR0FBRyxDQUFDLEVBQWQsRUFBa0IsR0FBRyxDQUFDLEtBQXRCLEVBQTZCLEdBQUcsQ0FBQyxHQUFqQztJQUZnQixDQUFsQjtJQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsUUFBVixFQUFvQixRQUFBLENBQUMsR0FBRCxDQUFBLEVBQUE7O2FBRWxCLFFBQUEsQ0FBUyxHQUFUO0lBRmtCLENBQXBCO0lBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLFFBQUEsQ0FBQyxNQUFELENBQUE7TUFDbEIsSUFBRyxxQkFBQSxJQUFpQixDQUFDLFdBQUEsS0FBZSxNQUFNLENBQUMsS0FBdkIsQ0FBcEI7UUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGdGQUFaO1FBQ0EsU0FBQSxDQUFBLEVBRkY7O2FBR0EsV0FBQSxHQUFjLE1BQU0sQ0FBQztJQUpILENBQXBCO1dBTUEsV0FBQSxDQUFZLElBQVosRUFBa0IsSUFBbEIsRUF6QkY7O0FBL0IrQjs7QUEwRGpDLFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQSxFQUFBOztFQUVULElBQUcsQ0FBSSxZQUFQO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWjtXQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLEVBRkY7O0FBRlMsQ0FBWCxFQUtFLElBTEYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuc29sb0lEID0gbnVsbFxyXG5zb2xvRmlsdGVycyA9IG51bGxcclxuc29sb0RhdGFiYXNlID0ge31cclxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG5zb2xvUXVldWUgPSBbXVxyXG5zb2xvVmlkZW8gPSBudWxsXHJcbnNvbG9Db3VudCA9IDBcclxuc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxyXG5zb2xvRXJyb3IgPSBmYWxzZVxyXG5zb2xvT3BpbmlvbnMgPSB7fVxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxub3ZlclRpbWVycyA9IFtdXHJcblxyXG5vcGluaW9uT3JkZXIgPSBbJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5zaG93VGl0bGVzID0gdHJ1ZVxyXG5pZiBxcygnaGlkZXRpdGxlcycpXHJcbiAgc2hvd1RpdGxlcyA9IGZhbHNlXHJcblxyXG5mYWRlSW4gPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiXHJcbiAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAwXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgKz0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5ID49IDFcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcblxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MSlcIlxyXG5cclxuZmFkZU91dCA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDFcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSAtPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDBcclxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblxyXG4jIGF1dG9wbGF5IHZpZGVvXHJcbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XHJcbiAgZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpXHJcblxyXG4jIHdoZW4gdmlkZW8gZW5kc1xyXG5vblBsYXllclN0YXRlQ2hhbmdlID0gKGV2ZW50KSAtPlxyXG4gIGlmIGVuZGVkVGltZXI/XHJcbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcclxuICAgIGVuZGVkVGltZXIgPSBudWxsXHJcblxyXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxyXG4gIGlmIHZpZGVvRGF0YT8gYW5kIHZpZGVvRGF0YS50aXRsZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVGl0bGU6ICN7dmlkZW9EYXRhLnRpdGxlfVwiXHJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxyXG5cclxuICBpZiBldmVudC5kYXRhID09IDBcclxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxyXG4gICAgZW5kZWRUaW1lciA9IHNldFRpbWVvdXQoIC0+XHJcbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxyXG4gICAgLCAyMDAwKVxyXG5cclxuc2hvd0luZm8gPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIHBrdFxyXG5cclxuICBvdmVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3ZlclwiKVxyXG4gIG92ZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gIGZvciB0IGluIG92ZXJUaW1lcnNcclxuICAgIGNsZWFyVGltZW91dCh0KVxyXG4gIG92ZXJUaW1lcnMgPSBbXVxyXG5cclxuICBpZiBzaG93VGl0bGVzXHJcbiAgICBhcnRpc3QgPSBwa3QuYXJ0aXN0XHJcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gICAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICAgIHRpdGxlID0gcGt0LnRpdGxlXHJcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gICAgaHRtbCA9IFwiI3thcnRpc3R9XFxuJiN4MjAxQzsje3RpdGxlfSYjeDIwMUQ7XCJcclxuICAgIGlmIHNvbG9JRD9cclxuICAgICAgaHRtbCArPSBcIlxcblNvbG8gTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICAgIGZlZWxpbmdzID0gW11cclxuICAgICAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgICAgZmVlbGluZ3MucHVzaCBvXHJcbiAgICAgIGlmIGZlZWxpbmdzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciBmZWVsaW5nIGluIGZlZWxpbmdzXHJcbiAgICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgICBsaXN0LnNvcnQoKVxyXG4gICAgICAgICAgaHRtbCArPSBcIlxcbiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OiAje2xpc3Quam9pbignLCAnKX1cIlxyXG4gICAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMzAwMFxyXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcclxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXHJcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXHJcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXHJcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxuICBzaG93SW5mbyhwa3QpXHJcblxyXG5zZW5kUmVhZHkgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbnRpY2sgPSAtPlxyXG4gIGlmIHNvbG9JRD9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc2VuZFJlYWR5KClcclxuICAgIHJldHVyblxyXG5cclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNmdyA9IGZhbHNlXHJcbiAgaWYgcXMoJ3NmdycpXHJcbiAgICBzZncgPSB0cnVlXHJcbiAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgU29sbyBNb2RlIEVuZ2luZVxyXG5cclxuc29sb0ZhdGFsRXJyb3IgPSAocmVhc29uKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwic29sb0ZhdGFsRXJyb3I6ICN7cmVhc29ufVwiXHJcbiAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIkVSUk9SOiAje3JlYXNvbn1cIlxyXG4gIHNvbG9FcnJvciA9IHRydWVcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbnNvbG9UaWNrID0gLT5cclxuICBpZiBub3Qgc29sb0lEPyBvciBzb2xvRXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzb2xvUGxheSgpXHJcbiAgICByZXR1cm5cclxuXHJcbnNvbG9FbmRpbmcgPSAtPlxyXG4gIHNob3dJbmZvKHNvbG9WaWRlbylcclxuXHJcbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cclxuICBpZiBzb2NrZXQ/IGFuZCBzb2xvSUQ/IGFuZCBzb2xvVmlkZW8/XHJcbiAgICBuZXh0VmlkZW8gPSBudWxsXHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID4gMFxyXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbMF1cclxuICAgIGluZm8gPVxyXG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cclxuICAgICAgbmV4dDogbmV4dFZpZGVvXHJcbiAgICAgIGluZGV4OiBzb2xvQ291bnQgLSBzb2xvUXVldWUubGVuZ3RoXHJcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cclxuICAgIHNvY2tldC5lbWl0ICdzb2xvJyx7XHJcbiAgICAgIGlkOiBzb2xvSURcclxuICAgICAgY21kOiAnaW5mbydcclxuICAgICAgaW5mbzogaW5mb1xyXG4gICAgfVxyXG5cclxuc29sb1BsYXkgPSAocmVzdGFydCA9IGZhbHNlKSAtPlxyXG4gIGlmIHNvbG9FcnJvclxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCByZXN0YXJ0IG9yIG5vdCBzb2xvVmlkZW8/XHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID09IDBcclxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXHJcbiAgICAgIHNvbG9RdWV1ZSA9IFsgc29sb1Vuc2h1ZmZsZWRbMF0gXVxyXG4gICAgICBmb3IgaSwgaW5kZXggaW4gc29sb1Vuc2h1ZmZsZWRcclxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXHJcbiAgICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpbmRleCArIDEpKVxyXG4gICAgICAgIHNvbG9RdWV1ZS5wdXNoKHNvbG9RdWV1ZVtqXSlcclxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXHJcblxyXG4gICAgc29sb1ZpZGVvID0gc29sb1F1ZXVlLnNoaWZ0KClcclxuXHJcbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXHJcblxyXG4gICMgZGVidWdcclxuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXHJcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcclxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXHJcblxyXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuXHJcbiAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBzdGFydFRpbWUgPSBzb2xvVmlkZW8uc3RhcnRcclxuICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICBzdGFydFRpbWUgPSAwXHJcbiAgZW5kVGltZSA9IHNvbG9WaWRlby5lbmRcclxuICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgZW5kVGltZSA9IHNvbG9WaWRlby5kdXJhdGlvblxyXG4gIHNvbG9EdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICBpZiBzb2xvU2hvd1RpbWVvdXQ/XHJcbiAgICBjbGVhclRpbWVvdXQoc29sb1Nob3dUaW1lb3V0KVxyXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxyXG4gIGlmIHNvbG9EdXJhdGlvbiA+IDMwXHJcbiAgICBjb25zb2xlLmxvZyBcIlNob3dpbmcgaW5mbyBhZ2FpbiBpbiAje3NvbG9EdXJhdGlvbiAtIDE1fSBzZWNvbmRzXCJcclxuICAgIHNvbG9TaG93VGltZW91dCA9IHNldFRpbWVvdXQoc29sb0VuZGluZywgKHNvbG9EdXJhdGlvbiAtIDE1KSAqIDEwMDApXHJcblxyXG5cclxuc29sb1BhdXNlID0gLT5cclxuICBpZiBwbGF5ZXI/XHJcbiAgICBpZiBwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PSAyXHJcbiAgICAgIHBsYXllci5wbGF5VmlkZW8oKVxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXIucGF1c2VWaWRlbygpXHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgbm90IHBrdC5jbWQ/XHJcbiAgICByZXR1cm5cclxuICBpZiBwa3QuaWQgIT0gc29sb0lEXHJcbiAgICByZXR1cm5cclxuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxyXG5cclxuICBzd2l0Y2ggcGt0LmNtZFxyXG4gICAgd2hlbiAnc2tpcCdcclxuICAgICAgc29sb1BsYXkoKVxyXG4gICAgd2hlbiAncmVzdGFydCdcclxuICAgICAgc29sb1BsYXkodHJ1ZSlcclxuICAgIHdoZW4gJ3BhdXNlJ1xyXG4gICAgICBzb2xvUGF1c2UoKVxyXG5cclxuICByZXR1cm5cclxuXHJcbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cclxuICBpZiBub3Qgc29sb09waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgc29sb09waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXHJcbiAgICBpZiBub3Qgc29sb09waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxyXG5cclxuc29sb1N0YXJ0dXAgPSAtPlxyXG4gIGZpbHRlclN0cmluZyA9IHFzKCdmaWx0ZXJzJylcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgc29sb0RhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXHJcbiAgaWYgbm90IHNvbG9EYXRhYmFzZT9cclxuICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvbG9VbnNodWZmbGVkID0gW11cclxuICBpZiBzb2xvRmlsdGVycz9cclxuICAgIGZvciBpZCwgZSBvZiBzb2xvRGF0YWJhc2VcclxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcclxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcclxuXHJcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXHJcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvXFxzKy8pXHJcblxyXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcclxuICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXHJcblxyXG4gICAgICBuZWdhdGVkID0gZmFsc2VcclxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXHJcbiAgICAgICAgbmVnYXRlZCA9IHRydWVcclxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXHJcblxyXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAndGFnJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBzb2xvT3BpbmlvbnNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gc29sb09waW5pb25zW2ZpbHRlclVzZXJdP1tmaWx0ZXJPcGluaW9uXT9bZS5pZF0/XHJcbiAgICAgICAgd2hlbiAnZnVsbCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT5cclxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2lkJywgJ2lkcydcclxuICAgICAgICAgIGlkTG9va3VwID0ge31cclxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGZvciBpZCwgZSBvZiBzb2xvRGF0YWJhc2VcclxuICAgICAgICBpc01hdGNoID0gZmlsdGVyRnVuYyhlLCBzdWJzdHJpbmcpXHJcbiAgICAgICAgaWYgbmVnYXRlZFxyXG4gICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgaWYgaXNNYXRjaFxyXG4gICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXHJcblxyXG4gICAgZm9yIGlkLCBlIG9mIHNvbG9EYXRhYmFzZVxyXG4gICAgICBpZiBlLmFsbG93ZWQgYW5kIG5vdCBlLnNraXBwZWRcclxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuICBlbHNlXHJcbiAgICAjIFF1ZXVlIGl0IGFsbCB1cFxyXG4gICAgZm9yIGlkLCBlIG9mIHNvbG9EYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgaWYgc29sb1Vuc2h1ZmZsZWQubGVuZ3RoID09IDBcclxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcclxuICAgIHJldHVyblxyXG4gIHNvbG9Db3VudCA9IHNvbG9VbnNodWZmbGVkLmxlbmd0aFxyXG5cclxuICBzZXRJbnRlcnZhbChzb2xvVGljaywgNTAwMClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGlmIHlvdXR1YmVSZWFkeVxyXG4gICAgcmV0dXJuXHJcbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuXHJcbiAgc2hvd0NvbnRyb2xzID0gMFxyXG4gIGlmIHFzKCdjb250cm9scycpXHJcbiAgICBzaG93Q29udHJvbHMgPSAxXHJcblxyXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnZW5hYmxlanNhcGknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8gbW9kZSFcclxuXHJcbiAgICBzb2xvU3RhcnR1cCgpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgICAgaWYgcGt0LmNtZD9cclxuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXHJcbiAgZWxzZVxyXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcclxuXHJcbiAgICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBzaG93SW5mbyhwa3QpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxyXG4gICAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxyXG4gICAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcclxuXHJcbnNldFRpbWVvdXQgLT5cclxuICAjIHNvbWVob3cgd2UgbWlzc2VkIHRoaXMgZXZlbnQsIGp1c3Qga2ljayBpdCBtYW51YWxseVxyXG4gIGlmIG5vdCB5b3V0dWJlUmVhZHlcclxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcclxuICAgIHdpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpXHJcbiwgMzAwMFxyXG4iXX0=
