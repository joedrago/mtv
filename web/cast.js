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

var defaultDuration = Object.freeze({
  years: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

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
  duration = Object.assign({}, defaultDuration, duration);

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
  duration = Object.assign({}, defaultDuration, duration);

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
var Player, endedTimer, fadeIn, fadeOut, filters, getData, iso8601, now, opinionOrder, overTimers, parseDuration, play, player, playing, qs, sendReady, serverEpoch, showInfo, showTitles, socket, soloCommand, soloCount, soloEnding, soloError, soloFatalError, soloID, soloInfoBroadcast, soloLabels, soloMirror, soloPause, soloPlay, soloQueue, soloShowTimeout, soloStartup, soloTick, soloUnshuffled, soloVideo, tick;

Player = require('./player');

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
  player.play(id, startSeconds, endSeconds);
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
    return player.togglePause();
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
window.onload = function() {
  player = new Player('#mtv-player', false);
  player.ended = function(event) {
    return playing = false;
  };
  player.play('AB7ykOfAgIA'); // MTV Loading...
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


},{"../filters":4,"./player":3,"iso8601-duration":1}],3:[function(require,module,exports){
var Player, filters;

filters = require('../filters');

Player = class Player {
  constructor(domID, showControls = true) {
    var options;
    this.ended = null;
    options = void 0;
    if (!showControls) {
      options = {
        controls: []
      };
    }
    this.plyr = new Plyr(domID, options);
    this.plyr.on('ready', (event) => {
      return this.plyr.play();
    });
    this.plyr.on('ended', (event) => {
      if (this.ended != null) {
        return this.ended();
      }
    });
    this.plyr.on('playing', (event) => {
      if (this.onTitle != null) {
        return this.onTitle(this.plyr.mtvTitle);
      }
    });
  }

  play(id, startSeconds = void 0, endSeconds = void 0) {
    var idInfo, source;
    idInfo = filters.calcIdInfo(id);
    if (idInfo == null) {
      return;
    }
    switch (idInfo.provider) {
      case 'youtube':
        source = {
          src: idInfo.real,
          provider: 'youtube'
        };
        break;
      case 'mtv':
        source = {
          src: `/videos/${idInfo.real}.mp4`,
          type: 'video/mp4'
        };
        break;
      default:
        return;
    }
    if ((startSeconds != null) && (startSeconds > 0)) {
      this.plyr.mtvStart = startSeconds;
    } else {
      this.plyr.mtvStart = void 0;
    }
    if ((endSeconds != null) && (endSeconds > 0)) {
      this.plyr.mtvEnd = endSeconds;
    } else {
      this.plyr.mtvEnd = void 0;
    }
    return this.plyr.source = {
      type: 'video',
      title: 'MTV',
      sources: [source]
    };
  }

  togglePause() {
    if (this.plyr.paused) {
      return this.plyr.play();
    } else {
      return this.plyr.pause();
    }
  }

};

module.exports = Player;


},{"../filters":4}],4:[function(require,module,exports){
var cacheOpinions, calcIdInfo, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, isOrdered, iso8601, lastOrdered, now, parseDuration, setServerDatabases;

filterDatabase = null;

filterOpinions = {};

filterServerOpinions = null;

filterGetUserFromNickname = null;

iso8601 = require('iso8601-duration');

lastOrdered = false;

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

isOrdered = function() {
  return lastOrdered;
};

generateList = async function(filterString, sortByArtist = false) {
  var allAllowed, command, durationInSeconds, e, end, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, l, len, len1, len2, len3, m, matches, negated, pieces, pipeSplit, property, rawFilters, ref, ref1, since, soloFilters, soloUnlisted, soloUnshuffled, someException, start, substring, title, unlisted;
  lastOrdered = false;
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
  soloUnlisted = {};
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
      if (pieces[0] === "private") {
        continue;
      }
      if (pieces[0] === "ordered") {
        lastOrdered = true;
        continue;
      }
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
          for (l = 0, len2 = ref.length; l < len2; l++) {
            id = ref[l];
            if (id.match(/^#/)) {
              break;
            }
            idLookup[id] = true;
          }
          filterFunc = function(e, s) {
            return idLookup[e.id];
          };
          break;
        case 'un':
        case 'ul':
        case 'unlisted':
          idLookup = {};
          ref1 = pieces.slice(1);
          for (m = 0, len3 = ref1.length; m < len3; m++) {
            id = ref1[m];
            if (id.match(/^#/)) {
              break;
            }
            if (!id.match(/^youtube_/) && !id.match(/^mtv_/)) {
              id = `youtube_${id}`;
            }
            pipeSplit = id.split(/\|/);
            id = pipeSplit.shift();
            start = -1;
            end = -1;
            if (pipeSplit.length > 0) {
              start = parseInt(pipeSplit.shift());
            }
            if (pipeSplit.length > 0) {
              end = parseInt(pipeSplit.shift());
            }
            title = id;
            if (matches = title.match(/^youtube_(.+)/)) {
              title = matches[1];
            } else if (matches = title.match(/^mtv_(.+)/)) {
              title = matches[1];
            }
            soloUnlisted[id] = {
              id: id,
              artist: 'Unlisted Videos',
              title: title,
              tags: {},
              nickname: 'Unlisted',
              company: 'Unlisted',
              thumb: 'unlisted.png',
              start: start,
              end: end,
              unlisted: true
            };
            // force-skip any pre-existing DB versions of this ID
            if (filterDatabase[id] != null) {
              filterDatabase[id].skipped = true;
            }
            continue;
          }
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
  for (k in soloUnlisted) {
    unlisted = soloUnlisted[k];
    soloUnshuffled.push(unlisted);
  }
  if (sortByArtist && !lastOrdered) {
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

calcIdInfo = function(id) {
  var matches, provider, real, url;
  if (!(matches = id.match(/^([a-z]+)_(\S+)/))) {
    console.log(`calcIdInfo: Bad ID: ${id}`);
    return null;
  }
  provider = matches[1];
  real = matches[2];
  switch (provider) {
    case 'youtube':
      url = `https://youtu.be/${real}`;
      break;
    case 'mtv':
      url = `/videos/${real}.mp4`;
      break;
    default:
      console.log(`calcIdInfo: Bad Provider: ${provider}`);
      return null;
  }
  return {
    id: id,
    provider: provider,
    real: real,
    url: url
  };
};

module.exports = {
  setServerDatabases: setServerDatabases,
  isOrdered: isOrdered,
  generateList: generateList,
  calcIdInfo: calcIdInfo
};


},{"iso8601-duration":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Nhc3QuY29mZmVlIiwic3JjL2NsaWVudC9wbGF5ZXIuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0EsSUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEVBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLFFB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Q0FBQSxPQUFBLEdBQVUsRUFBRSxDQUFDLEtBQUgsQ0FBUyxpQkFBVCxDQUFWLENBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsb0JBQUEsQ0FBQSxDQUF1QixFQUF2QixDQUFBLENBQVo7QUFDQSxXQUFPLEtBRlQ7O0VBR0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxDQUFEO0VBQ2xCLElBQUEsR0FBTyxPQUFPLENBQUMsQ0FBRDtBQUVkLFVBQU8sUUFBUDtBQUFBLFNBQ08sU0FEUDtNQUVJLEdBQUEsR0FBTSxDQUFBLGlCQUFBLENBQUEsQ0FBb0IsSUFBcEIsQ0FBQTtBQURIO0FBRFAsU0FHTyxLQUhQO01BSUksR0FBQSxHQUFNLENBQUEsUUFBQSxDQUFBLENBQVcsSUFBWCxDQUFBLElBQUE7QUFESDtBQUhQO01BTUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLDBCQUFBLENBQUEsQ0FBNkIsUUFBN0IsQ0FBQSxDQUFaO0FBQ0EsYUFBTztBQVBYO0FBU0EsU0FBTztJQUNMLEVBQUEsRUFBSSxFQURDO0lBRUwsUUFBQSxFQUFVLFFBRkw7SUFHTCxJQUFBLEVBQU0sSUFIRDtJQUlMLEdBQUEsRUFBSztFQUpBO0FBaEJJOztBQXVCYixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsa0JBQUEsRUFBb0Isa0JBQXBCO0VBQ0EsU0FBQSxFQUFXLFNBRFg7RUFFQSxZQUFBLEVBQWMsWUFGZDtFQUdBLFVBQUEsRUFBWTtBQUhaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG52YXIgZGVmYXVsdER1cmF0aW9uID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHllYXJzOiAwLFxuICBtb250aHM6IDAsXG4gIHdlZWtzOiAwLFxuICBkYXlzOiAwLFxuICBob3VyczogMCxcbiAgbWludXRlczogMCxcbiAgc2Vjb25kczogMFxufSk7XG5cbi8qKlxuICogVGhlIElTTzg2MDEgcmVnZXggZm9yIG1hdGNoaW5nIC8gdGVzdGluZyBkdXJhdGlvbnNcbiAqL1xudmFyIHBhdHRlcm4gPSBleHBvcnRzLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGlzbzg2MDEpO1xuXG4vKiogUGFyc2UgUG5Zbk1uRFRuSG5NblMgZm9ybWF0IHRvIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGR1cmF0aW9uU3RyaW5nIC0gUG5Zbk1uRFRuSG5NblMgZm9ybWF0dGVkIHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fSAtIFdpdGggYSBwcm9wZXJ0eSBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBwYXR0ZXJuXG4gKi9cbnZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShkdXJhdGlvblN0cmluZykge1xuICAvLyBTbGljZSBhd2F5IGZpcnN0IGVudHJ5IGluIG1hdGNoLWFycmF5XG4gIHJldHVybiBkdXJhdGlvblN0cmluZy5tYXRjaChwYXR0ZXJuKS5zbGljZSgxKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIG5leHQsIGlkeCkge1xuICAgIHByZXZbb2JqTWFwW2lkeF1dID0gcGFyc2VGbG9hdChuZXh0KSB8fCAwO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gYW4gZW5kIERhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgRGF0ZSBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtEYXRlfSAtIFRoZSByZXN1bHRpbmcgZW5kIERhdGVcbiAqL1xudmFyIGVuZCA9IGV4cG9ydHMuZW5kID0gZnVuY3Rpb24gZW5kKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgZHVyYXRpb24gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0RHVyYXRpb24sIGR1cmF0aW9uKTtcblxuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIGR1cmF0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdER1cmF0aW9uLCBkdXJhdGlvbik7XG5cbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJQbGF5ZXIgPSByZXF1aXJlICcuL3BsYXllcidcblxucGxheWVyID0gbnVsbFxuc29ja2V0ID0gbnVsbFxucGxheWluZyA9IGZhbHNlXG5zZXJ2ZXJFcG9jaCA9IG51bGxcblxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5zb2xvSUQgPSBudWxsXG5zb2xvTGFiZWxzID0ge31cbnNvbG9VbnNodWZmbGVkID0gW11cbnNvbG9RdWV1ZSA9IFtdXG5zb2xvVmlkZW8gPSBudWxsXG5zb2xvQ291bnQgPSAwXG5zb2xvU2hvd1RpbWVvdXQgPSBudWxsXG5zb2xvRXJyb3IgPSBmYWxzZVxuc29sb01pcnJvciA9IGZhbHNlXG5cbmVuZGVkVGltZXIgPSBudWxsXG5vdmVyVGltZXJzID0gW11cblxub3Bpbmlvbk9yZGVyID0gWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zaG93VGl0bGVzID0gdHJ1ZVxuaWYgcXMoJ2hpZGV0aXRsZXMnKVxuICBzaG93VGl0bGVzID0gZmFsc2VcblxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxuICBpZiBub3QgZWxlbT9cbiAgICByZXR1cm5cblxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDBcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMVxuXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXG5cbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDFcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMFxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG5cbnNob3dJbmZvID0gKHBrdCkgLT5cbiAgY29uc29sZS5sb2cgcGt0XG5cbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gIGZvciB0IGluIG92ZXJUaW1lcnNcbiAgICBjbGVhclRpbWVvdXQodClcbiAgb3ZlclRpbWVycyA9IFtdXG5cbiAgaWYgc2hvd1RpdGxlc1xuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXlxccysvLCBcIlwiKVxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL1xccyskLywgXCJcIilcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxuICAgIGlmIHNvbG9JRD9cbiAgICAgIGNvbXBhbnkgPSBzb2xvTGFiZWxzW3BrdC5uaWNrbmFtZV1cbiAgICAgIGlmIG5vdCBjb21wYW55P1xuICAgICAgICBjb21wYW55ID0gcGt0Lm5pY2tuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGt0Lm5pY2tuYW1lLnNsaWNlKDEpXG4gICAgICAgIGNvbXBhbnkgKz0gXCIgUmVjb3Jkc1wiXG4gICAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXG4gICAgICBpZiBzb2xvTWlycm9yXG4gICAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXG4gICAgICBlbHNlXG4gICAgICAgIGh0bWwgKz0gXCJcXG5Tb2xvIE1vZGVcIlxuICAgIGVsc2VcbiAgICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXG4gICAgICBmZWVsaW5ncyA9IFtdXG4gICAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xuICAgICAgICAgIGZlZWxpbmdzLnB1c2ggb1xuICAgICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcbiAgICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcbiAgICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXG4gICAgICAgICAgbGlzdC5zb3J0KClcbiAgICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXG4gICAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cbiAgICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcbiAgICAsIDMwMDBcbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxuICAgICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcbiAgICAsIDE1MDAwXG5cbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxuICBvcHRzID0ge1xuICAgIHZpZGVvSWQ6IGlkXG4gIH1cbiAgcGxheWVyLnBsYXkoaWQsIHN0YXJ0U2Vjb25kcywgZW5kU2Vjb25kcylcbiAgcGxheWluZyA9IHRydWVcblxuICBzaG93SW5mbyhwa3QpXG5cbnNlbmRSZWFkeSA9IC0+XG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxuICB1c2VyID0gcXMoJ3VzZXInKVxuICBzZncgPSBmYWxzZVxuICBpZiBxcygnc2Z3JylcbiAgICBzZncgPSB0cnVlXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxuXG50aWNrID0gLT5cbiAgaWYgc29sb0lEP1xuICAgIHJldHVyblxuXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XG4gICAgc2VuZFJlYWR5KClcbiAgICByZXR1cm5cblxuICB1c2VyID0gcXMoJ3VzZXInKVxuICBzZncgPSBmYWxzZVxuICBpZiBxcygnc2Z3JylcbiAgICBzZncgPSB0cnVlXG4gIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNvbG8gTW9kZSBFbmdpbmVcblxuc29sb0ZhdGFsRXJyb3IgPSAocmVhc29uKSAtPlxuICBjb25zb2xlLmxvZyBcInNvbG9GYXRhbEVycm9yOiAje3JlYXNvbn1cIlxuICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6ICN7cmVhc29ufVwiXG4gIHNvbG9FcnJvciA9IHRydWVcblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5zb2xvVGljayA9IC0+XG4gIGlmIG5vdCBzb2xvSUQ/IG9yIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXG4gICAgcmV0dXJuXG5cbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBzb2xvUGxheSgpXG4gICAgcmV0dXJuXG5cbnNvbG9FbmRpbmcgPSAtPlxuICBzaG93SW5mbyhzb2xvVmlkZW8pXG5cbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvPyBhbmQgbm90IHNvbG9NaXJyb3JcbiAgICBuZXh0VmlkZW8gPSBudWxsXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA+IDBcbiAgICAgIG5leHRWaWRlbyA9IHNvbG9RdWV1ZVswXVxuICAgIGluZm8gPVxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXG4gICAgICBuZXh0OiBuZXh0VmlkZW9cbiAgICAgIGluZGV4OiBzb2xvQ291bnQgLSBzb2xvUXVldWUubGVuZ3RoXG4gICAgICBjb3VudDogc29sb0NvdW50XG5cbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cbiAgICBzb2NrZXQuZW1pdCAnc29sbycse1xuICAgICAgaWQ6IHNvbG9JRFxuICAgICAgY21kOiAnaW5mbydcbiAgICAgIGluZm86IGluZm9cbiAgICB9XG5cbnNvbG9QbGF5ID0gKHJlc3RhcnQgPSBmYWxzZSkgLT5cbiAgaWYgc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcbiAgICByZXR1cm5cblxuICBpZiBub3QgcmVzdGFydCBvciBub3Qgc29sb1ZpZGVvP1xuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPT0gMFxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXG4gICAgICBzb2xvUXVldWUgPSBbIHNvbG9VbnNodWZmbGVkWzBdIF1cbiAgICAgIGZvciBpLCBpbmRleCBpbiBzb2xvVW5zaHVmZmxlZFxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXG4gICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaW5kZXggKyAxKSlcbiAgICAgICAgc29sb1F1ZXVlLnB1c2goc29sb1F1ZXVlW2pdKVxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXG5cbiAgICBzb2xvVmlkZW8gPSBzb2xvUXVldWUuc2hpZnQoKVxuXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xuXG4gICMgZGVidWdcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXG5cbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxuXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcblxuICBzdGFydFRpbWUgPSBzb2xvVmlkZW8uc3RhcnRcbiAgaWYgc3RhcnRUaW1lIDwgMFxuICAgIHN0YXJ0VGltZSA9IDBcbiAgZW5kVGltZSA9IHNvbG9WaWRlby5lbmRcbiAgaWYgZW5kVGltZSA8IDBcbiAgICBlbmRUaW1lID0gc29sb1ZpZGVvLmR1cmF0aW9uXG4gIHNvbG9EdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcbiAgaWYgc29sb1Nob3dUaW1lb3V0P1xuICAgIGNsZWFyVGltZW91dChzb2xvU2hvd1RpbWVvdXQpXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxuICBpZiBzb2xvRHVyYXRpb24gPiAzMFxuICAgIGNvbnNvbGUubG9nIFwiU2hvd2luZyBpbmZvIGFnYWluIGluICN7c29sb0R1cmF0aW9uIC0gMTV9IHNlY29uZHNcIlxuICAgIHNvbG9TaG93VGltZW91dCA9IHNldFRpbWVvdXQoc29sb0VuZGluZywgKHNvbG9EdXJhdGlvbiAtIDE1KSAqIDEwMDApXG5cbnNvbG9QYXVzZSA9IC0+XG4gIGlmIHBsYXllcj9cbiAgICBwbGF5ZXIudG9nZ2xlUGF1c2UoKVxuXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XG4gIGlmIG5vdCBwa3QuY21kP1xuICAgIHJldHVyblxuICBpZiBwa3QuaWQgIT0gc29sb0lEXG4gICAgcmV0dXJuXG5cbiAgIyBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XG5cbiAgc3dpdGNoIHBrdC5jbWRcbiAgICB3aGVuICdza2lwJ1xuICAgICAgc29sb1BsYXkoKVxuICAgIHdoZW4gJ3Jlc3RhcnQnXG4gICAgICBzb2xvUGxheSh0cnVlKVxuICAgIHdoZW4gJ3BhdXNlJ1xuICAgICAgc29sb1BhdXNlKClcbiAgICB3aGVuICdpbmZvJ1xuICAgICAgaWYgc29sb01pcnJvclxuICAgICAgICBzb2xvVmlkZW8gPSBwa3QuaW5mby5jdXJyZW50XG4gICAgICAgIGlmIHNvbG9WaWRlbz9cbiAgICAgICAgICBpZiBub3QgcGxheWVyP1xuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJubyBwbGF5ZXIgeWV0XCJcbiAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXG5cbiAgcmV0dXJuXG5cbnNvbG9TdGFydHVwID0gLT5cbiAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcblxuICBpZiBxcygnbWlycm9yJylcbiAgICBzb2xvTWlycm9yID0gdHJ1ZVxuICAgIHJldHVyblxuXG4gIGZpbHRlclN0cmluZyA9IHFzKCdmaWx0ZXJzJylcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cbiAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgc29sbyBkYXRhYmFzZSFcIilcbiAgICByZXR1cm5cblxuICBpZiBzb2xvVW5zaHVmZmxlZC5sZW5ndGggPT0gMFxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcbiAgICByZXR1cm5cbiAgc29sb0NvdW50ID0gc29sb1Vuc2h1ZmZsZWQubGVuZ3RoXG5cbiAgc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5vbmxvYWQgPSAtPlxuICBwbGF5ZXIgPSBuZXcgUGxheWVyKCcjbXR2LXBsYXllcicsIGZhbHNlKVxuICBwbGF5ZXIuZW5kZWQgPSAoZXZlbnQpIC0+XG4gICAgcGxheWluZyA9IGZhbHNlXG4gIHBsYXllci5wbGF5KCdBQjd5a09mQWdJQScpICMgTVRWIExvYWRpbmcuLi5cblxuICBzb2xvSUQgPSBxcygnc29sbycpXG5cbiAgc29ja2V0ID0gaW8oKVxuXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XG4gICAgaWYgc29sb0lEP1xuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxuXG4gIGlmIHNvbG9JRD9cbiAgICAjIFNvbG8gbW9kZSFcblxuICAgIHNvbG9TdGFydHVwKClcblxuICAgIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XG4gICAgICBpZiBwa3QuY21kP1xuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXG4gIGVsc2VcbiAgICAjIE5vcm1hbCBNVFYgbW9kZVxuXG4gICAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICAgICMgY29uc29sZS5sb2cgcGt0XG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXG5cbiAgICBzb2NrZXQub24gJ2VuZGluZycsIChwa3QpIC0+XG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxuICAgICAgc2hvd0luZm8ocGt0KVxuXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxuICAgICAgaWYgc2VydmVyRXBvY2g/IGFuZCAoc2VydmVyRXBvY2ggIT0gc2VydmVyLmVwb2NoKVxuICAgICAgICBjb25zb2xlLmxvZyBcIlNlcnZlciBlcG9jaCBjaGFuZ2VkISBUaGUgc2VydmVyIG11c3QgaGF2ZSByZWJvb3RlZC4gUmVxdWVzdGluZyBmcmVzaCB2aWRlby4uLlwiXG4gICAgICAgIHNlbmRSZWFkeSgpXG4gICAgICBzZXJ2ZXJFcG9jaCA9IHNlcnZlci5lcG9jaFxuXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcbiIsImZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xuXG5jbGFzcyBQbGF5ZXJcbiAgY29uc3RydWN0b3I6IChkb21JRCwgc2hvd0NvbnRyb2xzID0gdHJ1ZSkgLT5cbiAgICBAZW5kZWQgPSBudWxsXG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZFxuICAgIGlmIG5vdCBzaG93Q29udHJvbHNcbiAgICAgIG9wdGlvbnMgPSB7IGNvbnRyb2xzOiBbXSB9XG4gICAgQHBseXIgPSBuZXcgUGx5cihkb21JRCwgb3B0aW9ucylcbiAgICBAcGx5ci5vbiAncmVhZHknLCAoZXZlbnQpID0+XG4gICAgICBAcGx5ci5wbGF5KClcbiAgICBAcGx5ci5vbiAnZW5kZWQnLCAoZXZlbnQpID0+XG4gICAgICBpZiBAZW5kZWQ/XG4gICAgICAgIEBlbmRlZCgpXG5cbiAgICBAcGx5ci5vbiAncGxheWluZycsIChldmVudCkgPT5cbiAgICAgIGlmIEBvblRpdGxlP1xuICAgICAgICBAb25UaXRsZShAcGx5ci5tdHZUaXRsZSlcblxuICBwbGF5OiAoaWQsIHN0YXJ0U2Vjb25kcyA9IHVuZGVmaW5lZCwgZW5kU2Vjb25kcyA9IHVuZGVmaW5lZCkgLT5cbiAgICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oaWQpXG4gICAgaWYgbm90IGlkSW5mbz9cbiAgICAgIHJldHVyblxuXG4gICAgc3dpdGNoIGlkSW5mby5wcm92aWRlclxuICAgICAgd2hlbiAneW91dHViZSdcbiAgICAgICAgc291cmNlID0ge1xuICAgICAgICAgIHNyYzogaWRJbmZvLnJlYWxcbiAgICAgICAgICBwcm92aWRlcjogJ3lvdXR1YmUnXG4gICAgICAgIH1cbiAgICAgIHdoZW4gJ210didcbiAgICAgICAgc291cmNlID0ge1xuICAgICAgICAgIHNyYzogXCIvdmlkZW9zLyN7aWRJbmZvLnJlYWx9Lm1wNFwiXG4gICAgICAgICAgdHlwZTogJ3ZpZGVvL21wNCdcbiAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm5cblxuICAgIGlmKHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPiAwKSlcbiAgICAgIEBwbHlyLm10dlN0YXJ0ID0gc3RhcnRTZWNvbmRzXG4gICAgZWxzZVxuICAgICAgQHBseXIubXR2U3RhcnQgPSB1bmRlZmluZWRcbiAgICBpZihlbmRTZWNvbmRzPyBhbmQgKGVuZFNlY29uZHMgPiAwKSlcbiAgICAgIEBwbHlyLm10dkVuZCA9IGVuZFNlY29uZHNcbiAgICBlbHNlXG4gICAgICBAcGx5ci5tdHZFbmQgPSB1bmRlZmluZWRcbiAgICBAcGx5ci5zb3VyY2UgPVxuICAgICAgdHlwZTogJ3ZpZGVvJyxcbiAgICAgIHRpdGxlOiAnTVRWJyxcbiAgICAgIHNvdXJjZXM6IFtzb3VyY2VdXG5cbiAgdG9nZ2xlUGF1c2U6IC0+XG4gICAgaWYgQHBseXIucGF1c2VkXG4gICAgICBAcGx5ci5wbGF5KClcbiAgICBlbHNlXG4gICAgICBAcGx5ci5wYXVzZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcbmZpbHRlck9waW5pb25zID0ge31cblxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbmxhc3RPcmRlcmVkID0gZmFsc2Vcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnBhcnNlRHVyYXRpb24gPSAocykgLT5cbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXG5cbnNldFNlcnZlckRhdGFiYXNlcyA9IChkYiwgb3BpbmlvbnMsIGdldFVzZXJGcm9tTmlja25hbWUpIC0+XG4gIGZpbHRlckRhdGFiYXNlID0gZGJcbiAgZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBvcGluaW9uc1xuICBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gZ2V0VXNlckZyb21OaWNrbmFtZVxuXG5nZXREYXRhID0gKHVybCkgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cbiAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXG4gICAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHVzZXIgb3BpbmlvbnMgZm9yICN7ZmlsdGVyVXNlcn1cIilcblxuaXNPcmRlcmVkID0gLT5cbiAgcmV0dXJuIGxhc3RPcmRlcmVkXG5cbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxuICBsYXN0T3JkZXJlZCA9IGZhbHNlXG4gIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXG4gICAgc29sb0ZpbHRlcnMgPSBbXVxuICAgIHJhd0ZpbHRlcnMgPSBmaWx0ZXJTdHJpbmcuc3BsaXQoL1xccj9cXG4vKVxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xuICAgICAgZmlsdGVyID0gZmlsdGVyLnRyaW0oKVxuICAgICAgaWYgZmlsdGVyLmxlbmd0aCA+IDBcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcbiAgICBpZiBzb2xvRmlsdGVycy5sZW5ndGggPT0gMFxuICAgICAgIyBObyBmaWx0ZXJzXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcbiAgY29uc29sZS5sb2cgXCJGaWx0ZXJzOlwiLCBzb2xvRmlsdGVyc1xuICBpZiBmaWx0ZXJEYXRhYmFzZT9cbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxuICBlbHNlXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZyBkYXRhYmFzZS4uLlwiXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcbiAgICBpZiBub3QgZmlsdGVyRGF0YWJhc2U/XG4gICAgICByZXR1cm4gbnVsbFxuXG4gIHNvbG9Vbmxpc3RlZCA9IHt9XG4gIHNvbG9VbnNodWZmbGVkID0gW11cbiAgaWYgc29sb0ZpbHRlcnM/XG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBlLmFsbG93ZWQgPSBmYWxzZVxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcblxuICAgIGFsbEFsbG93ZWQgPSB0cnVlXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC8gKy8pXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJwcml2YXRlXCJcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcIm9yZGVyZWRcIlxuICAgICAgICBsYXN0T3JkZXJlZCA9IHRydWVcbiAgICAgICAgY29udGludWVcblxuICAgICAgbmVnYXRlZCA9IGZhbHNlXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcblxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXG4gICAgICBpZExvb2t1cCA9IG51bGxcblxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXG5cbiAgICAgIGNvbW1hbmQgPSBwaWVjZXNbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgc3dpdGNoIGNvbW1hbmRcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdhZGRlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUubmlja25hbWUgPT0gc1xuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcbiAgICAgICAgd2hlbiAndGFnJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxuICAgICAgICB3aGVuICdyZWNlbnQnLCAnc2luY2UnXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIGR1cmF0aW9uSW5TZWNvbmRzID0gcGFyc2VEdXJhdGlvbihzdWJzdHJpbmcpXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIHBhcnNpbmcgZXhjZXB0aW9uOiAje3NvbWVFeGNlcHRpb259XCJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIFsje3N1YnN0cmluZ31dIC0gI3tkdXJhdGlvbkluU2Vjb25kc31cIlxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXG4gICAgICAgIHdoZW4gJ2xvdmUnLCAnbGlrZScsICdibGVoJywgJ2hhdGUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdub25lJ1xuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdmdWxsJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xuICAgICAgICAgIGlkTG9va3VwID0ge31cbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cbiAgICAgICAgd2hlbiAndW4nLCAndWwnLCAndW5saXN0ZWQnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiBub3QgaWQubWF0Y2goL155b3V0dWJlXy8pIGFuZCBub3QgaWQubWF0Y2goL15tdHZfLylcbiAgICAgICAgICAgICAgaWQgPSBcInlvdXR1YmVfI3tpZH1cIlxuICAgICAgICAgICAgcGlwZVNwbGl0ID0gaWQuc3BsaXQoL1xcfC8pXG4gICAgICAgICAgICBpZCA9IHBpcGVTcGxpdC5zaGlmdCgpXG4gICAgICAgICAgICBzdGFydCA9IC0xXG4gICAgICAgICAgICBlbmQgPSAtMVxuICAgICAgICAgICAgaWYgcGlwZVNwbGl0Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChwaXBlU3BsaXQuc2hpZnQoKSlcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgIGVuZCA9IHBhcnNlSW50KHBpcGVTcGxpdC5zaGlmdCgpKVxuICAgICAgICAgICAgdGl0bGUgPSBpZFxuICAgICAgICAgICAgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eeW91dHViZV8oLispLylcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgICBlbHNlIGlmIG1hdGNoZXMgPSB0aXRsZS5tYXRjaCgvXm10dl8oLispLylcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgICBzb2xvVW5saXN0ZWRbaWRdID1cbiAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICAgIGFydGlzdDogJ1VubGlzdGVkIFZpZGVvcydcbiAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlXG4gICAgICAgICAgICAgIHRhZ3M6IHt9XG4gICAgICAgICAgICAgIG5pY2tuYW1lOiAnVW5saXN0ZWQnXG4gICAgICAgICAgICAgIGNvbXBhbnk6ICdVbmxpc3RlZCdcbiAgICAgICAgICAgICAgdGh1bWI6ICd1bmxpc3RlZC5wbmcnXG4gICAgICAgICAgICAgIHN0YXJ0OiBzdGFydFxuICAgICAgICAgICAgICBlbmQ6IGVuZFxuICAgICAgICAgICAgICB1bmxpc3RlZDogdHJ1ZVxuXG4gICAgICAgICAgICAjIGZvcmNlLXNraXAgYW55IHByZS1leGlzdGluZyBEQiB2ZXJzaW9ucyBvZiB0aGlzIElEXG4gICAgICAgICAgICBpZiBmaWx0ZXJEYXRhYmFzZVtpZF0/XG4gICAgICAgICAgICAgIGZpbHRlckRhdGFiYXNlW2lkXS5za2lwcGVkID0gdHJ1ZVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGlmIGlkTG9va3VwP1xuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcbiAgICAgICAgICBlID0gZmlsdGVyRGF0YWJhc2VbaWRdXG4gICAgICAgICAgaWYgbm90IGU/XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIGlzTWF0Y2ggPSB0cnVlXG4gICAgICAgICAgaWYgbmVnYXRlZFxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgICAgaWYgaXNNYXRjaFxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcblxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcbiAgZWxzZVxuICAgICMgUXVldWUgaXQgYWxsIHVwXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcblxuICBmb3IgaywgdW5saXN0ZWQgb2Ygc29sb1VubGlzdGVkXG4gICAgc29sb1Vuc2h1ZmZsZWQucHVzaCB1bmxpc3RlZFxuXG4gIGlmIHNvcnRCeUFydGlzdCBhbmQgbm90IGxhc3RPcmRlcmVkXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgcmV0dXJuIHNvbG9VbnNodWZmbGVkXG5cbmNhbGNJZEluZm8gPSAoaWQpIC0+XG4gIGlmIG5vdCBtYXRjaGVzID0gaWQubWF0Y2goL14oW2Etel0rKV8oXFxTKykvKVxuICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIElEOiAje2lkfVwiXG4gICAgcmV0dXJuIG51bGxcbiAgcHJvdmlkZXIgPSBtYXRjaGVzWzFdXG4gIHJlYWwgPSBtYXRjaGVzWzJdXG5cbiAgc3dpdGNoIHByb3ZpZGVyXG4gICAgd2hlbiAneW91dHViZSdcbiAgICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je3JlYWx9XCJcbiAgICB3aGVuICdtdHYnXG4gICAgICB1cmwgPSBcIi92aWRlb3MvI3tyZWFsfS5tcDRcIlxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIFByb3ZpZGVyOiAje3Byb3ZpZGVyfVwiXG4gICAgICByZXR1cm4gbnVsbFxuXG4gIHJldHVybiB7XG4gICAgaWQ6IGlkXG4gICAgcHJvdmlkZXI6IHByb3ZpZGVyXG4gICAgcmVhbDogcmVhbFxuICAgIHVybDogdXJsXG4gIH1cblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xuICBpc09yZGVyZWQ6IGlzT3JkZXJlZFxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxuICBjYWxjSWRJbmZvOiBjYWxjSWRJbmZvXG4iXX0=
