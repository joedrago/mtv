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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvZmlsdGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBLElBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsY0FBQSxF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UixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLEVBRFQ7O0FBRUEsYUFBTztJQVRXLENBQXBCLEVBREY7O0FBV0EsU0FBTztBQXBJTTs7QUFzSWYsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLGtCQUFBLEVBQW9CLGtCQUFwQjtFQUNBLFlBQUEsRUFBYztBQURkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJwbGF5ZXIgPSBudWxsXHJcbnNvY2tldCA9IG51bGxcclxucGxheWluZyA9IGZhbHNlXHJcbnNlcnZlckVwb2NoID0gbnVsbFxyXG5cclxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXHJcblxyXG5pc284NjAxID0gcmVxdWlyZSAnaXNvODYwMS1kdXJhdGlvbidcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0xhYmVscyA9IHt9XHJcbnNvbG9VbnNodWZmbGVkID0gW11cclxuc29sb1F1ZXVlID0gW11cclxuc29sb1ZpZGVvID0gbnVsbFxyXG5zb2xvQ291bnQgPSAwXHJcbnNvbG9TaG93VGltZW91dCA9IG51bGxcclxuc29sb0Vycm9yID0gZmFsc2Vcclxuc29sb01pcnJvciA9IGZhbHNlXHJcblxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5vdmVyVGltZXJzID0gW11cclxuXHJcbm9waW5pb25PcmRlciA9IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcblxyXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XHJcbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbnNob3dUaXRsZXMgPSB0cnVlXHJcbmlmIHFzKCdoaWRldGl0bGVzJylcclxuICBzaG93VGl0bGVzID0gZmFsc2VcclxuXHJcbmZhZGVJbiA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCJcclxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDBcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSArPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDFcclxuXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXHJcblxyXG5mYWRlT3V0ID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMVxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA8PSAwXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMFxyXG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuICBmaW5pc2hJbml0KClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgdmlkZW9EYXRhID0gcGxheWVyLmdldFZpZGVvRGF0YSgpXHJcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xyXG4gICAgY29uc29sZS5sb2cgXCJUaXRsZTogI3t2aWRlb0RhdGEudGl0bGV9XCJcclxuICAgIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9IFwiI3t2aWRlb0RhdGEudGl0bGV9IC0gW1tNVFZdXVwiXHJcblxyXG4gIGlmIGV2ZW50LmRhdGEgPT0gMFxyXG4gICAgY29uc29sZS5sb2cgXCJFTkRFRFwiXHJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cclxuICAgICAgcGxheWluZyA9IGZhbHNlXHJcbiAgICAsIDIwMDApXHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgcGt0XHJcblxyXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXHJcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZm9yIHQgaW4gb3ZlclRpbWVyc1xyXG4gICAgY2xlYXJUaW1lb3V0KHQpXHJcbiAgb3ZlclRpbWVycyA9IFtdXHJcblxyXG4gIGlmIHNob3dUaXRsZXNcclxuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcclxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgICAgIGlmIG5vdCBjb21wYW55P1xyXG4gICAgICAgIGNvbXBhbnkgPSBwa3Qubmlja25hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwa3Qubmlja25hbWUuc2xpY2UoMSlcclxuICAgICAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gICAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICAgIGlmIHNvbG9NaXJyb3JcclxuICAgICAgICBodG1sICs9IFwiXFxuTWlycm9yIE1vZGVcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaHRtbCArPSBcIlxcblNvbG8gTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICAgIGZlZWxpbmdzID0gW11cclxuICAgICAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgICAgZmVlbGluZ3MucHVzaCBvXHJcbiAgICAgIGlmIGZlZWxpbmdzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciBmZWVsaW5nIGluIGZlZWxpbmdzXHJcbiAgICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgICBsaXN0LnNvcnQoKVxyXG4gICAgICAgICAgaHRtbCArPSBcIlxcbiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OiAje2xpc3Quam9pbignLCAnKX1cIlxyXG4gICAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMzAwMFxyXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcclxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXHJcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXHJcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXHJcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxuICBzaG93SW5mbyhwa3QpXHJcblxyXG5zZW5kUmVhZHkgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbnRpY2sgPSAtPlxyXG4gIGlmIHNvbG9JRD9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xyXG4gICAgc2VuZFJlYWR5KClcclxuICAgIHJldHVyblxyXG5cclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNmdyA9IGZhbHNlXHJcbiAgaWYgcXMoJ3NmdycpXHJcbiAgICBzZncgPSB0cnVlXHJcbiAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgU29sbyBNb2RlIEVuZ2luZVxyXG5cclxuc29sb0ZhdGFsRXJyb3IgPSAocmVhc29uKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwic29sb0ZhdGFsRXJyb3I6ICN7cmVhc29ufVwiXHJcbiAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIkVSUk9SOiAje3JlYXNvbn1cIlxyXG4gIHNvbG9FcnJvciA9IHRydWVcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbnNvbG9UaWNrID0gLT5cclxuICBpZiBub3Qgc29sb0lEPyBvciBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwic29sb1RpY2soKVwiXHJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgIHNvbG9QbGF5KClcclxuICAgIHJldHVyblxyXG5cclxuc29sb0VuZGluZyA9IC0+XHJcbiAgc2hvd0luZm8oc29sb1ZpZGVvKVxyXG5cclxuc29sb0luZm9Ccm9hZGNhc3QgPSAtPlxyXG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXHJcbiAgICBuZXh0VmlkZW8gPSBudWxsXHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID4gMFxyXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbMF1cclxuICAgIGluZm8gPVxyXG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cclxuICAgICAgbmV4dDogbmV4dFZpZGVvXHJcbiAgICAgIGluZGV4OiBzb2xvQ291bnQgLSBzb2xvUXVldWUubGVuZ3RoXHJcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cclxuICAgIHNvY2tldC5lbWl0ICdzb2xvJyx7XHJcbiAgICAgIGlkOiBzb2xvSURcclxuICAgICAgY21kOiAnaW5mbydcclxuICAgICAgaW5mbzogaW5mb1xyXG4gICAgfVxyXG5cclxuc29sb1BsYXkgPSAocmVzdGFydCA9IGZhbHNlKSAtPlxyXG4gIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHJlc3RhcnQgb3Igbm90IHNvbG9WaWRlbz9cclxuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPT0gMFxyXG4gICAgICBjb25zb2xlLmxvZyBcIlJlc2h1ZmZsaW5nLi4uXCJcclxuICAgICAgc29sb1F1ZXVlID0gWyBzb2xvVW5zaHVmZmxlZFswXSBdXHJcbiAgICAgIGZvciBpLCBpbmRleCBpbiBzb2xvVW5zaHVmZmxlZFxyXG4gICAgICAgIGNvbnRpbnVlIGlmIGluZGV4ID09IDBcclxuICAgICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGluZGV4ICsgMSkpXHJcbiAgICAgICAgc29sb1F1ZXVlLnB1c2goc29sb1F1ZXVlW2pdKVxyXG4gICAgICAgIHNvbG9RdWV1ZVtqXSA9IGlcclxuXHJcbiAgICBzb2xvVmlkZW8gPSBzb2xvUXVldWUuc2hpZnQoKVxyXG5cclxuICBjb25zb2xlLmxvZyBzb2xvVmlkZW9cclxuXHJcbiAgIyBkZWJ1Z1xyXG4gICMgc29sb1ZpZGVvLnN0YXJ0ID0gMTBcclxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxyXG4gICMgc29sb1ZpZGVvLmR1cmF0aW9uID0gNDBcclxuXHJcbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxyXG5cclxuICBzb2xvSW5mb0Jyb2FkY2FzdCgpXHJcblxyXG4gIHN0YXJ0VGltZSA9IHNvbG9WaWRlby5zdGFydFxyXG4gIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgIHN0YXJ0VGltZSA9IDBcclxuICBlbmRUaW1lID0gc29sb1ZpZGVvLmVuZFxyXG4gIGlmIGVuZFRpbWUgPCAwXHJcbiAgICBlbmRUaW1lID0gc29sb1ZpZGVvLmR1cmF0aW9uXHJcbiAgc29sb0R1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxyXG4gIGlmIHNvbG9TaG93VGltZW91dD9cclxuICAgIGNsZWFyVGltZW91dChzb2xvU2hvd1RpbWVvdXQpXHJcbiAgICBzb2xvU2hvd1RpbWVvdXQgPSBudWxsXHJcbiAgaWYgc29sb0R1cmF0aW9uID4gMzBcclxuICAgIGNvbnNvbGUubG9nIFwiU2hvd2luZyBpbmZvIGFnYWluIGluICN7c29sb0R1cmF0aW9uIC0gMTV9IHNlY29uZHNcIlxyXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gc2V0VGltZW91dChzb2xvRW5kaW5nLCAoc29sb0R1cmF0aW9uIC0gMTUpICogMTAwMClcclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgaWYgcGxheWVyP1xyXG4gICAgaWYgcGxheWVyLmdldFBsYXllclN0YXRlKCkgPT0gMlxyXG4gICAgICBwbGF5ZXIucGxheVZpZGVvKClcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVyLnBhdXNlVmlkZW8oKVxyXG5cclxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxyXG4gIGlmIG5vdCBwa3QuY21kP1xyXG4gICAgcmV0dXJuXHJcbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxyXG4gICAgcmV0dXJuXHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxyXG5cclxuICBzd2l0Y2ggcGt0LmNtZFxyXG4gICAgd2hlbiAnc2tpcCdcclxuICAgICAgc29sb1BsYXkoKVxyXG4gICAgd2hlbiAncmVzdGFydCdcclxuICAgICAgc29sb1BsYXkodHJ1ZSlcclxuICAgIHdoZW4gJ3BhdXNlJ1xyXG4gICAgICBzb2xvUGF1c2UoKVxyXG4gICAgd2hlbiAnaW5mbydcclxuICAgICAgaWYgc29sb01pcnJvclxyXG4gICAgICAgIHNvbG9WaWRlbyA9IHBrdC5pbmZvLmN1cnJlbnRcclxuICAgICAgICBpZiBzb2xvVmlkZW8/XHJcbiAgICAgICAgICBpZiBub3QgcGxheWVyP1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIm5vIHBsYXllciB5ZXRcIlxyXG4gICAgICAgICAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxyXG5cclxuICByZXR1cm5cclxuXHJcbnNvbG9TdGFydHVwID0gLT5cclxuICBzb2xvTGFiZWxzID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL2xhYmVsc1wiKVxyXG5cclxuICBpZiBxcygnbWlycm9yJylcclxuICAgIHNvbG9NaXJyb3IgPSB0cnVlXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxyXG4gIHNvbG9VbnNodWZmbGVkID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nKVxyXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cclxuICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXHJcbiAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXHJcbiAgICByZXR1cm5cclxuICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcclxuXHJcbiAgc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxueW91dHViZVJlYWR5ID0gZmFsc2Vcclxud2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5ID0gLT5cclxuICBpZiB5b3V0dWJlUmVhZHlcclxuICAgIHJldHVyblxyXG4gIHlvdXR1YmVSZWFkeSA9IHRydWVcclxuXHJcbiAgY29uc29sZS5sb2cgXCJvbllvdVR1YmVQbGF5ZXJBUElSZWFkeVwiXHJcblxyXG4gIHNob3dDb250cm9scyA9IDBcclxuICBpZiBxcygnY29udHJvbHMnKVxyXG4gICAgc2hvd0NvbnRyb2xzID0gMVxyXG5cclxuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyICdtdHYtcGxheWVyJywge1xyXG4gICAgd2lkdGg6ICcxMDAlJ1xyXG4gICAgaGVpZ2h0OiAnMTAwJSdcclxuICAgIHZpZGVvSWQ6ICdBQjd5a09mQWdJQScgIyBNVFYgbG9hZGluZyBzY3JlZW4sIHRoaXMgd2lsbCBiZSByZXBsYWNlZCBhbG1vc3QgaW1tZWRpYXRlbHlcclxuICAgIHBsYXllclZhcnM6IHsgJ2F1dG9wbGF5JzogMSwgJ2VuYWJsZWpzYXBpJzogMSwgJ2NvbnRyb2xzJzogc2hvd0NvbnRyb2xzIH1cclxuICAgIGV2ZW50czoge1xyXG4gICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XHJcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgIH1cclxuICB9XHJcblxyXG4jIGNhbGxlZCBieSBvblBsYXllclJlYWR5XHJcbmZpbmlzaEluaXQgPSAtPlxyXG4gIHNvbG9JRCA9IHFzKCdzb2xvJylcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgICAgIHNvbG9JbmZvQnJvYWRjYXN0KClcclxuXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgIyBTb2xvIG1vZGUhXHJcblxyXG4gICAgc29sb1N0YXJ0dXAoKVxyXG5cclxuICAgIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XHJcbiAgICAgIGlmIHBrdC5jbWQ/XHJcbiAgICAgICAgc29sb0NvbW1hbmQocGt0KVxyXG4gIGVsc2VcclxuICAgICMgTm9ybWFsIE1UViBtb2RlXHJcblxyXG4gICAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgICAgIyBjb25zb2xlLmxvZyBwa3RcclxuICAgICAgcGxheShwa3QsIHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxyXG5cclxuICAgIHNvY2tldC5vbiAnZW5kaW5nJywgKHBrdCkgLT5cclxuICAgICAgIyBjb25zb2xlLmxvZyBwa3RcclxuICAgICAgc2hvd0luZm8ocGt0KVxyXG5cclxuICAgIHNvY2tldC5vbiAnc2VydmVyJywgKHNlcnZlcikgLT5cclxuICAgICAgaWYgc2VydmVyRXBvY2g/IGFuZCAoc2VydmVyRXBvY2ggIT0gc2VydmVyLmVwb2NoKVxyXG4gICAgICAgIGNvbnNvbGUubG9nIFwiU2VydmVyIGVwb2NoIGNoYW5nZWQhIFRoZSBzZXJ2ZXIgbXVzdCBoYXZlIHJlYm9vdGVkLiBSZXF1ZXN0aW5nIGZyZXNoIHZpZGVvLi4uXCJcclxuICAgICAgICBzZW5kUmVhZHkoKVxyXG4gICAgICBzZXJ2ZXJFcG9jaCA9IHNlcnZlci5lcG9jaFxyXG5cclxuICAgIHNldEludGVydmFsKHRpY2ssIDUwMDApXHJcblxyXG5zZXRUaW1lb3V0IC0+XHJcbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcclxuICBpZiBub3QgeW91dHViZVJlYWR5XHJcbiAgICBjb25zb2xlLmxvZyBcImtpY2tpbmcgWW91dHViZS4uLlwiXHJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxyXG4sIDMwMDBcclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXHJcbmZpbHRlck9waW5pb25zID0ge31cclxuXHJcbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxyXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxyXG5pc284NjAxID0gcmVxdWlyZSAnaXNvODYwMS1kdXJhdGlvbidcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XHJcbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXHJcblxyXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxyXG4gIGZpbHRlckRhdGFiYXNlID0gZGJcclxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXHJcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cclxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxyXG4gICAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxyXG5cclxuZ2VuZXJhdGVMaXN0ID0gKGZpbHRlclN0cmluZywgc29ydEJ5QXJ0aXN0ID0gZmFsc2UpIC0+XHJcbiAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxyXG4gICAgc29sb0ZpbHRlcnMgPSBbXVxyXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXHJcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcclxuICAgICAgZmlsdGVyID0gZmlsdGVyLnRyaW0oKVxyXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxyXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXHJcbiAgICBpZiBzb2xvRmlsdGVycy5sZW5ndGggPT0gMFxyXG4gICAgICAjIE5vIGZpbHRlcnNcclxuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgY29uc29sZS5sb2cgXCJGaWx0ZXJzOlwiLCBzb2xvRmlsdGVyc1xyXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xyXG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcclxuICBlbHNlXHJcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcclxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gIHNvbG9VbnNodWZmbGVkID0gW11cclxuICBpZiBzb2xvRmlsdGVycz9cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBlLmFsbG93ZWQgPSBmYWxzZVxyXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxyXG5cclxuICAgIGFsbEFsbG93ZWQgPSB0cnVlXHJcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXHJcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvICsvKVxyXG5cclxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcHJvcGVydHkgPT0gXCJhbGxvd2VkXCJcclxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcclxuXHJcbiAgICAgIHN1YnN0cmluZyA9IHBpZWNlcy5zbGljZSgxKS5qb2luKFwiIFwiKVxyXG5cclxuICAgICAgbmVnYXRlZCA9IGZhbHNlXHJcbiAgICAgIGlmIG1hdGNoZXMgPSBwaWVjZXNbMF0ubWF0Y2goL14hKC4rKSQvKVxyXG4gICAgICAgIG5lZ2F0ZWQgPSB0cnVlXHJcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxyXG5cclxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdhZGRlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXHJcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcclxuICAgICAgICB3aGVuICd0YWcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcclxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cclxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXHJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXHJcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ25vbmUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ2Z1bGwnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxyXG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxyXG4gICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxyXG4gICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgaWYgc29ydEJ5QXJ0aXN0XHJcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICByZXR1cm4gMFxyXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIHNldFNlcnZlckRhdGFiYXNlczogc2V0U2VydmVyRGF0YWJhc2VzXHJcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcclxuIl19
