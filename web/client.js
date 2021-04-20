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
var cacheOpinions, endedTimer, fadeIn, fadeOut, filters, getData, iso8601, now, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, parseDuration, play, player, playing, qs, sendReady, serverEpoch, showInfo, showTitles, socket, soloCommand, soloCount, soloEnding, soloError, soloFatalError, soloID, soloInfoBroadcast, soloLabels, soloOpinions, soloPause, soloPlay, soloQueue, soloShowTimeout, soloStartup, soloTick, soloUnshuffled, soloVideo, tick, youtubeReady;

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

soloOpinions = {};

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

cacheOpinions = async function(filterUser) {
  if (soloOpinions[filterUser] == null) {
    soloOpinions[filterUser] = (await getData(`/info/opinions?user=${encodeURIComponent(filterUser)}`));
    if (soloOpinions[filterUser] == null) {
      return soloFatalError(`Cannot get user opinions for ${filterUser}`);
    }
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
var filterDatabase, generateList, getData;

filterDatabase = null;

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
          // console.log soloOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = soloOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
          };
          break;
        case 'none':
          filterOpinion = void 0;
          filterUser = substring;
          await cacheOpinions(filterUser);
          // console.log soloOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = soloOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBLG1CQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFB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Q0FBRCxHQUFjLEtBRGhCOztNQUpGO0lBdkVGO0lBOEVBLEtBQUEsb0JBQUE7O01BQ0UsSUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFGLElBQWEsVUFBZCxDQUFBLElBQThCLENBQUksQ0FBQyxDQUFDLE9BQXZDO1FBQ0UsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEIsRUFERjs7SUFERixDQXBGRjtHQUFBLE1BQUE7O0lBeUZFLEtBQUEsb0JBQUE7O01BQ0UsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEI7SUFERixDQXpGRjs7RUE0RkEsSUFBRyxZQUFIO0lBQ0UsY0FBYyxDQUFDLElBQWYsQ0FBb0IsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7TUFDbEIsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUFBLEdBQXlCLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQTVCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUFBLEdBQXlCLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQTVCO0FBQ0UsZUFBTyxFQURUOztNQUVBLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUEzQjtBQUNFLGVBQU8sQ0FBQyxFQURWOztNQUVBLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUEzQjtBQUNFLGVBQU8sRUFEVDs7QUFFQSxhQUFPO0lBVFcsQ0FBcEIsRUFERjs7QUFXQSxTQUFPO0FBN0hNOztBQStIZixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsWUFBQSxFQUFjO0FBQWQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBIG1vZHVsZSBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uc1xuICovXG5cbi8qKlxuICogVGhlIHBhdHRlcm4gdXNlZCBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uIChQblluTW5EVG5Ibk1uUykuXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIHRoZSB3ZWVrIGZvcm1hdCBQblcuXG4gKi9cblxuLy8gUG5Zbk1uRFRuSG5NblNcbnZhciBudW1iZXJzID0gJ1xcXFxkKyg/OltcXFxcLixdXFxcXGQrKT8nO1xudmFyIHdlZWtQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdXKSc7XG52YXIgZGF0ZVBhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1kpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnRCk/JztcbnZhciB0aW1lUGF0dGVybiA9ICdUKCcgKyBudW1iZXJzICsgJ0gpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnUyk/JztcblxudmFyIGlzbzg2MDEgPSAnUCg/OicgKyB3ZWVrUGF0dGVybiArICd8JyArIGRhdGVQYXR0ZXJuICsgJyg/OicgKyB0aW1lUGF0dGVybiArICcpPyknO1xudmFyIG9iak1hcCA9IFsnd2Vla3MnLCAneWVhcnMnLCAnbW9udGhzJywgJ2RheXMnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbi8qKlxuICogVGhlIElTTzg2MDEgcmVnZXggZm9yIG1hdGNoaW5nIC8gdGVzdGluZyBkdXJhdGlvbnNcbiAqL1xudmFyIHBhdHRlcm4gPSBleHBvcnRzLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGlzbzg2MDEpO1xuXG4vKiogUGFyc2UgUG5Zbk1uRFRuSG5NblMgZm9ybWF0IHRvIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGR1cmF0aW9uU3RyaW5nIC0gUG5Zbk1uRFRuSG5NblMgZm9ybWF0dGVkIHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fSAtIFdpdGggYSBwcm9wZXJ0eSBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBwYXR0ZXJuXG4gKi9cbnZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShkdXJhdGlvblN0cmluZykge1xuICAvLyBTbGljZSBhd2F5IGZpcnN0IGVudHJ5IGluIG1hdGNoLWFycmF5XG4gIHJldHVybiBkdXJhdGlvblN0cmluZy5tYXRjaChwYXR0ZXJuKS5zbGljZSgxKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIG5leHQsIGlkeCkge1xuICAgIHByZXZbb2JqTWFwW2lkeF1dID0gcGFyc2VGbG9hdChuZXh0KSB8fCAwO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gYW4gZW5kIERhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgRGF0ZSBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtEYXRlfSAtIFRoZSByZXN1bHRpbmcgZW5kIERhdGVcbiAqL1xudmFyIGVuZCA9IGV4cG9ydHMuZW5kID0gZnVuY3Rpb24gZW5kKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgLy8gQ3JlYXRlIHR3byBlcXVhbCB0aW1lc3RhbXBzLCBhZGQgZHVyYXRpb24gdG8gJ3RoZW4nIGFuZCByZXR1cm4gdGltZSBkaWZmZXJlbmNlXG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIHRoZW4gPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXG4gIHRoZW4uc2V0RnVsbFllYXIodGhlbi5nZXRGdWxsWWVhcigpICsgZHVyYXRpb24ueWVhcnMpO1xuICB0aGVuLnNldE1vbnRoKHRoZW4uZ2V0TW9udGgoKSArIGR1cmF0aW9uLm1vbnRocyk7XG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLmRheXMpO1xuICB0aGVuLnNldEhvdXJzKHRoZW4uZ2V0SG91cnMoKSArIGR1cmF0aW9uLmhvdXJzKTtcbiAgdGhlbi5zZXRNaW51dGVzKHRoZW4uZ2V0TWludXRlcygpICsgZHVyYXRpb24ubWludXRlcyk7XG4gIC8vIFRoZW4uc2V0U2Vjb25kcyh0aGVuLmdldFNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMpO1xuICB0aGVuLnNldE1pbGxpc2Vjb25kcyh0aGVuLmdldE1pbGxpc2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyAqIDEwMDApO1xuICAvLyBTcGVjaWFsIGNhc2Ugd2Vla3NcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24ud2Vla3MgKiA3KTtcblxuICByZXR1cm4gdGhlbjtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBzZWNvbmRzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG52YXIgdG9TZWNvbmRzID0gZXhwb3J0cy50b1NlY29uZHMgPSBmdW5jdGlvbiB0b1NlY29uZHMoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICB2YXIgdGhlbiA9IGVuZChkdXJhdGlvbiwgbm93KTtcblxuICB2YXIgc2Vjb25kcyA9ICh0aGVuLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgcmV0dXJuIHNlY29uZHM7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGVuZDogZW5kLFxuICB0b1NlY29uZHM6IHRvU2Vjb25kcyxcbiAgcGF0dGVybjogcGF0dGVybixcbiAgcGFyc2U6IHBhcnNlXG59OyIsInBsYXllciA9IG51bGxcclxuc29ja2V0ID0gbnVsbFxyXG5wbGF5aW5nID0gZmFsc2Vcclxuc2VydmVyRXBvY2ggPSBudWxsXHJcblxyXG5maWx0ZXJzID0gcmVxdWlyZSAnLi9maWx0ZXJzJ1xyXG5cclxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXHJcblxyXG5zb2xvSUQgPSBudWxsXHJcbnNvbG9MYWJlbHMgPSB7fVxyXG5zb2xvVW5zaHVmZmxlZCA9IFtdXHJcbnNvbG9RdWV1ZSA9IFtdXHJcbnNvbG9WaWRlbyA9IG51bGxcclxuc29sb0NvdW50ID0gMFxyXG5zb2xvU2hvd1RpbWVvdXQgPSBudWxsXHJcbnNvbG9FcnJvciA9IGZhbHNlXHJcbnNvbG9PcGluaW9ucyA9IHt9XHJcblxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5vdmVyVGltZXJzID0gW11cclxuXHJcbm9waW5pb25PcmRlciA9IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcblxyXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XHJcbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbnNob3dUaXRsZXMgPSB0cnVlXHJcbmlmIHFzKCdoaWRldGl0bGVzJylcclxuICBzaG93VGl0bGVzID0gZmFsc2VcclxuXHJcbmZhZGVJbiA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCJcclxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDBcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSArPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDFcclxuXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXHJcblxyXG5mYWRlT3V0ID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMVxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA8PSAwXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMFxyXG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgdmlkZW9EYXRhID0gcGxheWVyLmdldFZpZGVvRGF0YSgpXHJcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xyXG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcclxuICAgIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9IFwiI3t2aWRlb0RhdGEudGl0bGV9IC0gW1tNVFZdXVwiXHJcblxyXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxyXG4gICAgY29uc29sZS5sb2cgXCJFTkRFRFwiXHJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cclxuICAgICAgcGxheWluZyA9IGZhbHNlXHJcbiAgICAsIDIwMDApXHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgcGt0XHJcblxyXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXHJcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZm9yIHQgaW4gb3ZlclRpbWVyc1xyXG4gICAgY2xlYXJUaW1lb3V0KHQpXHJcbiAgb3ZlclRpbWVycyA9IFtdXHJcblxyXG4gIGlmIHNob3dUaXRsZXNcclxuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcclxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgICAgIGlmIG5vdCBjb21wYW55P1xyXG4gICAgICAgIGNvbXBhbnkgPSBwa3Qubmlja25hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwa3Qubmlja25hbWUuc2xpY2UoMSlcclxuICAgICAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gICAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5Tb2xvIE1vZGVcIlxyXG4gICAgZWxzZVxyXG4gICAgICBodG1sICs9IFwiXFxuI3twa3QuY29tcGFueX1cIlxyXG4gICAgICBmZWVsaW5ncyA9IFtdXHJcbiAgICAgIGZvciBvIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgIGlmIHBrdC5vcGluaW9uc1tvXT9cclxuICAgICAgICAgIGZlZWxpbmdzLnB1c2ggb1xyXG4gICAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxyXG4gICAgICAgIGh0bWwgKz0gXCJcXG5ObyBPcGluaW9uc1wiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xyXG4gICAgICAgICAgbGlzdCA9IHBrdC5vcGluaW9uc1tmZWVsaW5nXVxyXG4gICAgICAgICAgbGlzdC5zb3J0KClcclxuICAgICAgICAgIGh0bWwgKz0gXCJcXG4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTogI3tsaXN0LmpvaW4oJywgJyl9XCJcclxuICAgIG92ZXJFbGVtZW50LmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgICBmYWRlSW4ob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgICAsIDMwMDBcclxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIGZhZGVPdXQob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgICAsIDE1MDAwXHJcblxyXG5wbGF5ID0gKHBrdCwgaWQsIHN0YXJ0U2Vjb25kcyA9IG51bGwsIGVuZFNlY29uZHMgPSBudWxsKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxyXG4gIG9wdHMgPSB7XHJcbiAgICB2aWRlb0lkOiBpZFxyXG4gIH1cclxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXHJcbiAgICBvcHRzLnN0YXJ0U2Vjb25kcyA9IHN0YXJ0U2Vjb25kc1xyXG4gIGlmIGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+PSAxKVxyXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xyXG4gIHBsYXllci5sb2FkVmlkZW9CeUlkKG9wdHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgc2hvd0luZm8ocGt0KVxyXG5cclxuc2VuZFJlYWR5ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNmdyA9IGZhbHNlXHJcbiAgaWYgcXMoJ3NmdycpXHJcbiAgICBzZncgPSB0cnVlXHJcbiAgc29ja2V0LmVtaXQgJ3JlYWR5JywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XHJcblxyXG50aWNrID0gLT5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgIHNlbmRSZWFkeSgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdXNlciA9IHFzKCd1c2VyJylcclxuICBzZncgPSBmYWxzZVxyXG4gIGlmIHFzKCdzZncnKVxyXG4gICAgc2Z3ID0gdHJ1ZVxyXG4gIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFNvbG8gTW9kZSBFbmdpbmVcclxuXHJcbnNvbG9GYXRhbEVycm9yID0gKHJlYXNvbikgLT5cclxuICBjb25zb2xlLmxvZyBcInNvbG9GYXRhbEVycm9yOiAje3JlYXNvbn1cIlxyXG4gIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogI3tyZWFzb259XCJcclxuICBzb2xvRXJyb3IgPSB0cnVlXHJcblxyXG5nZXREYXRhID0gKHVybCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG5zb2xvVGljayA9IC0+XHJcbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yXHJcbiAgICByZXR1cm5cclxuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc29sb1BsYXkoKVxyXG4gICAgcmV0dXJuXHJcblxyXG5zb2xvRW5kaW5nID0gLT5cclxuICBzaG93SW5mbyhzb2xvVmlkZW8pXHJcblxyXG5zb2xvSW5mb0Jyb2FkY2FzdCA9IC0+XHJcbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvP1xyXG4gICAgbmV4dFZpZGVvID0gbnVsbFxyXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA+IDBcclxuICAgICAgbmV4dFZpZGVvID0gc29sb1F1ZXVlWzBdXHJcbiAgICBpbmZvID1cclxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXHJcbiAgICAgIG5leHQ6IG5leHRWaWRlb1xyXG4gICAgICBpbmRleDogc29sb0NvdW50IC0gc29sb1F1ZXVlLmxlbmd0aFxyXG4gICAgICBjb3VudDogc29sb0NvdW50XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJCcm9hZGNhc3Q6IFwiLCBpbmZvXHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycse1xyXG4gICAgICBpZDogc29sb0lEXHJcbiAgICAgIGNtZDogJ2luZm8nXHJcbiAgICAgIGluZm86IGluZm9cclxuICAgIH1cclxuXHJcbnNvbG9QbGF5ID0gKHJlc3RhcnQgPSBmYWxzZSkgLT5cclxuICBpZiBzb2xvRXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3QgcmVzdGFydCBvciBub3Qgc29sb1ZpZGVvP1xyXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiUmVzaHVmZmxpbmcuLi5cIlxyXG4gICAgICBzb2xvUXVldWUgPSBbIHNvbG9VbnNodWZmbGVkWzBdIF1cclxuICAgICAgZm9yIGksIGluZGV4IGluIHNvbG9VbnNodWZmbGVkXHJcbiAgICAgICAgY29udGludWUgaWYgaW5kZXggPT0gMFxyXG4gICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaW5kZXggKyAxKSlcclxuICAgICAgICBzb2xvUXVldWUucHVzaChzb2xvUXVldWVbal0pXHJcbiAgICAgICAgc29sb1F1ZXVlW2pdID0gaVxyXG5cclxuICAgIHNvbG9WaWRlbyA9IHNvbG9RdWV1ZS5zaGlmdCgpXHJcblxyXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xyXG5cclxuICAjIGRlYnVnXHJcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxyXG4gICMgc29sb1ZpZGVvLmVuZCA9IDUwXHJcbiAgIyBzb2xvVmlkZW8uZHVyYXRpb24gPSA0MFxyXG5cclxuICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcclxuXHJcbiAgc3RhcnRUaW1lID0gc29sb1ZpZGVvLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBzb2xvVmlkZW8uZW5kXHJcbiAgaWYgZW5kVGltZSA8IDBcclxuICAgIGVuZFRpbWUgPSBzb2xvVmlkZW8uZHVyYXRpb25cclxuICBzb2xvRHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXHJcbiAgaWYgc29sb1Nob3dUaW1lb3V0P1xyXG4gICAgY2xlYXJUaW1lb3V0KHNvbG9TaG93VGltZW91dClcclxuICAgIHNvbG9TaG93VGltZW91dCA9IG51bGxcclxuICBpZiBzb2xvRHVyYXRpb24gPiAzMFxyXG4gICAgY29uc29sZS5sb2cgXCJTaG93aW5nIGluZm8gYWdhaW4gaW4gI3tzb2xvRHVyYXRpb24gLSAxNX0gc2Vjb25kc1wiXHJcbiAgICBzb2xvU2hvd1RpbWVvdXQgPSBzZXRUaW1lb3V0KHNvbG9FbmRpbmcsIChzb2xvRHVyYXRpb24gLSAxNSkgKiAxMDAwKVxyXG5cclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgaWYgcGxheWVyP1xyXG4gICAgaWYgcGxheWVyLmdldFBsYXllclN0YXRlKCkgPT0gMlxyXG4gICAgICBwbGF5ZXIucGxheVZpZGVvKClcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVyLnBhdXNlVmlkZW8oKVxyXG5cclxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxyXG4gIGlmIG5vdCBwa3QuY21kP1xyXG4gICAgcmV0dXJuXHJcbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwic29sb0NvbW1hbmQ6IFwiLCBwa3RcclxuXHJcbiAgc3dpdGNoIHBrdC5jbWRcclxuICAgIHdoZW4gJ3NraXAnXHJcbiAgICAgIHNvbG9QbGF5KClcclxuICAgIHdoZW4gJ3Jlc3RhcnQnXHJcbiAgICAgIHNvbG9QbGF5KHRydWUpXHJcbiAgICB3aGVuICdwYXVzZSdcclxuICAgICAgc29sb1BhdXNlKClcclxuXHJcbiAgcmV0dXJuXHJcblxyXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XHJcbiAgaWYgbm90IHNvbG9PcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgIHNvbG9PcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxyXG4gICAgaWYgbm90IHNvbG9PcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHVzZXIgb3BpbmlvbnMgZm9yICN7ZmlsdGVyVXNlcn1cIilcclxuXHJcbnNvbG9TdGFydHVwID0gLT5cclxuICBzb2xvTGFiZWxzID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL2xhYmVsc1wiKVxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXHJcbiAgaWYgbm90IHNvbG9VbnNodWZmbGVkP1xyXG4gICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgc29sb1Vuc2h1ZmZsZWQubGVuZ3RoID09IDBcclxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcclxuICAgIHJldHVyblxyXG4gIHNvbG9Db3VudCA9IHNvbG9VbnNodWZmbGVkLmxlbmd0aFxyXG5cclxuICBzZXRJbnRlcnZhbChzb2xvVGljaywgNTAwMClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGlmIHlvdXR1YmVSZWFkeVxyXG4gICAgcmV0dXJuXHJcbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuXHJcbiAgc2hvd0NvbnRyb2xzID0gMFxyXG4gIGlmIHFzKCdjb250cm9scycpXHJcbiAgICBzaG93Q29udHJvbHMgPSAxXHJcblxyXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XHJcbiAgICB3aWR0aDogJzEwMCUnXHJcbiAgICBoZWlnaHQ6ICcxMDAlJ1xyXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnZW5hYmxlanNhcGknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcclxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8gbW9kZSFcclxuXHJcbiAgICBzb2xvU3RhcnR1cCgpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgICAgaWYgcGt0LmNtZD9cclxuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXHJcbiAgZWxzZVxyXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcclxuXHJcbiAgICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBzaG93SW5mbyhwa3QpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxyXG4gICAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxyXG4gICAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcclxuXHJcbnNldFRpbWVvdXQgLT5cclxuICAjIHNvbWVob3cgd2UgbWlzc2VkIHRoaXMgZXZlbnQsIGp1c3Qga2ljayBpdCBtYW51YWxseVxyXG4gIGlmIG5vdCB5b3V0dWJlUmVhZHlcclxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcclxuICAgIHdpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpXHJcbiwgMzAwMFxyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxyXG4gIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcclxuICAgIHNvbG9GaWx0ZXJzID0gW11cclxuICAgIHJhd0ZpbHRlcnMgPSBmaWx0ZXJTdHJpbmcuc3BsaXQoL1xccj9cXG4vKVxyXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXHJcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcclxuICAgICAgaWYgZmlsdGVyLmxlbmd0aCA+IDBcclxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcclxuICAgICAgIyBObyBmaWx0ZXJzXHJcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcclxuICBpZiBmaWx0ZXJEYXRhYmFzZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXHJcbiAgZWxzZVxyXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZyBkYXRhYmFzZS4uLlwiXHJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxyXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG5cclxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXHJcbiAgaWYgc29sb0ZpbHRlcnM/XHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcclxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcclxuXHJcbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxyXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xyXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoL1xccysvKVxyXG5cclxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcHJvcGVydHkgPT0gXCJhbGxvd2VkXCJcclxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcclxuXHJcbiAgICAgIHN1YnN0cmluZyA9IHBpZWNlcy5zbGljZSgxKS5qb2luKFwiIFwiKVxyXG5cclxuICAgICAgbmVnYXRlZCA9IGZhbHNlXHJcbiAgICAgIGlmIG1hdGNoZXMgPSBwaWVjZXNbMF0ubWF0Y2goL14hKC4rKSQvKVxyXG4gICAgICAgIG5lZ2F0ZWQgPSB0cnVlXHJcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxyXG5cclxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXVxyXG4gICAgICBzd2l0Y2ggY29tbWFuZFxyXG4gICAgICAgIHdoZW4gJ2FydGlzdCcsICdiYW5kJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAndGl0bGUnLCAnc29uZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnYWRkZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUubmlja25hbWUgPT0gc1xyXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBPYmplY3Qua2V5cyhlLnRhZ3MpLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgd2hlbiAndGFnJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50YWdzW3NdID09IHRydWVcclxuICAgICAgICB3aGVuICdyZWNlbnQnLCAnc2luY2UnXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxyXG4gICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIGR1cmF0aW9uSW5TZWNvbmRzID0gcGFyc2VEdXJhdGlvbihzdWJzdHJpbmcpXHJcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXHJcbiAgICAgICAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcclxuICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBbI3tzdWJzdHJpbmd9XSAtICN7ZHVyYXRpb25JblNlY29uZHN9XCJcclxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcclxuICAgICAgICB3aGVuICdsb3ZlJywgJ2xpa2UnLCAnYmxlaCcsICdoYXRlJ1xyXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICMgY29uc29sZS5sb2cgc29sb09waW5pb25zXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IHNvbG9PcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ25vbmUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAjIGNvbnNvbGUubG9nIHNvbG9PcGluaW9uc1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBzb2xvT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICB3aGVuICdmdWxsJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT5cclxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2lkJywgJ2lkcydcclxuICAgICAgICAgIGlkTG9va3VwID0ge31cclxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICBpZiBuZWdhdGVkXHJcbiAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcclxuXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxyXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxyXG4gIGVsc2VcclxuICAgICMgUXVldWUgaXQgYWxsIHVwXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcblxyXG4gIGlmIHNvcnRCeUFydGlzdFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxyXG4iXX0=
