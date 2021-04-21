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
var endedTimer, fadeIn, fadeOut, filters, getData, iso8601, now, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, parseDuration, play, player, playing, qs, sendReady, serverEpoch, showInfo, showTitles, socket, soloCommand, soloCount, soloEnding, soloError, soloFatalError, soloID, soloInfoBroadcast, soloLabels, soloPause, soloPlay, soloQueue, soloShowTimeout, soloStartup, soloTick, soloUnshuffled, soloVideo, tick, youtubeReady;

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

soloStartup = async function() {
  var filterString;
  soloLabels = (await getData("/info/labels"));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsY0FBQSxFQUFB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RCxDQUFELEdBQWMsS0FEaEI7O01BSkY7SUF2RUY7SUE4RUEsS0FBQSxvQkFBQTs7TUFDRSxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQUYsSUFBYSxVQUFkLENBQUEsSUFBOEIsQ0FBSSxDQUFDLENBQUMsT0FBdkM7UUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQixFQURGOztJQURGLENBcEZGO0dBQUEsTUFBQTs7SUF5RkUsS0FBQSxvQkFBQTs7TUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQjtJQURGLENBekZGOztFQTRGQSxJQUFHLFlBQUg7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNsQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLEVBRFQ7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxFQURUOztBQUVBLGFBQU87SUFUVyxDQUFwQixFQURGOztBQVdBLFNBQU87QUE3SE07O0FBK0hmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxZQUFBLEVBQWM7QUFBZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwicGxheWVyID0gbnVsbFxuc29ja2V0ID0gbnVsbFxucGxheWluZyA9IGZhbHNlXG5zZXJ2ZXJFcG9jaCA9IG51bGxcblxuZmlsdGVycyA9IHJlcXVpcmUgJy4vZmlsdGVycydcblxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbnNvbG9JRCA9IG51bGxcbnNvbG9MYWJlbHMgPSB7fVxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxuc29sb1F1ZXVlID0gW11cbnNvbG9WaWRlbyA9IG51bGxcbnNvbG9Db3VudCA9IDBcbnNvbG9TaG93VGltZW91dCA9IG51bGxcbnNvbG9FcnJvciA9IGZhbHNlXG5cbmVuZGVkVGltZXIgPSBudWxsXG5vdmVyVGltZXJzID0gW11cblxub3Bpbmlvbk9yZGVyID0gWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zaG93VGl0bGVzID0gdHJ1ZVxuaWYgcXMoJ2hpZGV0aXRsZXMnKVxuICBzaG93VGl0bGVzID0gZmFsc2VcblxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxuICBpZiBub3QgZWxlbT9cbiAgICByZXR1cm5cblxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDBcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMVxuXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXG5cbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDFcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMFxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG5cbiMgYXV0b3BsYXkgdmlkZW9cbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XG4gIGV2ZW50LnRhcmdldC5wbGF5VmlkZW8oKVxuXG4jIHdoZW4gdmlkZW8gZW5kc1xub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgLT5cbiAgaWYgZW5kZWRUaW1lcj9cbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcbiAgICBlbmRlZFRpbWVyID0gbnVsbFxuXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxuICBpZiB2aWRlb0RhdGE/IGFuZCB2aWRlb0RhdGEudGl0bGU/XG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxuXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxuICAgICAgcGxheWluZyA9IGZhbHNlXG4gICAgLCAyMDAwKVxuXG5zaG93SW5mbyA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIHBrdFxuXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXG4gIG92ZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICBmb3IgdCBpbiBvdmVyVGltZXJzXG4gICAgY2xlYXJUaW1lb3V0KHQpXG4gIG92ZXJUaW1lcnMgPSBbXVxuXG4gIGlmIHNob3dUaXRsZXNcbiAgICBhcnRpc3QgPSBwa3QuYXJ0aXN0XG4gICAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxuICAgIHRpdGxlID0gcGt0LnRpdGxlXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gICAgaHRtbCA9IFwiI3thcnRpc3R9XFxuJiN4MjAxQzsje3RpdGxlfSYjeDIwMUQ7XCJcbiAgICBpZiBzb2xvSUQ/XG4gICAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXG4gICAgICBpZiBub3QgY29tcGFueT9cbiAgICAgICAgY29tcGFueSA9IHBrdC5uaWNrbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBrdC5uaWNrbmFtZS5zbGljZSgxKVxuICAgICAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxuICAgICAgaHRtbCArPSBcIlxcbiN7Y29tcGFueX1cIlxuICAgICAgaHRtbCArPSBcIlxcblNvbG8gTW9kZVwiXG4gICAgZWxzZVxuICAgICAgaHRtbCArPSBcIlxcbiN7cGt0LmNvbXBhbnl9XCJcbiAgICAgIGZlZWxpbmdzID0gW11cbiAgICAgIGZvciBvIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiBwa3Qub3BpbmlvbnNbb10/XG4gICAgICAgICAgZmVlbGluZ3MucHVzaCBvXG4gICAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxuICAgICAgICBodG1sICs9IFwiXFxuTm8gT3BpbmlvbnNcIlxuICAgICAgZWxzZVxuICAgICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xuICAgICAgICAgIGxpc3QgPSBwa3Qub3BpbmlvbnNbZmVlbGluZ11cbiAgICAgICAgICBsaXN0LnNvcnQoKVxuICAgICAgICAgIGh0bWwgKz0gXCJcXG4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTogI3tsaXN0LmpvaW4oJywgJyl9XCJcbiAgICBvdmVyRWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG5cbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxuICAgICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxuICAgICwgMzAwMFxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XG4gICAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxuICAgICwgMTUwMDBcblxucGxheSA9IChwa3QsIGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXG4gIG9wdHMgPSB7XG4gICAgdmlkZW9JZDogaWRcbiAgfVxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXG4gICAgb3B0cy5zdGFydFNlY29uZHMgPSBzdGFydFNlY29uZHNcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChvcHRzKVxuICBwbGF5aW5nID0gdHJ1ZVxuXG4gIHNob3dJbmZvKHBrdClcblxuc2VuZFJlYWR5ID0gLT5cbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXG4gIHVzZXIgPSBxcygndXNlcicpXG4gIHNmdyA9IGZhbHNlXG4gIGlmIHFzKCdzZncnKVxuICAgIHNmdyA9IHRydWVcbiAgc29ja2V0LmVtaXQgJ3JlYWR5JywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XG5cbnRpY2sgPSAtPlxuICBpZiBzb2xvSUQ/XG4gICAgcmV0dXJuXG5cbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBzZW5kUmVhZHkoKVxuICAgIHJldHVyblxuXG4gIHVzZXIgPSBxcygndXNlcicpXG4gIHNmdyA9IGZhbHNlXG4gIGlmIHFzKCdzZncnKVxuICAgIHNmdyA9IHRydWVcbiAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU29sbyBNb2RlIEVuZ2luZVxuXG5zb2xvRmF0YWxFcnJvciA9IChyZWFzb24pIC0+XG4gIGNvbnNvbGUubG9nIFwic29sb0ZhdGFsRXJyb3I6ICN7cmVhc29ufVwiXG4gIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogI3tyZWFzb259XCJcbiAgc29sb0Vycm9yID0gdHJ1ZVxuXG5nZXREYXRhID0gKHVybCkgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbnNvbG9UaWNrID0gLT5cbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yXG4gICAgcmV0dXJuXG5cbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBzb2xvUGxheSgpXG4gICAgcmV0dXJuXG5cbnNvbG9FbmRpbmcgPSAtPlxuICBzaG93SW5mbyhzb2xvVmlkZW8pXG5cbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvP1xuICAgIG5leHRWaWRlbyA9IG51bGxcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID4gMFxuICAgICAgbmV4dFZpZGVvID0gc29sb1F1ZXVlWzBdXG4gICAgaW5mbyA9XG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cbiAgICAgIG5leHQ6IG5leHRWaWRlb1xuICAgICAgaW5kZXg6IHNvbG9Db3VudCAtIHNvbG9RdWV1ZS5sZW5ndGhcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcblxuICAgIGNvbnNvbGUubG9nIFwiQnJvYWRjYXN0OiBcIiwgaW5mb1xuICAgIHNvY2tldC5lbWl0ICdzb2xvJyx7XG4gICAgICBpZDogc29sb0lEXG4gICAgICBjbWQ6ICdpbmZvJ1xuICAgICAgaW5mbzogaW5mb1xuICAgIH1cblxuc29sb1BsYXkgPSAocmVzdGFydCA9IGZhbHNlKSAtPlxuICBpZiBzb2xvRXJyb3JcbiAgICByZXR1cm5cblxuICBpZiBub3QgcmVzdGFydCBvciBub3Qgc29sb1ZpZGVvP1xuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPT0gMFxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXG4gICAgICBzb2xvUXVldWUgPSBbIHNvbG9VbnNodWZmbGVkWzBdIF1cbiAgICAgIGZvciBpLCBpbmRleCBpbiBzb2xvVW5zaHVmZmxlZFxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXG4gICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaW5kZXggKyAxKSlcbiAgICAgICAgc29sb1F1ZXVlLnB1c2goc29sb1F1ZXVlW2pdKVxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXG5cbiAgICBzb2xvVmlkZW8gPSBzb2xvUXVldWUuc2hpZnQoKVxuXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xuXG4gICMgZGVidWdcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXG5cbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxuXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcblxuICBzdGFydFRpbWUgPSBzb2xvVmlkZW8uc3RhcnRcbiAgaWYgc3RhcnRUaW1lIDwgMFxuICAgIHN0YXJ0VGltZSA9IDBcbiAgZW5kVGltZSA9IHNvbG9WaWRlby5lbmRcbiAgaWYgZW5kVGltZSA8IDBcbiAgICBlbmRUaW1lID0gc29sb1ZpZGVvLmR1cmF0aW9uXG4gIHNvbG9EdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcbiAgaWYgc29sb1Nob3dUaW1lb3V0P1xuICAgIGNsZWFyVGltZW91dChzb2xvU2hvd1RpbWVvdXQpXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxuICBpZiBzb2xvRHVyYXRpb24gPiAzMFxuICAgIGNvbnNvbGUubG9nIFwiU2hvd2luZyBpbmZvIGFnYWluIGluICN7c29sb0R1cmF0aW9uIC0gMTV9IHNlY29uZHNcIlxuICAgIHNvbG9TaG93VGltZW91dCA9IHNldFRpbWVvdXQoc29sb0VuZGluZywgKHNvbG9EdXJhdGlvbiAtIDE1KSAqIDEwMDApXG5cblxuc29sb1BhdXNlID0gLT5cbiAgaWYgcGxheWVyP1xuICAgIGlmIHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09IDJcbiAgICAgIHBsYXllci5wbGF5VmlkZW8oKVxuICAgIGVsc2VcbiAgICAgIHBsYXllci5wYXVzZVZpZGVvKClcblxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxuICBpZiBub3QgcGt0LmNtZD9cbiAgICByZXR1cm5cbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxuICAgIHJldHVyblxuXG4gIGNvbnNvbGUubG9nIFwic29sb0NvbW1hbmQ6IFwiLCBwa3RcblxuICBzd2l0Y2ggcGt0LmNtZFxuICAgIHdoZW4gJ3NraXAnXG4gICAgICBzb2xvUGxheSgpXG4gICAgd2hlbiAncmVzdGFydCdcbiAgICAgIHNvbG9QbGF5KHRydWUpXG4gICAgd2hlbiAncGF1c2UnXG4gICAgICBzb2xvUGF1c2UoKVxuXG4gIHJldHVyblxuXG5zb2xvU3RhcnR1cCA9IC0+XG4gIHNvbG9MYWJlbHMgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vbGFiZWxzXCIpXG5cbiAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxuICBzb2xvVW5zaHVmZmxlZCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZylcbiAgaWYgbm90IHNvbG9VbnNodWZmbGVkP1xuICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxuICAgIHJldHVyblxuXG4gIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXG4gICAgc29sb0ZhdGFsRXJyb3IoXCJObyBtYXRjaGluZyBzb25ncyBpbiB0aGUgZmlsdGVyIVwiKVxuICAgIHJldHVyblxuICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcblxuICBzZXRJbnRlcnZhbChzb2xvVGljaywgNTAwMClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxueW91dHViZVJlYWR5ID0gZmFsc2VcbndpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSA9IC0+XG4gIGlmIHlvdXR1YmVSZWFkeVxuICAgIHJldHVyblxuICB5b3V0dWJlUmVhZHkgPSB0cnVlXG5cbiAgY29uc29sZS5sb2cgXCJvbllvdVR1YmVQbGF5ZXJBUElSZWFkeVwiXG5cbiAgc2hvd0NvbnRyb2xzID0gMFxuICBpZiBxcygnY29udHJvbHMnKVxuICAgIHNob3dDb250cm9scyA9IDFcblxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdtdHYtcGxheWVyJywge1xuICAgIHdpZHRoOiAnMTAwJSdcbiAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgIHZpZGVvSWQ6ICdBQjd5a09mQWdJQScgIyBNVFYgbG9hZGluZyBzY3JlZW4sIHRoaXMgd2lsbCBiZSByZXBsYWNlZCBhbG1vc3QgaW1tZWRpYXRlbHlcbiAgICBwbGF5ZXJWYXJzOiB7ICdhdXRvcGxheSc6IDEsICdlbmFibGVqc2FwaSc6IDEsICdjb250cm9scyc6IHNob3dDb250cm9scyB9XG4gICAgZXZlbnRzOiB7XG4gICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XG4gICAgICBvblN0YXRlQ2hhbmdlOiBvblBsYXllclN0YXRlQ2hhbmdlXG4gICAgfVxuICB9XG5cbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxuXG4gIHNvY2tldCA9IGlvKClcblxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxuICAgIGlmIHNvbG9JRD9cbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cbiAgICAgIHNvbG9JbmZvQnJvYWRjYXN0KClcblxuICBpZiBzb2xvSUQ/XG4gICAgIyBTb2xvIG1vZGUhXG5cbiAgICBzb2xvU3RhcnR1cCgpXG5cbiAgICBzb2NrZXQub24gJ3NvbG8nLCAocGt0KSAtPlxuICAgICAgaWYgcGt0LmNtZD9cbiAgICAgICAgc29sb0NvbW1hbmQocGt0KVxuICBlbHNlXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcblxuICAgIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxuICAgICAgcGxheShwa3QsIHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxuXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxuICAgICAgIyBjb25zb2xlLmxvZyBwa3RcbiAgICAgIHNob3dJbmZvKHBrdClcblxuICAgIHNvY2tldC5vbiAnc2VydmVyJywgKHNlcnZlcikgLT5cbiAgICAgIGlmIHNlcnZlckVwb2NoPyBhbmQgKHNlcnZlckVwb2NoICE9IHNlcnZlci5lcG9jaClcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxuICAgICAgICBzZW5kUmVhZHkoKVxuICAgICAgc2VydmVyRXBvY2ggPSBzZXJ2ZXIuZXBvY2hcblxuICAgIHNldEludGVydmFsKHRpY2ssIDUwMDApXG5cbnNldFRpbWVvdXQgLT5cbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcbiAgaWYgbm90IHlvdXR1YmVSZWFkeVxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxuLCAzMDAwXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcbmZpbHRlck9waW5pb25zID0ge31cblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXG5cbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxuICBzb2xvRmlsdGVycyA9IG51bGxcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxuICAgIHNvbG9GaWx0ZXJzID0gW11cbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcbiAgICAgICMgTm8gZmlsdGVyc1xuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcbiAgZWxzZVxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xuICAgICAgcmV0dXJuIG51bGxcblxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXG4gIGlmIHNvbG9GaWx0ZXJzP1xuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXG5cbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvXFxzKy8pXG5cbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxuXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcblxuICAgICAgbmVnYXRlZCA9IGZhbHNlXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcbiAgICAgICAgbmVnYXRlZCA9IHRydWVcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxuXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBmaWx0ZXJPcGluaW9uc1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgd2hlbiAnbm9uZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xuICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcbiAgICAgICAgICAjIGNvbnNvbGUubG9nIGZpbHRlck9waW5pb25zXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdmdWxsJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xuICAgICAgICAgIGlkTG9va3VwID0ge31cbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcbiAgICAgICAgaWYgbmVnYXRlZFxuICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxuICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXG5cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGlmIChlLmFsbG93ZWQgb3IgYWxsQWxsb3dlZCkgYW5kIG5vdCBlLnNraXBwZWRcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXG4gIGVsc2VcbiAgICAjIFF1ZXVlIGl0IGFsbCB1cFxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXG5cbiAgaWYgc29ydEJ5QXJ0aXN0XG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgcmV0dXJuIHNvbG9VbnNodWZmbGVkXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcbiJdfQ==
