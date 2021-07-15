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
      negated = false;
      property = "allowed";
      if (pieces[0] === "skip") {
        property = "skipped";
        pieces.shift();
      } else if (pieces[0] === "and") {
        property = "skipped";
        negated = !negated;
        pieces.shift();
      }
      if (pieces.length === 0) {
        continue;
      }
      if (property === "allowed") {
        allAllowed = false;
      }
      substring = pieces.slice(1).join(" ");
      idLookup = null;
      if (matches = pieces[0].match(/^!(.+)$/)) {
        negated = !negated;
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
            if (id.match(/^#/)) {
              break;
            }
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
      if (idLookup != null) {
        for (id in idLookup) {
          e = filterDatabase[id];
          if (e == null) {
            continue;
          }
          isMatch = true;
          if (negated) {
            isMatch = !isMatch;
          }
          if (isMatch) {
            e[property] = true;
          }
        }
      } else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvZmlsdGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBLElBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsY0FBQSxF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QURGOztJQURGLENBN0dGO0dBQUEsTUFBQTs7SUFrSEUsS0FBQSxvQkFBQTs7TUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQjtJQURGLENBbEhGOztFQXFIQSxJQUFHLFlBQUg7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNsQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLEVBRFQ7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxFQURUOztBQUVBLGFBQU87SUFUVyxDQUFwQixFQURGOztBQVdBLFNBQU87QUF0Sk07O0FBd0pmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWM7QUFEZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwicGxheWVyID0gbnVsbFxuc29ja2V0ID0gbnVsbFxucGxheWluZyA9IGZhbHNlXG5zZXJ2ZXJFcG9jaCA9IG51bGxcblxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5zb2xvSUQgPSBudWxsXG5zb2xvTGFiZWxzID0ge31cbnNvbG9VbnNodWZmbGVkID0gW11cbnNvbG9RdWV1ZSA9IFtdXG5zb2xvVmlkZW8gPSBudWxsXG5zb2xvQ291bnQgPSAwXG5zb2xvU2hvd1RpbWVvdXQgPSBudWxsXG5zb2xvRXJyb3IgPSBmYWxzZVxuc29sb01pcnJvciA9IGZhbHNlXG5cbmVuZGVkVGltZXIgPSBudWxsXG5vdmVyVGltZXJzID0gW11cblxub3Bpbmlvbk9yZGVyID0gWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zaG93VGl0bGVzID0gdHJ1ZVxuaWYgcXMoJ2hpZGV0aXRsZXMnKVxuICBzaG93VGl0bGVzID0gZmFsc2VcblxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxuICBpZiBub3QgZWxlbT9cbiAgICByZXR1cm5cblxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDBcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMVxuXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXG5cbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDFcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMFxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG5cbiMgYXV0b3BsYXkgdmlkZW9cbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XG4gIGV2ZW50LnRhcmdldC5wbGF5VmlkZW8oKVxuICBmaW5pc2hJbml0KClcblxuIyB3aGVuIHZpZGVvIGVuZHNcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XG4gIGlmIGVuZGVkVGltZXI/XG4gICAgY2xlYXJUaW1lb3V0KGVuZGVkVGltZXIpXG4gICAgZW5kZWRUaW1lciA9IG51bGxcblxuICB2aWRlb0RhdGEgPSBwbGF5ZXIuZ2V0VmlkZW9EYXRhKClcbiAgaWYgdmlkZW9EYXRhPyBhbmQgdmlkZW9EYXRhLnRpdGxlP1xuICAgIGNvbnNvbGUubG9nIFwiVGl0bGU6ICN7dmlkZW9EYXRhLnRpdGxlfVwiXG4gICAgd2luZG93LmRvY3VtZW50LnRpdGxlID0gXCIje3ZpZGVvRGF0YS50aXRsZX0gLSBbW01UVl1dXCJcblxuICBpZiBldmVudC5kYXRhID09IDBcbiAgICBjb25zb2xlLmxvZyBcIkVOREVEXCJcbiAgICBlbmRlZFRpbWVyID0gc2V0VGltZW91dCggLT5cbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxuICAgICwgMjAwMClcblxuc2hvd0luZm8gPSAocGt0KSAtPlxuICBjb25zb2xlLmxvZyBwa3RcblxuICBvdmVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3ZlclwiKVxuICBvdmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgZm9yIHQgaW4gb3ZlclRpbWVyc1xuICAgIGNsZWFyVGltZW91dCh0KVxuICBvdmVyVGltZXJzID0gW11cblxuICBpZiBzaG93VGl0bGVzXG4gICAgYXJ0aXN0ID0gcGt0LmFydGlzdFxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXG4gICAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL1xccyskLywgXCJcIilcbiAgICB0aXRsZSA9IHBrdC50aXRsZVxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxuICAgIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXG4gICAgaWYgc29sb0lEP1xuICAgICAgY29tcGFueSA9IHNvbG9MYWJlbHNbcGt0Lm5pY2tuYW1lXVxuICAgICAgaWYgbm90IGNvbXBhbnk/XG4gICAgICAgIGNvbXBhbnkgPSBwa3Qubmlja25hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwa3Qubmlja25hbWUuc2xpY2UoMSlcbiAgICAgICAgY29tcGFueSArPSBcIiBSZWNvcmRzXCJcbiAgICAgIGh0bWwgKz0gXCJcXG4je2NvbXBhbnl9XCJcbiAgICAgIGlmIHNvbG9NaXJyb3JcbiAgICAgICAgaHRtbCArPSBcIlxcbk1pcnJvciBNb2RlXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbCArPSBcIlxcblNvbG8gTW9kZVwiXG4gICAgZWxzZVxuICAgICAgaHRtbCArPSBcIlxcbiN7cGt0LmNvbXBhbnl9XCJcbiAgICAgIGZlZWxpbmdzID0gW11cbiAgICAgIGZvciBvIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiBwa3Qub3BpbmlvbnNbb10/XG4gICAgICAgICAgZmVlbGluZ3MucHVzaCBvXG4gICAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxuICAgICAgICBodG1sICs9IFwiXFxuTm8gT3BpbmlvbnNcIlxuICAgICAgZWxzZVxuICAgICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xuICAgICAgICAgIGxpc3QgPSBwa3Qub3BpbmlvbnNbZmVlbGluZ11cbiAgICAgICAgICBsaXN0LnNvcnQoKVxuICAgICAgICAgIGh0bWwgKz0gXCJcXG4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTogI3tsaXN0LmpvaW4oJywgJyl9XCJcbiAgICBvdmVyRWxlbWVudC5pbm5lckhUTUwgPSBodG1sXG5cbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxuICAgICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxuICAgICwgMzAwMFxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XG4gICAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxuICAgICwgMTUwMDBcblxucGxheSA9IChwa3QsIGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXG4gIG9wdHMgPSB7XG4gICAgdmlkZW9JZDogaWRcbiAgfVxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXG4gICAgb3B0cy5zdGFydFNlY29uZHMgPSBzdGFydFNlY29uZHNcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xuICBwbGF5ZXIubG9hZFZpZGVvQnlJZChvcHRzKVxuICBwbGF5aW5nID0gdHJ1ZVxuXG4gIHNob3dJbmZvKHBrdClcblxuc2VuZFJlYWR5ID0gLT5cbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXG4gIHVzZXIgPSBxcygndXNlcicpXG4gIHNmdyA9IGZhbHNlXG4gIGlmIHFzKCdzZncnKVxuICAgIHNmdyA9IHRydWVcbiAgc29ja2V0LmVtaXQgJ3JlYWR5JywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XG5cbnRpY2sgPSAtPlxuICBpZiBzb2xvSUQ/XG4gICAgcmV0dXJuXG5cbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBzZW5kUmVhZHkoKVxuICAgIHJldHVyblxuXG4gIHVzZXIgPSBxcygndXNlcicpXG4gIHNmdyA9IGZhbHNlXG4gIGlmIHFzKCdzZncnKVxuICAgIHNmdyA9IHRydWVcbiAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU29sbyBNb2RlIEVuZ2luZVxuXG5zb2xvRmF0YWxFcnJvciA9IChyZWFzb24pIC0+XG4gIGNvbnNvbGUubG9nIFwic29sb0ZhdGFsRXJyb3I6ICN7cmVhc29ufVwiXG4gIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogI3tyZWFzb259XCJcbiAgc29sb0Vycm9yID0gdHJ1ZVxuXG5nZXREYXRhID0gKHVybCkgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbnNvbG9UaWNrID0gLT5cbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcbiAgICByZXR1cm5cblxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxuICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xuICAgIHNvbG9QbGF5KClcbiAgICByZXR1cm5cblxuc29sb0VuZGluZyA9IC0+XG4gIHNob3dJbmZvKHNvbG9WaWRlbylcblxuc29sb0luZm9Ccm9hZGNhc3QgPSAtPlxuICBpZiBzb2NrZXQ/IGFuZCBzb2xvSUQ/IGFuZCBzb2xvVmlkZW8/IGFuZCBub3Qgc29sb01pcnJvclxuICAgIG5leHRWaWRlbyA9IG51bGxcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID4gMFxuICAgICAgbmV4dFZpZGVvID0gc29sb1F1ZXVlWzBdXG4gICAgaW5mbyA9XG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cbiAgICAgIG5leHQ6IG5leHRWaWRlb1xuICAgICAgaW5kZXg6IHNvbG9Db3VudCAtIHNvbG9RdWV1ZS5sZW5ndGhcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcblxuICAgIGNvbnNvbGUubG9nIFwiQnJvYWRjYXN0OiBcIiwgaW5mb1xuICAgIHNvY2tldC5lbWl0ICdzb2xvJyx7XG4gICAgICBpZDogc29sb0lEXG4gICAgICBjbWQ6ICdpbmZvJ1xuICAgICAgaW5mbzogaW5mb1xuICAgIH1cblxuc29sb1BsYXkgPSAocmVzdGFydCA9IGZhbHNlKSAtPlxuICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxuICAgIHJldHVyblxuXG4gIGlmIG5vdCByZXN0YXJ0IG9yIG5vdCBzb2xvVmlkZW8/XG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA9PSAwXG4gICAgICBjb25zb2xlLmxvZyBcIlJlc2h1ZmZsaW5nLi4uXCJcbiAgICAgIHNvbG9RdWV1ZSA9IFsgc29sb1Vuc2h1ZmZsZWRbMF0gXVxuICAgICAgZm9yIGksIGluZGV4IGluIHNvbG9VbnNodWZmbGVkXG4gICAgICAgIGNvbnRpbnVlIGlmIGluZGV4ID09IDBcbiAgICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpbmRleCArIDEpKVxuICAgICAgICBzb2xvUXVldWUucHVzaChzb2xvUXVldWVbal0pXG4gICAgICAgIHNvbG9RdWV1ZVtqXSA9IGlcblxuICAgIHNvbG9WaWRlbyA9IHNvbG9RdWV1ZS5zaGlmdCgpXG5cbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXG5cbiAgIyBkZWJ1Z1xuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXG4gICMgc29sb1ZpZGVvLmVuZCA9IDUwXG4gICMgc29sb1ZpZGVvLmR1cmF0aW9uID0gNDBcblxuICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXG5cbiAgc29sb0luZm9Ccm9hZGNhc3QoKVxuXG4gIHN0YXJ0VGltZSA9IHNvbG9WaWRlby5zdGFydFxuICBpZiBzdGFydFRpbWUgPCAwXG4gICAgc3RhcnRUaW1lID0gMFxuICBlbmRUaW1lID0gc29sb1ZpZGVvLmVuZFxuICBpZiBlbmRUaW1lIDwgMFxuICAgIGVuZFRpbWUgPSBzb2xvVmlkZW8uZHVyYXRpb25cbiAgc29sb0R1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxuICBpZiBzb2xvU2hvd1RpbWVvdXQ/XG4gICAgY2xlYXJUaW1lb3V0KHNvbG9TaG93VGltZW91dClcbiAgICBzb2xvU2hvd1RpbWVvdXQgPSBudWxsXG4gIGlmIHNvbG9EdXJhdGlvbiA+IDMwXG4gICAgY29uc29sZS5sb2cgXCJTaG93aW5nIGluZm8gYWdhaW4gaW4gI3tzb2xvRHVyYXRpb24gLSAxNX0gc2Vjb25kc1wiXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gc2V0VGltZW91dChzb2xvRW5kaW5nLCAoc29sb0R1cmF0aW9uIC0gMTUpICogMTAwMClcblxuc29sb1BhdXNlID0gLT5cbiAgaWYgcGxheWVyP1xuICAgIGlmIHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09IDJcbiAgICAgIHBsYXllci5wbGF5VmlkZW8oKVxuICAgIGVsc2VcbiAgICAgIHBsYXllci5wYXVzZVZpZGVvKClcblxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxuICBpZiBub3QgcGt0LmNtZD9cbiAgICByZXR1cm5cbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxuICAgIHJldHVyblxuXG4gICMgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxuXG4gIHN3aXRjaCBwa3QuY21kXG4gICAgd2hlbiAnc2tpcCdcbiAgICAgIHNvbG9QbGF5KClcbiAgICB3aGVuICdyZXN0YXJ0J1xuICAgICAgc29sb1BsYXkodHJ1ZSlcbiAgICB3aGVuICdwYXVzZSdcbiAgICAgIHNvbG9QYXVzZSgpXG4gICAgd2hlbiAnaW5mbydcbiAgICAgIGlmIHNvbG9NaXJyb3JcbiAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxuICAgICAgICBpZiBzb2xvVmlkZW8/XG4gICAgICAgICAgaWYgbm90IHBsYXllcj9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXG4gICAgICAgICAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxuXG4gIHJldHVyblxuXG5zb2xvU3RhcnR1cCA9IC0+XG4gIHNvbG9MYWJlbHMgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vbGFiZWxzXCIpXG5cbiAgaWYgcXMoJ21pcnJvcicpXG4gICAgc29sb01pcnJvciA9IHRydWVcbiAgICByZXR1cm5cblxuICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXG4gIHNvbG9VbnNodWZmbGVkID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nKVxuICBpZiBub3Qgc29sb1Vuc2h1ZmZsZWQ/XG4gICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXG4gICAgcmV0dXJuXG5cbiAgaWYgc29sb1Vuc2h1ZmZsZWQubGVuZ3RoID09IDBcbiAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXG4gICAgcmV0dXJuXG4gIHNvbG9Db3VudCA9IHNvbG9VbnNodWZmbGVkLmxlbmd0aFxuXG4gIHNldEludGVydmFsKHNvbG9UaWNrLCA1MDAwKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxud2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5ID0gLT5cbiAgaWYgeW91dHViZVJlYWR5XG4gICAgcmV0dXJuXG4gIHlvdXR1YmVSZWFkeSA9IHRydWVcblxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcblxuICBzaG93Q29udHJvbHMgPSAwXG4gIGlmIHFzKCdjb250cm9scycpXG4gICAgc2hvd0NvbnRyb2xzID0gMVxuXG4gIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XG4gICAgd2lkdGg6ICcxMDAlJ1xuICAgIGhlaWdodDogJzEwMCUnXG4gICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxuICAgIHBsYXllclZhcnM6IHsgJ2F1dG9wbGF5JzogMSwgJ2VuYWJsZWpzYXBpJzogMSwgJ2NvbnRyb2xzJzogc2hvd0NvbnRyb2xzIH1cbiAgICBldmVudHM6IHtcbiAgICAgIG9uUmVhZHk6IG9uUGxheWVyUmVhZHlcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2VcbiAgICB9XG4gIH1cblxuIyBjYWxsZWQgYnkgb25QbGF5ZXJSZWFkeVxuZmluaXNoSW5pdCA9IC0+XG4gIHNvbG9JRCA9IHFzKCdzb2xvJylcblxuICBzb2NrZXQgPSBpbygpXG5cbiAgc29ja2V0Lm9uICdjb25uZWN0JywgLT5cbiAgICBpZiBzb2xvSUQ/XG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XG4gICAgICBzb2xvSW5mb0Jyb2FkY2FzdCgpXG5cbiAgaWYgc29sb0lEP1xuICAgICMgU29sbyBtb2RlIVxuXG4gICAgc29sb1N0YXJ0dXAoKVxuXG4gICAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cbiAgICAgIGlmIHBrdC5jbWQ/XG4gICAgICAgIHNvbG9Db21tYW5kKHBrdClcbiAgZWxzZVxuICAgICMgTm9ybWFsIE1UViBtb2RlXG5cbiAgICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxuICAgICAgIyBjb25zb2xlLmxvZyBwa3RcbiAgICAgIHBsYXkocGt0LCBwa3QuaWQsIHBrdC5zdGFydCwgcGt0LmVuZClcblxuICAgIHNvY2tldC5vbiAnZW5kaW5nJywgKHBrdCkgLT5cbiAgICAgICMgY29uc29sZS5sb2cgcGt0XG4gICAgICBzaG93SW5mbyhwa3QpXG5cbiAgICBzb2NrZXQub24gJ3NlcnZlcicsIChzZXJ2ZXIpIC0+XG4gICAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXG4gICAgICAgIGNvbnNvbGUubG9nIFwiU2VydmVyIGVwb2NoIGNoYW5nZWQhIFRoZSBzZXJ2ZXIgbXVzdCBoYXZlIHJlYm9vdGVkLiBSZXF1ZXN0aW5nIGZyZXNoIHZpZGVvLi4uXCJcbiAgICAgICAgc2VuZFJlYWR5KClcbiAgICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXG5cbiAgICBzZXRJbnRlcnZhbCh0aWNrLCA1MDAwKVxuXG5zZXRUaW1lb3V0IC0+XG4gICMgc29tZWhvdyB3ZSBtaXNzZWQgdGhpcyBldmVudCwganVzdCBraWNrIGl0IG1hbnVhbGx5XG4gIGlmIG5vdCB5b3V0dWJlUmVhZHlcbiAgICBjb25zb2xlLmxvZyBcImtpY2tpbmcgWW91dHViZS4uLlwiXG4gICAgd2luZG93Lm9uWW91VHViZVBsYXllckFQSVJlYWR5KClcbiwgMzAwMFxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXG5maWx0ZXJPcGluaW9ucyA9IHt9XG5cbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxuXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cbiAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcbiAgICBzb2xvRmlsdGVycyA9IFtdXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXG4gICAgICAjIE5vIGZpbHRlcnNcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cbiAgICAgIHJldHVybiBudWxsXG5cbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxuICBpZiBzb2xvRmlsdGVycz9cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxuXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcblxuICAgICAgbmVnYXRlZCA9IGZhbHNlXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcblxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXG4gICAgICBpZExvb2t1cCA9IG51bGxcblxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXG5cbiAgICAgIGNvbW1hbmQgPSBwaWVjZXNbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgc3dpdGNoIGNvbW1hbmRcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdhZGRlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUubmlja25hbWUgPT0gc1xuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcbiAgICAgICAgd2hlbiAndGFnJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxuICAgICAgICB3aGVuICdyZWNlbnQnLCAnc2luY2UnXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIGR1cmF0aW9uSW5TZWNvbmRzID0gcGFyc2VEdXJhdGlvbihzdWJzdHJpbmcpXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIHBhcnNpbmcgZXhjZXB0aW9uOiAje3NvbWVFeGNlcHRpb259XCJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIFsje3N1YnN0cmluZ31dIC0gI3tkdXJhdGlvbkluU2Vjb25kc31cIlxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXG4gICAgICAgIHdoZW4gJ2xvdmUnLCAnbGlrZScsICdibGVoJywgJ2hhdGUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdub25lJ1xuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdmdWxsJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xuICAgICAgICAgIGlkTG9va3VwID0ge31cbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGlmIGlkTG9va3VwP1xuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcbiAgICAgICAgICBlID0gZmlsdGVyRGF0YWJhc2VbaWRdXG4gICAgICAgICAgaWYgbm90IGU/XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIGlzTWF0Y2ggPSB0cnVlXG4gICAgICAgICAgaWYgbmVnYXRlZFxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgICAgaWYgaXNNYXRjaFxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcblxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcbiAgZWxzZVxuICAgICMgUXVldWUgaXQgYWxsIHVwXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcblxuICBpZiBzb3J0QnlBcnRpc3RcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxuIl19
