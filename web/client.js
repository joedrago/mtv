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

filters = require('../filters');

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


},{"../filters":3,"iso8601-duration":1}],3:[function(require,module,exports){
var cacheOpinions, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, iso8601, now, parseDuration, setServerDatabases;

filterDatabase = null;

filterOpinions = {};

filterServerOpinions = null;

filterGetUserFromNickname = null;

iso8601 = require('iso8601-duration');

now = function() {
  return Math.floor(Date.now() / 1000);
};

parseDuration = function(s) {
  return iso8601.toSeconds(iso8601.parse(s));
};

setServerDatabases = function(db, opinions, getUserFromNickname) {
  filterDatabase = db;
  filterServerOpinions = opinions;
  return filterGetUserFromNickname = getUserFromNickname;
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
      pieces = filter.split(/ +/);
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
      command = pieces[0].toLowerCase();
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
            // soloFatalError("Cannot parse duration: #{substring}")
            console.log(`Duration parsing exception: ${someException}`);
            return null;
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
          if (filterServerOpinions) {
            filterUser = filterGetUserFromNickname(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
            };
          } else {
            await cacheOpinions(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
            };
          }
          break;
        case 'none':
          filterOpinion = void 0;
          filterUser = substring;
          if (filterServerOpinions) {
            filterUser = filterGetUserFromNickname(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
            };
          } else {
            await cacheOpinions(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
            };
          }
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
  setServerDatabases: setServerDatabases,
  generateList: generateList
};


},{"iso8601-duration":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvZmlsdGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBLElBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsY0FBQSxF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UixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLEVBRFQ7O0FBRUEsYUFBTztJQVRXLENBQXBCLEVBREY7O0FBV0EsU0FBTztBQXBJTTs7QUFzSWYsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLGtCQUFBLEVBQW9CLGtCQUFwQjtFQUNBLFlBQUEsRUFBYztBQURkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJwbGF5ZXIgPSBudWxsXG5zb2NrZXQgPSBudWxsXG5wbGF5aW5nID0gZmFsc2VcbnNlcnZlckVwb2NoID0gbnVsbFxuXG5maWx0ZXJzID0gcmVxdWlyZSAnLi4vZmlsdGVycydcblxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbnNvbG9JRCA9IG51bGxcbnNvbG9MYWJlbHMgPSB7fVxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxuc29sb1F1ZXVlID0gW11cbnNvbG9WaWRlbyA9IG51bGxcbnNvbG9Db3VudCA9IDBcbnNvbG9TaG93VGltZW91dCA9IG51bGxcbnNvbG9FcnJvciA9IGZhbHNlXG5zb2xvTWlycm9yID0gZmFsc2VcblxuZW5kZWRUaW1lciA9IG51bGxcbm92ZXJUaW1lcnMgPSBbXVxuXG5vcGluaW9uT3JkZXIgPSBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxuXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucXMgPSAobmFtZSkgLT5cbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cbiAgICByZXR1cm4gbnVsbFxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXG5cbnNob3dUaXRsZXMgPSB0cnVlXG5pZiBxcygnaGlkZXRpdGxlcycpXG4gIHNob3dUaXRsZXMgPSBmYWxzZVxuXG5mYWRlSW4gPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiXG4gIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXG5cbiAgaWYgbXM/IGFuZCBtcyA+IDBcbiAgICBvcGFjaXR5ID0gMFxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cbiAgICAgIG9wYWNpdHkgKz0gNTAgLyBtc1xuICAgICAgaWYgb3BhY2l0eSA+PSAxXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgICAgIG9wYWNpdHkgPSAxXG5cbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXG4gICAgLCA1MFxuICBlbHNlXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMVxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTEpXCJcblxuZmFkZU91dCA9IChlbGVtLCBtcykgLT5cbiAgaWYgbm90IGVsZW0/XG4gICAgcmV0dXJuXG5cbiAgaWYgbXM/IGFuZCBtcyA+IDBcbiAgICBvcGFjaXR5ID0gMVxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cbiAgICAgIG9wYWNpdHkgLT0gNTAgLyBtc1xuICAgICAgaWYgb3BhY2l0eSA8PSAwXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgICAgIG9wYWNpdHkgPSAwXG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXG4gICAgLCA1MFxuICBlbHNlXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcblxuIyBhdXRvcGxheSB2aWRlb1xub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cbiAgZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpXG4gIGZpbmlzaEluaXQoKVxuXG4jIHdoZW4gdmlkZW8gZW5kc1xub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgLT5cbiAgaWYgZW5kZWRUaW1lcj9cbiAgICBjbGVhclRpbWVvdXQoZW5kZWRUaW1lcilcbiAgICBlbmRlZFRpbWVyID0gbnVsbFxuXG4gIHZpZGVvRGF0YSA9IHBsYXllci5nZXRWaWRlb0RhdGEoKVxuICBpZiB2aWRlb0RhdGE/IGFuZCB2aWRlb0RhdGEudGl0bGU/XG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcbiAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBcIiN7dmlkZW9EYXRhLnRpdGxlfSAtIFtbTVRWXV1cIlxuXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxuICAgICAgcGxheWluZyA9IGZhbHNlXG4gICAgLCAyMDAwKVxuXG5zaG93SW5mbyA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIHBrdFxuXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXG4gIG92ZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICBmb3IgdCBpbiBvdmVyVGltZXJzXG4gICAgY2xlYXJUaW1lb3V0KHQpXG4gIG92ZXJUaW1lcnMgPSBbXVxuXG4gIGlmIHNob3dUaXRsZXNcbiAgICBhcnRpc3QgPSBwa3QuYXJ0aXN0XG4gICAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxuICAgIHRpdGxlID0gcGt0LnRpdGxlXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gICAgaHRtbCA9IFwiI3thcnRpc3R9XFxuJiN4MjAxQzsje3RpdGxlfSYjeDIwMUQ7XCJcbiAgICBpZiBzb2xvSUQ/XG4gICAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXG4gICAgICBpZiBub3QgY29tcGFueT9cbiAgICAgICAgY29tcGFueSA9IHBrdC5uaWNrbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBrdC5uaWNrbmFtZS5zbGljZSgxKVxuICAgICAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxuICAgICAgaHRtbCArPSBcIlxcbiN7Y29tcGFueX1cIlxuICAgICAgaWYgc29sb01pcnJvclxuICAgICAgICBodG1sICs9IFwiXFxuTWlycm9yIE1vZGVcIlxuICAgICAgZWxzZVxuICAgICAgICBodG1sICs9IFwiXFxuU29sbyBNb2RlXCJcbiAgICBlbHNlXG4gICAgICBodG1sICs9IFwiXFxuI3twa3QuY29tcGFueX1cIlxuICAgICAgZmVlbGluZ3MgPSBbXVxuICAgICAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgIGlmIHBrdC5vcGluaW9uc1tvXT9cbiAgICAgICAgICBmZWVsaW5ncy5wdXNoIG9cbiAgICAgIGlmIGZlZWxpbmdzLmxlbmd0aCA9PSAwXG4gICAgICAgIGh0bWwgKz0gXCJcXG5ObyBPcGluaW9uc1wiXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBmZWVsaW5nIGluIGZlZWxpbmdzXG4gICAgICAgICAgbGlzdCA9IHBrdC5vcGluaW9uc1tmZWVsaW5nXVxuICAgICAgICAgIGxpc3Quc29ydCgpXG4gICAgICAgICAgaHRtbCArPSBcIlxcbiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OiAje2xpc3Quam9pbignLCAnKX1cIlxuICAgIG92ZXJFbGVtZW50LmlubmVySFRNTCA9IGh0bWxcblxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XG4gICAgICBmYWRlSW4ob3ZlckVsZW1lbnQsIDEwMDApXG4gICAgLCAzMDAwXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cbiAgICAgIGZhZGVPdXQob3ZlckVsZW1lbnQsIDEwMDApXG4gICAgLCAxNTAwMFxuXG5wbGF5ID0gKHBrdCwgaWQsIHN0YXJ0U2Vjb25kcyA9IG51bGwsIGVuZFNlY29uZHMgPSBudWxsKSAtPlxuICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6ICN7aWR9XCJcbiAgb3B0cyA9IHtcbiAgICB2aWRlb0lkOiBpZFxuICB9XG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcbiAgICBvcHRzLnN0YXJ0U2Vjb25kcyA9IHN0YXJ0U2Vjb25kc1xuICBpZiBlbmRTZWNvbmRzPyBhbmQgKGVuZFNlY29uZHMgPj0gMSlcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXG4gIHBsYXllci5sb2FkVmlkZW9CeUlkKG9wdHMpXG4gIHBsYXlpbmcgPSB0cnVlXG5cbiAgc2hvd0luZm8ocGt0KVxuXG5zZW5kUmVhZHkgPSAtPlxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcbiAgdXNlciA9IHFzKCd1c2VyJylcbiAgc2Z3ID0gZmFsc2VcbiAgaWYgcXMoJ3NmdycpXG4gICAgc2Z3ID0gdHJ1ZVxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cblxudGljayA9IC0+XG4gIGlmIHNvbG9JRD9cbiAgICByZXR1cm5cblxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xuICAgIHNlbmRSZWFkeSgpXG4gICAgcmV0dXJuXG5cbiAgdXNlciA9IHFzKCd1c2VyJylcbiAgc2Z3ID0gZmFsc2VcbiAgaWYgcXMoJ3NmdycpXG4gICAgc2Z3ID0gdHJ1ZVxuICBzb2NrZXQuZW1pdCAncGxheWluZycsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTb2xvIE1vZGUgRW5naW5lXG5cbnNvbG9GYXRhbEVycm9yID0gKHJlYXNvbikgLT5cbiAgY29uc29sZS5sb2cgXCJzb2xvRmF0YWxFcnJvcjogI3tyZWFzb259XCJcbiAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIkVSUk9SOiAje3JlYXNvbn1cIlxuICBzb2xvRXJyb3IgPSB0cnVlXG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxuc29sb1RpY2sgPSAtPlxuICBpZiBub3Qgc29sb0lEPyBvciBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxuICAgIHJldHVyblxuXG4gIGNvbnNvbGUubG9nIFwic29sb1RpY2soKVwiXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XG4gICAgc29sb1BsYXkoKVxuICAgIHJldHVyblxuXG5zb2xvRW5kaW5nID0gLT5cbiAgc2hvd0luZm8oc29sb1ZpZGVvKVxuXG5zb2xvSW5mb0Jyb2FkY2FzdCA9IC0+XG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXG4gICAgbmV4dFZpZGVvID0gbnVsbFxuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPiAwXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbMF1cbiAgICBpbmZvID1cbiAgICAgIGN1cnJlbnQ6IHNvbG9WaWRlb1xuICAgICAgbmV4dDogbmV4dFZpZGVvXG4gICAgICBpbmRleDogc29sb0NvdW50IC0gc29sb1F1ZXVlLmxlbmd0aFxuICAgICAgY291bnQ6IHNvbG9Db3VudFxuXG4gICAgY29uc29sZS5sb2cgXCJCcm9hZGNhc3Q6IFwiLCBpbmZvXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLHtcbiAgICAgIGlkOiBzb2xvSURcbiAgICAgIGNtZDogJ2luZm8nXG4gICAgICBpbmZvOiBpbmZvXG4gICAgfVxuXG5zb2xvUGxheSA9IChyZXN0YXJ0ID0gZmFsc2UpIC0+XG4gIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXG4gICAgcmV0dXJuXG5cbiAgaWYgbm90IHJlc3RhcnQgb3Igbm90IHNvbG9WaWRlbz9cbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID09IDBcbiAgICAgIGNvbnNvbGUubG9nIFwiUmVzaHVmZmxpbmcuLi5cIlxuICAgICAgc29sb1F1ZXVlID0gWyBzb2xvVW5zaHVmZmxlZFswXSBdXG4gICAgICBmb3IgaSwgaW5kZXggaW4gc29sb1Vuc2h1ZmZsZWRcbiAgICAgICAgY29udGludWUgaWYgaW5kZXggPT0gMFxuICAgICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGluZGV4ICsgMSkpXG4gICAgICAgIHNvbG9RdWV1ZS5wdXNoKHNvbG9RdWV1ZVtqXSlcbiAgICAgICAgc29sb1F1ZXVlW2pdID0gaVxuXG4gICAgc29sb1ZpZGVvID0gc29sb1F1ZXVlLnNoaWZ0KClcblxuICBjb25zb2xlLmxvZyBzb2xvVmlkZW9cblxuICAjIGRlYnVnXG4gICMgc29sb1ZpZGVvLnN0YXJ0ID0gMTBcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcbiAgIyBzb2xvVmlkZW8uZHVyYXRpb24gPSA0MFxuXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcblxuICBzb2xvSW5mb0Jyb2FkY2FzdCgpXG5cbiAgc3RhcnRUaW1lID0gc29sb1ZpZGVvLnN0YXJ0XG4gIGlmIHN0YXJ0VGltZSA8IDBcbiAgICBzdGFydFRpbWUgPSAwXG4gIGVuZFRpbWUgPSBzb2xvVmlkZW8uZW5kXG4gIGlmIGVuZFRpbWUgPCAwXG4gICAgZW5kVGltZSA9IHNvbG9WaWRlby5kdXJhdGlvblxuICBzb2xvRHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXG4gIGlmIHNvbG9TaG93VGltZW91dD9cbiAgICBjbGVhclRpbWVvdXQoc29sb1Nob3dUaW1lb3V0KVxuICAgIHNvbG9TaG93VGltZW91dCA9IG51bGxcbiAgaWYgc29sb0R1cmF0aW9uID4gMzBcbiAgICBjb25zb2xlLmxvZyBcIlNob3dpbmcgaW5mbyBhZ2FpbiBpbiAje3NvbG9EdXJhdGlvbiAtIDE1fSBzZWNvbmRzXCJcbiAgICBzb2xvU2hvd1RpbWVvdXQgPSBzZXRUaW1lb3V0KHNvbG9FbmRpbmcsIChzb2xvRHVyYXRpb24gLSAxNSkgKiAxMDAwKVxuXG5zb2xvUGF1c2UgPSAtPlxuICBpZiBwbGF5ZXI/XG4gICAgaWYgcGxheWVyLmdldFBsYXllclN0YXRlKCkgPT0gMlxuICAgICAgcGxheWVyLnBsYXlWaWRlbygpXG4gICAgZWxzZVxuICAgICAgcGxheWVyLnBhdXNlVmlkZW8oKVxuXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XG4gIGlmIG5vdCBwa3QuY21kP1xuICAgIHJldHVyblxuICBpZiBwa3QuaWQgIT0gc29sb0lEXG4gICAgcmV0dXJuXG5cbiAgIyBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XG5cbiAgc3dpdGNoIHBrdC5jbWRcbiAgICB3aGVuICdza2lwJ1xuICAgICAgc29sb1BsYXkoKVxuICAgIHdoZW4gJ3Jlc3RhcnQnXG4gICAgICBzb2xvUGxheSh0cnVlKVxuICAgIHdoZW4gJ3BhdXNlJ1xuICAgICAgc29sb1BhdXNlKClcbiAgICB3aGVuICdpbmZvJ1xuICAgICAgaWYgc29sb01pcnJvclxuICAgICAgICBzb2xvVmlkZW8gPSBwa3QuaW5mby5jdXJyZW50XG4gICAgICAgIGlmIHNvbG9WaWRlbz9cbiAgICAgICAgICBpZiBub3QgcGxheWVyP1xuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJubyBwbGF5ZXIgeWV0XCJcbiAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXG5cbiAgcmV0dXJuXG5cbnNvbG9TdGFydHVwID0gLT5cbiAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcblxuICBpZiBxcygnbWlycm9yJylcbiAgICBzb2xvTWlycm9yID0gdHJ1ZVxuICAgIHJldHVyblxuXG4gIGZpbHRlclN0cmluZyA9IHFzKCdmaWx0ZXJzJylcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cbiAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgc29sbyBkYXRhYmFzZSFcIilcbiAgICByZXR1cm5cblxuICBpZiBzb2xvVW5zaHVmZmxlZC5sZW5ndGggPT0gMFxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcbiAgICByZXR1cm5cbiAgc29sb0NvdW50ID0gc29sb1Vuc2h1ZmZsZWQubGVuZ3RoXG5cbiAgc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnlvdXR1YmVSZWFkeSA9IGZhbHNlXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxuICBpZiB5b3V0dWJlUmVhZHlcbiAgICByZXR1cm5cbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxuXG4gIGNvbnNvbGUubG9nIFwib25Zb3VUdWJlUGxheWVyQVBJUmVhZHlcIlxuXG4gIHNob3dDb250cm9scyA9IDBcbiAgaWYgcXMoJ2NvbnRyb2xzJylcbiAgICBzaG93Q29udHJvbHMgPSAxXG5cbiAgcGxheWVyID0gbmV3IFlULlBsYXllciAnbXR2LXBsYXllcicsIHtcbiAgICB3aWR0aDogJzEwMCUnXG4gICAgaGVpZ2h0OiAnMTAwJSdcbiAgICB2aWRlb0lkOiAnQUI3eWtPZkFnSUEnICMgTVRWIGxvYWRpbmcgc2NyZWVuLCB0aGlzIHdpbGwgYmUgcmVwbGFjZWQgYWxtb3N0IGltbWVkaWF0ZWx5XG4gICAgcGxheWVyVmFyczogeyAnYXV0b3BsYXknOiAxLCAnZW5hYmxlanNhcGknOiAxLCAnY29udHJvbHMnOiBzaG93Q29udHJvbHMgfVxuICAgIGV2ZW50czoge1xuICAgICAgb25SZWFkeTogb25QbGF5ZXJSZWFkeVxuICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxuICAgIH1cbiAgfVxuXG4jIGNhbGxlZCBieSBvblBsYXllclJlYWR5XG5maW5pc2hJbml0ID0gLT5cbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxuXG4gIHNvY2tldCA9IGlvKClcblxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxuICAgIGlmIHNvbG9JRD9cbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cbiAgICAgIHNvbG9JbmZvQnJvYWRjYXN0KClcblxuICBpZiBzb2xvSUQ/XG4gICAgIyBTb2xvIG1vZGUhXG5cbiAgICBzb2xvU3RhcnR1cCgpXG5cbiAgICBzb2NrZXQub24gJ3NvbG8nLCAocGt0KSAtPlxuICAgICAgaWYgcGt0LmNtZD9cbiAgICAgICAgc29sb0NvbW1hbmQocGt0KVxuICBlbHNlXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcblxuICAgIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxuICAgICAgcGxheShwa3QsIHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxuXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxuICAgICAgIyBjb25zb2xlLmxvZyBwa3RcbiAgICAgIHNob3dJbmZvKHBrdClcblxuICAgIHNvY2tldC5vbiAnc2VydmVyJywgKHNlcnZlcikgLT5cbiAgICAgIGlmIHNlcnZlckVwb2NoPyBhbmQgKHNlcnZlckVwb2NoICE9IHNlcnZlci5lcG9jaClcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxuICAgICAgICBzZW5kUmVhZHkoKVxuICAgICAgc2VydmVyRXBvY2ggPSBzZXJ2ZXIuZXBvY2hcblxuICAgIHNldEludGVydmFsKHRpY2ssIDUwMDApXG5cbnNldFRpbWVvdXQgLT5cbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcbiAgaWYgbm90IHlvdXR1YmVSZWFkeVxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxuLCAzMDAwXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcbmZpbHRlck9waW5pb25zID0ge31cblxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbm5vdyA9IC0+XG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxuXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxuICBmaWx0ZXJEYXRhYmFzZSA9IGRiXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXG5cbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxuICBzb2xvRmlsdGVycyA9IG51bGxcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxuICAgIHNvbG9GaWx0ZXJzID0gW11cbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcbiAgICAgICMgTm8gZmlsdGVyc1xuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcbiAgZWxzZVxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xuICAgICAgcmV0dXJuIG51bGxcblxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXG4gIGlmIHNvbG9GaWx0ZXJzP1xuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXG5cbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvICsvKVxuXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcblxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXG5cbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXG4gICAgICAgIG5lZ2F0ZWQgPSB0cnVlXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cblxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ25vbmUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ2Z1bGwnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxuICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcblxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcbiAgZWxzZVxuICAgICMgUXVldWUgaXQgYWxsIHVwXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcblxuICBpZiBzb3J0QnlBcnRpc3RcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxuIl19
