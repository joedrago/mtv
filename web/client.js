(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @description A module for parsing ISO8601 durations
 */

/**
 * The pattern used for parsing ISO8601 duration (PnYnMnDTnHnMnS).
 * This does not cover the week format PnW.
 */

// PnYnMnDTnHnMnS
var numbers = '\\d+(?:[\\.,]\\d+)?';
var weekPattern = '(' + numbers + 'W)';
var datePattern = '(' + numbers + 'Y)?(' + numbers + 'M)?(' + numbers + 'D)?';
var timePattern = 'T(' + numbers + 'H)?(' + numbers + 'M)?(' + numbers + 'S)?';

var iso8601 = 'P(?:' + weekPattern + '|' + datePattern + '(?:' + timePattern + ')?)';
var objMap = ['weeks', 'years', 'months', 'days', 'hours', 'minutes', 'seconds'];

/**
 * The ISO8601 regex for matching / testing durations
 */
var pattern = exports.pattern = new RegExp(iso8601);

/** Parse PnYnMnDTnHnMnS format to object
 * @param {string} durationString - PnYnMnDTnHnMnS formatted string
 * @return {Object} - With a property for each part of the pattern
 */
var parse = exports.parse = function parse(durationString) {
  // Slice away first entry in match-array
  return durationString.match(pattern).slice(1).reduce(function (prev, next, idx) {
    prev[objMap[idx]] = parseFloat(next) || 0;
    return prev;
  }, {});
};

/**
 * Convert ISO8601 duration object to an end Date.
 *
 * @param {Object} duration - The duration object
 * @param {Date} startDate - The starting Date for calculating the duration
 * @return {Date} - The resulting end Date
 */
var end = exports.end = function end(duration, startDate) {
  // Create two equal timestamps, add duration to 'then' and return time difference
  var timestamp = startDate ? startDate.getTime() : Date.now();
  var then = new Date(timestamp);

  then.setFullYear(then.getFullYear() + duration.years);
  then.setMonth(then.getMonth() + duration.months);
  then.setDate(then.getDate() + duration.days);
  then.setHours(then.getHours() + duration.hours);
  then.setMinutes(then.getMinutes() + duration.minutes);
  // Then.setSeconds(then.getSeconds() + duration.seconds);
  then.setMilliseconds(then.getMilliseconds() + duration.seconds * 1000);
  // Special case weeks
  then.setDate(then.getDate() + duration.weeks * 7);

  return then;
};

/**
 * Convert ISO8601 duration object to seconds
 *
 * @param {Object} duration - The duration object
 * @param {Date} startDate - The starting point for calculating the duration
 * @return {Number}
 */
var toSeconds = exports.toSeconds = function toSeconds(duration, startDate) {
  var timestamp = startDate ? startDate.getTime() : Date.now();
  var now = new Date(timestamp);
  var then = end(duration, now);

  var seconds = (then.getTime() - now.getTime()) / 1000;
  return seconds;
};

exports.default = {
  end: end,
  toSeconds: toSeconds,
  pattern: pattern,
  parse: parse
};
},{}],2:[function(require,module,exports){
var endedTimer, fadeIn, fadeOut, filters, finishInit, getData, iso8601, now, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, parseDuration, play, player, playing, qs, sendReady, serverEpoch, showInfo, showTitles, socket, soloCommand, soloCount, soloEnding, soloError, soloFatalError, soloID, soloInfoBroadcast, soloLabels, soloMirror, soloPause, soloPlay, soloQueue, soloShowTimeout, soloStartup, soloTick, soloUnshuffled, soloVideo, tick, youtubeReady;

player = null;

socket = null;

playing = false;

serverEpoch = null;

filters = require('./filters');

iso8601 = require('iso8601-duration');

soloID = null;

soloLabels = {};

soloUnshuffled = [];

soloQueue = [];

soloVideo = null;

soloCount = 0;

soloShowTimeout = null;

soloError = false;

soloMirror = false;

endedTimer = null;

overTimers = [];

opinionOrder = [
  'love',
  'like',
  'meh',
  'bleh',
  'hate' // always in this specific order
];

parseDuration = function(s) {
  return iso8601.toSeconds(iso8601.parse(s));
};

now = function() {
  return Math.floor(Date.now() / 1000);
};

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
  event.target.playVideo();
  return finishInit();
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
  var artist, company, feeling, feelings, html, k, l, len, len1, len2, list, m, o, overElement, t, title;
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
      company = soloLabels[pkt.nickname];
      if (company == null) {
        company = pkt.nickname.charAt(0).toUpperCase() + pkt.nickname.slice(1);
        company += " Records";
      }
      html += `\n${company}`;
      if (soloMirror) {
        html += "\nMirror Mode";
      } else {
        html += "\nSolo Mode";
      }
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
  if ((soloID == null) || soloError || soloMirror) {
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
  if ((socket != null) && (soloID != null) && (soloVideo != null) && !soloMirror) {
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
  if (soloError || soloMirror) {
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
  // console.log "soloCommand: ", pkt
  switch (pkt.cmd) {
    case 'skip':
      soloPlay();
      break;
    case 'restart':
      soloPlay(true);
      break;
    case 'pause':
      soloPause();
      break;
    case 'info':
      if (soloMirror) {
        soloVideo = pkt.info.current;
        if (soloVideo != null) {
          if (player == null) {
            console.log("no player yet");
          }
          play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
        }
      }
  }
};

soloStartup = async function() {
  var filterString;
  soloLabels = (await getData("/info/labels"));
  if (qs('mirror')) {
    soloMirror = true;
    return;
  }
  filterString = qs('filters');
  soloUnshuffled = (await filters.generateList(filterString));
  if (soloUnshuffled == null) {
    soloFatalError("Cannot get solo database!");
    return;
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
  return player = new YT.Player('mtv-player', {
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
};

// called by onPlayerReady
finishInit = function() {
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


},{"./filters":3,"iso8601-duration":1}],3:[function(require,module,exports){
var cacheOpinions, filterDatabase, filterOpinions, generateList, getData;

filterDatabase = null;

filterOpinions = {};

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

cacheOpinions = async function(filterUser) {
  if (filterOpinions[filterUser] == null) {
    filterOpinions[filterUser] = (await getData(`/info/opinions?user=${encodeURIComponent(filterUser)}`));
    if (filterOpinions[filterUser] == null) {
      return soloFatalError(`Cannot get user opinions for ${filterUser}`);
    }
  }
};

generateList = async function(filterString, sortByArtist = false) {
  var allAllowed, command, durationInSeconds, e, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, len, len1, len2, matches, negated, pieces, property, rawFilters, ref, since, soloFilters, soloUnshuffled, someException, substring;
  soloFilters = null;
  if ((filterString != null) && (filterString.length > 0)) {
    soloFilters = [];
    rawFilters = filterString.split(/\r?\n/);
    for (i = 0, len = rawFilters.length; i < len; i++) {
      filter = rawFilters[i];
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
  if (filterDatabase != null) {
    console.log("Using cached database.");
  } else {
    console.log("Downloading database...");
    filterDatabase = (await getData("/info/playlist"));
    if (filterDatabase == null) {
      return null;
    }
  }
  soloUnshuffled = [];
  if (soloFilters != null) {
    for (id in filterDatabase) {
      e = filterDatabase[id];
      e.allowed = false;
      e.skipped = false;
    }
    allAllowed = true;
    for (j = 0, len1 = soloFilters.length; j < len1; j++) {
      filter = soloFilters[j];
      pieces = filter.split(/\s+/);
      property = "allowed";
      if (pieces[0] === "skip") {
        property = "skipped";
        pieces.shift();
      }
      if (pieces.length === 0) {
        continue;
      }
      if (property === "allowed") {
        allAllowed = false;
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
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.artist.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'title':
        case 'song':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.title.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'added':
          filterFunc = function(e, s) {
            return e.nickname === s;
          };
          break;
        case 'untagged':
          filterFunc = function(e, s) {
            return Object.keys(e.tags).length === 0;
          };
          break;
        case 'tag':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.tags[s] === true;
          };
          break;
        case 'recent':
        case 'since':
          console.log(`parsing '${substring}'`);
          try {
            durationInSeconds = parseDuration(substring);
          } catch (error) {
            someException = error;
            soloFatalError(`Cannot parse duration: ${substring}`);
            return;
          }
          console.log(`Duration [${substring}] - ${durationInSeconds}`);
          since = now() - durationInSeconds;
          filterFunc = function(e, s) {
            return e.added > since;
          };
          break;
        case 'love':
        case 'like':
        case 'bleh':
        case 'hate':
          filterOpinion = command;
          filterUser = substring;
          await cacheOpinions(filterUser);
          // console.log filterOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
          };
          break;
        case 'none':
          filterOpinion = void 0;
          filterUser = substring;
          await cacheOpinions(filterUser);
          // console.log filterOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
          };
          break;
        case 'full':
          substring = substring.toLowerCase();
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
          for (k = 0, len2 = ref.length; k < len2; k++) {
            id = ref[k];
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
      for (id in filterDatabase) {
        e = filterDatabase[id];
        isMatch = filterFunc(e, substring);
        if (negated) {
          isMatch = !isMatch;
        }
        if (isMatch) {
          e[property] = true;
        }
      }
    }
    for (id in filterDatabase) {
      e = filterDatabase[id];
      if ((e.allowed || allAllowed) && !e.skipped) {
        soloUnshuffled.push(e);
      }
    }
  } else {
// Queue it all up
    for (id in filterDatabase) {
      e = filterDatabase[id];
      soloUnshuffled.push(e);
    }
  }
  if (sortByArtist) {
    soloUnshuffled.sort(function(a, b) {
      if (a.artist.toLowerCase() < b.artist.toLowerCase()) {
        return -1;
      }
      if (a.artist.toLowerCase() > b.artist.toLowerCase()) {
        return 1;
      }
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      }
      if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }
  return soloUnshuffled;
};

module.exports = {
  generateList: generateList
};


},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBLG1CQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFB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QUEsQ0FBQSxHQUF5QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUE1QjtBQUNFLGVBQU8sRUFEVDs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLEVBRFQ7O0FBRUEsYUFBTztJQVRXLENBQXBCLEVBREY7O0FBV0EsU0FBTztBQTdITTs7QUErSGYsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLFlBQUEsRUFBYztBQUFkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuZmlsdGVycyA9IHJlcXVpcmUgJy4vZmlsdGVycydcclxuXHJcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xyXG5cclxuc29sb0lEID0gbnVsbFxyXG5zb2xvTGFiZWxzID0ge31cclxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG5zb2xvUXVldWUgPSBbXVxyXG5zb2xvVmlkZW8gPSBudWxsXHJcbnNvbG9Db3VudCA9IDBcclxuc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxyXG5zb2xvRXJyb3IgPSBmYWxzZVxyXG5zb2xvTWlycm9yID0gZmFsc2VcclxuXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbm92ZXJUaW1lcnMgPSBbXVxyXG5cclxub3Bpbmlvbk9yZGVyID0gWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuXHJcbnBhcnNlRHVyYXRpb24gPSAocykgLT5cclxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxuc2hvd1RpdGxlcyA9IHRydWVcclxuaWYgcXMoJ2hpZGV0aXRsZXMnKVxyXG4gIHNob3dUaXRsZXMgPSBmYWxzZVxyXG5cclxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxyXG4gIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMFxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA+PSAxXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMVxyXG5cclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTEpXCJcclxuXHJcbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAxXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgLT0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5IDw9IDBcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAwXHJcbiAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cclxuIyBhdXRvcGxheSB2aWRlb1xyXG5vblBsYXllclJlYWR5ID0gKGV2ZW50KSAtPlxyXG4gIGV2ZW50LnRhcmdldC5wbGF5VmlkZW8oKVxyXG4gIGZpbmlzaEluaXQoKVxyXG5cclxuIyB3aGVuIHZpZGVvIGVuZHNcclxub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgLT5cclxuICBpZiBlbmRlZFRpbWVyP1xyXG4gICAgY2xlYXJUaW1lb3V0KGVuZGVkVGltZXIpXHJcbiAgICBlbmRlZFRpbWVyID0gbnVsbFxyXG5cclxuICB2aWRlb0RhdGEgPSBwbGF5ZXIuZ2V0VmlkZW9EYXRhKClcclxuICBpZiB2aWRlb0RhdGE/IGFuZCB2aWRlb0RhdGEudGl0bGU/XHJcbiAgICBjb25zb2xlLmxvZyBcIlRpdGxlOiAje3ZpZGVvRGF0YS50aXRsZX1cIlxyXG4gICAgd2luZG93LmRvY3VtZW50LnRpdGxlID0gXCIje3ZpZGVvRGF0YS50aXRsZX0gLSBbW01UVl1dXCJcclxuXHJcbiAgaWYgZXZlbnQuZGF0YSA9PSAwXHJcbiAgICBjb25zb2xlLmxvZyBcIkVOREVEXCJcclxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxyXG4gICAgICBwbGF5aW5nID0gZmFsc2VcclxuICAgICwgMjAwMClcclxuXHJcbnNob3dJbmZvID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBwa3RcclxuXHJcbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcclxuICBvdmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBmb3IgdCBpbiBvdmVyVGltZXJzXHJcbiAgICBjbGVhclRpbWVvdXQodClcclxuICBvdmVyVGltZXJzID0gW11cclxuXHJcbiAgaWYgc2hvd1RpdGxlc1xyXG4gICAgYXJ0aXN0ID0gcGt0LmFydGlzdFxyXG4gICAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL15cXHMrLywgXCJcIilcclxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgICB0aXRsZSA9IHBrdC50aXRsZVxyXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICAgIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIGNvbXBhbnkgPSBzb2xvTGFiZWxzW3BrdC5uaWNrbmFtZV1cclxuICAgICAgaWYgbm90IGNvbXBhbnk/XHJcbiAgICAgICAgY29tcGFueSA9IHBrdC5uaWNrbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBrdC5uaWNrbmFtZS5zbGljZSgxKVxyXG4gICAgICAgIGNvbXBhbnkgKz0gXCIgUmVjb3Jkc1wiXHJcbiAgICAgIGh0bWwgKz0gXCJcXG4je2NvbXBhbnl9XCJcclxuICAgICAgaWYgc29sb01pcnJvclxyXG4gICAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBodG1sICs9IFwiXFxuU29sbyBNb2RlXCJcclxuICAgIGVsc2VcclxuICAgICAgaHRtbCArPSBcIlxcbiN7cGt0LmNvbXBhbnl9XCJcclxuICAgICAgZmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiBwa3Qub3BpbmlvbnNbb10/XHJcbiAgICAgICAgICBmZWVsaW5ncy5wdXNoIG9cclxuICAgICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcclxuICAgICAgICBodG1sICs9IFwiXFxuTm8gT3BpbmlvbnNcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcclxuICAgICAgICAgIGxpc3QgPSBwa3Qub3BpbmlvbnNbZmVlbGluZ11cclxuICAgICAgICAgIGxpc3Quc29ydCgpXHJcbiAgICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXHJcbiAgICBvdmVyRWxlbWVudC5pbm5lckhUTUwgPSBodG1sXHJcblxyXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICAgLCAzMDAwXHJcbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICAgLCAxNTAwMFxyXG5cclxucGxheSA9IChwa3QsIGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cclxuICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6ICN7aWR9XCJcclxuICBvcHRzID0ge1xyXG4gICAgdmlkZW9JZDogaWRcclxuICB9XHJcbiAgaWYgc3RhcnRTZWNvbmRzPyBhbmQgKHN0YXJ0U2Vjb25kcyA+PSAwKVxyXG4gICAgb3B0cy5zdGFydFNlY29uZHMgPSBzdGFydFNlY29uZHNcclxuICBpZiBlbmRTZWNvbmRzPyBhbmQgKGVuZFNlY29uZHMgPj0gMSlcclxuICAgIG9wdHMuZW5kU2Vjb25kcyA9IGVuZFNlY29uZHNcclxuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChvcHRzKVxyXG4gIHBsYXlpbmcgPSB0cnVlXHJcblxyXG4gIHNob3dJbmZvKHBrdClcclxuXHJcbnNlbmRSZWFkeSA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXHJcbiAgdXNlciA9IHFzKCd1c2VyJylcclxuICBzZncgPSBmYWxzZVxyXG4gIGlmIHFzKCdzZncnKVxyXG4gICAgc2Z3ID0gdHJ1ZVxyXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxyXG5cclxudGljayA9IC0+XHJcbiAgaWYgc29sb0lEP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzZW5kUmVhZHkoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncGxheWluZycsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBTb2xvIE1vZGUgRW5naW5lXHJcblxyXG5zb2xvRmF0YWxFcnJvciA9IChyZWFzb24pIC0+XHJcbiAgY29uc29sZS5sb2cgXCJzb2xvRmF0YWxFcnJvcjogI3tyZWFzb259XCJcclxuICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6ICN7cmVhc29ufVwiXHJcbiAgc29sb0Vycm9yID0gdHJ1ZVxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuc29sb1RpY2sgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSUQ/IG9yIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXHJcbiAgICByZXR1cm5cclxuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc29sb1BsYXkoKVxyXG4gICAgcmV0dXJuXHJcblxyXG5zb2xvRW5kaW5nID0gLT5cclxuICBzaG93SW5mbyhzb2xvVmlkZW8pXHJcblxyXG5zb2xvSW5mb0Jyb2FkY2FzdCA9IC0+XHJcbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvPyBhbmQgbm90IHNvbG9NaXJyb3JcclxuICAgIG5leHRWaWRlbyA9IG51bGxcclxuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPiAwXHJcbiAgICAgIG5leHRWaWRlbyA9IHNvbG9RdWV1ZVswXVxyXG4gICAgaW5mbyA9XHJcbiAgICAgIGN1cnJlbnQ6IHNvbG9WaWRlb1xyXG4gICAgICBuZXh0OiBuZXh0VmlkZW9cclxuICAgICAgaW5kZXg6IHNvbG9Db3VudCAtIHNvbG9RdWV1ZS5sZW5ndGhcclxuICAgICAgY291bnQ6IHNvbG9Db3VudFxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwiQnJvYWRjYXN0OiBcIiwgaW5mb1xyXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLHtcclxuICAgICAgaWQ6IHNvbG9JRFxyXG4gICAgICBjbWQ6ICdpbmZvJ1xyXG4gICAgICBpbmZvOiBpbmZvXHJcbiAgICB9XHJcblxyXG5zb2xvUGxheSA9IChyZXN0YXJ0ID0gZmFsc2UpIC0+XHJcbiAgaWYgc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3QgcmVzdGFydCBvciBub3Qgc29sb1ZpZGVvP1xyXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiUmVzaHVmZmxpbmcuLi5cIlxyXG4gICAgICBzb2xvUXVldWUgPSBbIHNvbG9VbnNodWZmbGVkWzBdIF1cclxuICAgICAgZm9yIGksIGluZGV4IGluIHNvbG9VbnNodWZmbGVkXHJcbiAgICAgICAgY29udGludWUgaWYgaW5kZXggPT0gMFxyXG4gICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaW5kZXggKyAxKSlcclxuICAgICAgICBzb2xvUXVldWUucHVzaChzb2xvUXVldWVbal0pXHJcbiAgICAgICAgc29sb1F1ZXVlW2pdID0gaVxyXG5cclxuICAgIHNvbG9WaWRlbyA9IHNvbG9RdWV1ZS5zaGlmdCgpXHJcblxyXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xyXG5cclxuICAjIGRlYnVnXHJcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxyXG4gICMgc29sb1ZpZGVvLmVuZCA9IDUwXHJcbiAgIyBzb2xvVmlkZW8uZHVyYXRpb24gPSA0MFxyXG5cclxuICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcclxuXHJcbiAgc3RhcnRUaW1lID0gc29sb1ZpZGVvLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBzb2xvVmlkZW8uZW5kXHJcbiAgaWYgZW5kVGltZSA8IDBcclxuICAgIGVuZFRpbWUgPSBzb2xvVmlkZW8uZHVyYXRpb25cclxuICBzb2xvRHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXHJcbiAgaWYgc29sb1Nob3dUaW1lb3V0P1xyXG4gICAgY2xlYXJUaW1lb3V0KHNvbG9TaG93VGltZW91dClcclxuICAgIHNvbG9TaG93VGltZW91dCA9IG51bGxcclxuICBpZiBzb2xvRHVyYXRpb24gPiAzMFxyXG4gICAgY29uc29sZS5sb2cgXCJTaG93aW5nIGluZm8gYWdhaW4gaW4gI3tzb2xvRHVyYXRpb24gLSAxNX0gc2Vjb25kc1wiXHJcbiAgICBzb2xvU2hvd1RpbWVvdXQgPSBzZXRUaW1lb3V0KHNvbG9FbmRpbmcsIChzb2xvRHVyYXRpb24gLSAxNSkgKiAxMDAwKVxyXG5cclxuc29sb1BhdXNlID0gLT5cclxuICBpZiBwbGF5ZXI/XHJcbiAgICBpZiBwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PSAyXHJcbiAgICAgIHBsYXllci5wbGF5VmlkZW8oKVxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXIucGF1c2VWaWRlbygpXHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgbm90IHBrdC5jbWQ/XHJcbiAgICByZXR1cm5cclxuICBpZiBwa3QuaWQgIT0gc29sb0lEXHJcbiAgICByZXR1cm5cclxuXHJcbiAgIyBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XHJcblxyXG4gIHN3aXRjaCBwa3QuY21kXHJcbiAgICB3aGVuICdza2lwJ1xyXG4gICAgICBzb2xvUGxheSgpXHJcbiAgICB3aGVuICdyZXN0YXJ0J1xyXG4gICAgICBzb2xvUGxheSh0cnVlKVxyXG4gICAgd2hlbiAncGF1c2UnXHJcbiAgICAgIHNvbG9QYXVzZSgpXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxyXG4gICAgICAgIGlmIHNvbG9WaWRlbz9cclxuICAgICAgICAgIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXHJcbiAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG4gIHJldHVyblxyXG5cclxuc29sb1N0YXJ0dXAgPSAtPlxyXG4gIHNvbG9MYWJlbHMgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vbGFiZWxzXCIpXHJcblxyXG4gIGlmIHFzKCdtaXJyb3InKVxyXG4gICAgc29sb01pcnJvciA9IHRydWVcclxuICAgIHJldHVyblxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXHJcbiAgaWYgbm90IHNvbG9VbnNodWZmbGVkP1xyXG4gICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgc29sb1Vuc2h1ZmZsZWQubGVuZ3RoID09IDBcclxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcclxuICAgIHJldHVyblxyXG4gIHNvbG9Db3VudCA9IHNvbG9VbnNodWZmbGVkLmxlbmd0aFxyXG5cclxuICBzZXRJbnRlcnZhbChzb2xvVGljaywgNTAwMClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGlmIHlvdXR1YmVSZWFkeVxyXG4gICAgcmV0dXJuXHJcbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuXHJcbiAgc2hvd0NvbnRyb2xzID0gMFxyXG4gIGlmIHFzKCdjb250cm9scycpXHJcbiAgICBzaG93Q29udHJvbHMgPSAxXHJcblxyXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnZW5hYmxlanNhcGknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiMgY2FsbGVkIGJ5IG9uUGxheWVyUmVhZHlcclxuZmluaXNoSW5pdCA9IC0+XHJcbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8gbW9kZSFcclxuXHJcbiAgICBzb2xvU3RhcnR1cCgpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgICAgaWYgcGt0LmNtZD9cclxuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXHJcbiAgZWxzZVxyXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcclxuXHJcbiAgICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBzaG93SW5mbyhwa3QpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxyXG4gICAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxyXG4gICAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcclxuXHJcbnNldFRpbWVvdXQgLT5cclxuICAjIHNvbWVob3cgd2UgbWlzc2VkIHRoaXMgZXZlbnQsIGp1c3Qga2ljayBpdCBtYW51YWxseVxyXG4gIGlmIG5vdCB5b3V0dWJlUmVhZHlcclxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcclxuICAgIHdpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpXHJcbiwgMzAwMFxyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcclxuZmlsdGVyT3BpbmlvbnMgPSB7fVxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxyXG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXHJcblxyXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cclxuICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxyXG4gIGVsc2VcclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxyXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcclxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG4gIGlmIHNvbG9GaWx0ZXJzP1xyXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXHJcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXHJcblxyXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcclxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcclxuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC9cXHMrLylcclxuXHJcbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcclxuICAgICAgaWYgcGllY2VzWzBdID09IFwic2tpcFwiXHJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxyXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXHJcbiAgICAgIGlmIHBpZWNlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXHJcbiAgICAgICAgYWxsQWxsb3dlZCA9IGZhbHNlXHJcblxyXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcclxuXHJcbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxyXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcclxuICAgICAgICBuZWdhdGVkID0gdHJ1ZVxyXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cclxuXHJcbiAgICAgIGNvbW1hbmQgPSBwaWVjZXNbMF1cclxuICAgICAgc3dpdGNoIGNvbW1hbmRcclxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLm5pY2tuYW1lID09IHNcclxuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxyXG4gICAgICAgIHdoZW4gJ3RhZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXHJcbiAgICAgICAgd2hlbiAncmVjZW50JywgJ3NpbmNlJ1xyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICBkdXJhdGlvbkluU2Vjb25kcyA9IHBhcnNlRHVyYXRpb24oc3Vic3RyaW5nKVxyXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxyXG4gICAgICAgICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXHJcbiAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXHJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXHJcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAjIGNvbnNvbGUubG9nIGZpbHRlck9waW5pb25zXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnbm9uZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICMgY29uc29sZS5sb2cgZmlsdGVyT3BpbmlvbnNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICB3aGVuICdmdWxsJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT5cclxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2lkJywgJ2lkcydcclxuICAgICAgICAgIGlkTG9va3VwID0ge31cclxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICBpZiBuZWdhdGVkXHJcbiAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcclxuXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxyXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxyXG4gIGVsc2VcclxuICAgICMgUXVldWUgaXQgYWxsIHVwXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcblxyXG4gIGlmIHNvcnRCeUFydGlzdFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxyXG4iXX0=
