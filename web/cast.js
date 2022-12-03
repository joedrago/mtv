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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Nhc3QuY29mZmVlIiwic3JjL2NsaWVudC9wbGF5ZXIuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVULE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsT0FBQSxHQUFVOztBQUNWLFdBQUEsR0FBYzs7QUFFZCxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0FBRVYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFVixNQUFBLEdBQVM7O0FBQ1QsVUFBQSxHQUFhLENBQUE7O0FBQ2IsY0FBQSxHQUFpQjs7QUFDakIsU0FBQSxHQUFZOztBQUNaLFNBQUEsR0FBWTs7QUFDWixTQUFBLEdBQVk7O0FBQ1osZUFBQSxHQUFrQjs7QUFDbEIsU0FBQSxHQUFZOztBQUNaLFVBQUEsR0FBYTs7QUFFYixVQUFBLEdBQWE7O0FBQ2IsVUFBQSxHQUFhOztBQUViLFlBQUEsR0FBZTtFQUFDLE1BQUQ7RUFBUyxNQUFUO0VBQWlCLEtBQWpCO0VBQXdCLE1BQXhCO0VBQWdDLE1BQWhDOzs7QUFFZixhQUFBLEdBQWdCLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFDZCxTQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxDQUFsQjtBQURPOztBQUdoQixHQUFBLEdBQU0sUUFBQSxDQUFBLENBQUE7QUFDSixTQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBeEI7QUFESDs7QUFHTixFQUFBLEdBQUssUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUNMLE1BQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtFQUFFLEdBQUEsR0FBTSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3RCLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsTUFBeEI7RUFDUCxLQUFBLEdBQVEsSUFBSSxNQUFKLENBQVcsTUFBQSxHQUFTLElBQVQsR0FBZ0IsbUJBQTNCO0VBQ1IsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWDtFQUNWLElBQUcsQ0FBSSxPQUFKLElBQWUsQ0FBSSxPQUFPLENBQUMsQ0FBRCxDQUE3QjtBQUNFLFdBQU8sS0FEVDs7QUFFQSxTQUFPLGtCQUFBLENBQW1CLE9BQU8sQ0FBQyxDQUFELENBQUcsQ0FBQyxPQUFYLENBQW1CLEtBQW5CLEVBQTBCLEdBQTFCLENBQW5CO0FBUEo7O0FBU0wsVUFBQSxHQUFhOztBQUNiLElBQUcsRUFBQSxDQUFHLFlBQUgsQ0FBSDtFQUNFLFVBQUEsR0FBYSxNQURmOzs7QUFHQSxNQUFBLEdBQVMsUUFBQSxDQUFDLElBQUQsRUFBTyxFQUFQLENBQUE7QUFDVCxNQUFBLE9BQUEsRUFBQTtFQUFFLElBQU8sWUFBUDtBQUNFLFdBREY7O0VBR0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLEdBQXFCO0VBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxHQUFvQjtFQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsR0FBcUI7RUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFYLEdBQXdCO0VBRXhCLElBQUcsWUFBQSxJQUFRLEVBQUEsR0FBSyxDQUFoQjtJQUNFLE9BQUEsR0FBVTtXQUNWLEtBQUEsR0FBUSxXQUFBLENBQVksUUFBQSxDQUFBLENBQUE7TUFDbEIsT0FBQSxJQUFXLEVBQUEsR0FBSztNQUNoQixJQUFHLE9BQUEsSUFBVyxDQUFkO1FBQ0UsYUFBQSxDQUFjLEtBQWQ7UUFDQSxPQUFBLEdBQVUsRUFGWjs7TUFJQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsR0FBcUI7YUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLGdCQUFBLEdBQW1CLE9BQUEsR0FBVSxHQUE3QixHQUFtQztJQVByQyxDQUFaLEVBUU4sRUFSTSxFQUZWO0dBQUEsTUFBQTtJQVlFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjtXQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsR0FBb0IsbUJBYnRCOztBQVRPOztBQXdCVCxPQUFBLEdBQVUsUUFBQSxDQUFDLElBQUQsRUFBTyxFQUFQLENBQUE7QUFDVixNQUFBLE9BQUEsRUFBQTtFQUFFLElBQU8sWUFBUDtBQUNFLFdBREY7O0VBR0EsSUFBRyxZQUFBLElBQVEsRUFBQSxHQUFLLENBQWhCO0lBQ0UsT0FBQSxHQUFVO1dBQ1YsS0FBQSxHQUFRLFdBQUEsQ0FBWSxRQUFBLENBQUEsQ0FBQTtNQUNsQixPQUFBLElBQVcsRUFBQSxHQUFLO01BQ2hCLElBQUcsT0FBQSxJQUFXLENBQWQ7UUFDRSxhQUFBLENBQWMsS0FBZDtRQUNBLE9BQUEsR0FBVTtRQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjtRQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0IsU0FKMUI7O01BS0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLEdBQXFCO2FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxHQUFvQixnQkFBQSxHQUFtQixPQUFBLEdBQVUsR0FBN0IsR0FBbUM7SUFSckMsQ0FBWixFQVNOLEVBVE0sRUFGVjtHQUFBLE1BQUE7SUFhRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsR0FBcUI7SUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CO0lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjtXQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0IsU0FoQjFCOztBQUpROztBQXNCVixRQUFBLEdBQVcsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNYLE1BQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLFdBQUEsRUFBQSxDQUFBLEVBQUE7RUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7RUFFQSxXQUFBLEdBQWMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEI7RUFDZCxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQWxCLEdBQTRCO0VBQzVCLEtBQUEsNENBQUE7O0lBQ0UsWUFBQSxDQUFhLENBQWI7RUFERjtFQUVBLFVBQUEsR0FBYTtFQUViLElBQUcsVUFBSDtJQUNFLE1BQUEsR0FBUyxHQUFHLENBQUM7SUFDYixNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLEVBQXVCLEVBQXZCO0lBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUF1QixFQUF2QjtJQUNULEtBQUEsR0FBUSxHQUFHLENBQUM7SUFDWixLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFkLEVBQXNCLEVBQXRCO0lBQ1IsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBZCxFQUFzQixFQUF0QjtJQUNSLElBQUEsR0FBTyxDQUFBLENBQUEsQ0FBRyxNQUFILENBQUEsVUFBQSxDQUFBLENBQXNCLEtBQXRCLENBQUEsUUFBQTtJQUNQLElBQUcsY0FBSDtNQUNFLE9BQUEsR0FBVSxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQUw7TUFDcEIsSUFBTyxlQUFQO1FBQ0UsT0FBQSxHQUFVLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBYixDQUFvQixDQUFwQixDQUFzQixDQUFDLFdBQXZCLENBQUEsQ0FBQSxHQUF1QyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQWIsQ0FBbUIsQ0FBbkI7UUFDakQsT0FBQSxJQUFXLFdBRmI7O01BR0EsSUFBQSxJQUFRLENBQUEsRUFBQSxDQUFBLENBQUssT0FBTCxDQUFBO01BQ1IsSUFBRyxVQUFIO1FBQ0UsSUFBQSxJQUFRLGdCQURWO09BQUEsTUFBQTtRQUdFLElBQUEsSUFBUSxjQUhWO09BTkY7S0FBQSxNQUFBO01BV0UsSUFBQSxJQUFRLENBQUEsRUFBQSxDQUFBLENBQUssR0FBRyxDQUFDLE9BQVQsQ0FBQTtNQUNSLFFBQUEsR0FBVztNQUNYLEtBQUEsZ0RBQUE7O1FBQ0UsSUFBRyx1QkFBSDtVQUNFLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FBZCxFQURGOztNQURGO01BR0EsSUFBRyxRQUFRLENBQUMsTUFBVCxLQUFtQixDQUF0QjtRQUNFLElBQUEsSUFBUSxnQkFEVjtPQUFBLE1BQUE7UUFHRSxLQUFBLDRDQUFBOztVQUNFLElBQUEsR0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQUQ7VUFDbkIsSUFBSSxDQUFDLElBQUwsQ0FBQTtVQUNBLElBQUEsSUFBUSxDQUFBLEVBQUEsQ0FBQSxDQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsQ0FBZixDQUFpQixDQUFDLFdBQWxCLENBQUEsQ0FBQSxHQUFrQyxPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsQ0FBdkMsQ0FBQSxFQUFBLENBQUEsQ0FBNEQsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQTVELENBQUE7UUFIVixDQUhGO09BaEJGOztJQXVCQSxXQUFXLENBQUMsU0FBWixHQUF3QjtJQUV4QixVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFBLENBQVcsUUFBQSxDQUFBLENBQUE7YUFDekIsTUFBQSxDQUFPLFdBQVAsRUFBb0IsSUFBcEI7SUFEeUIsQ0FBWCxFQUVkLElBRmMsQ0FBaEI7V0FHQSxVQUFVLENBQUMsSUFBWCxDQUFnQixVQUFBLENBQVcsUUFBQSxDQUFBLENBQUE7YUFDekIsT0FBQSxDQUFRLFdBQVIsRUFBcUIsSUFBckI7SUFEeUIsQ0FBWCxFQUVkLEtBRmMsQ0FBaEIsRUFwQ0Y7O0FBVFM7O0FBaURYLElBQUEsR0FBTyxRQUFBLENBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxlQUFlLElBQXpCLEVBQStCLGFBQWEsSUFBNUMsQ0FBQTtBQUNQLE1BQUE7RUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsU0FBQSxDQUFBLENBQVksRUFBWixDQUFBLENBQVo7RUFDQSxJQUFBLEdBQU87SUFDTCxPQUFBLEVBQVM7RUFESjtFQUdQLE1BQU0sQ0FBQyxJQUFQLENBQVksRUFBWixFQUFnQixZQUFoQixFQUE4QixVQUE5QjtFQUNBLE9BQUEsR0FBVTtTQUVWLFFBQUEsQ0FBUyxHQUFUO0FBUks7O0FBVVAsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO0FBQ1osTUFBQSxHQUFBLEVBQUE7RUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7RUFDQSxJQUFBLEdBQU8sRUFBQSxDQUFHLE1BQUg7RUFDUCxHQUFBLEdBQU07RUFDTixJQUFHLEVBQUEsQ0FBRyxLQUFILENBQUg7SUFDRSxHQUFBLEdBQU0sS0FEUjs7U0FFQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFBRSxJQUFBLEVBQU0sSUFBUjtJQUFjLEdBQUEsRUFBSztFQUFuQixDQUFyQjtBQU5VOztBQVFaLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtBQUNQLE1BQUEsR0FBQSxFQUFBO0VBQUUsSUFBRyxjQUFIO0FBQ0UsV0FERjs7RUFHQSxJQUFHLENBQUksT0FBSixJQUFnQixnQkFBbkI7SUFDRSxTQUFBLENBQUE7QUFDQSxXQUZGOztFQUlBLElBQUEsR0FBTyxFQUFBLENBQUcsTUFBSDtFQUNQLEdBQUEsR0FBTTtFQUNOLElBQUcsRUFBQSxDQUFHLEtBQUgsQ0FBSDtJQUNFLEdBQUEsR0FBTSxLQURSOztTQUVBLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixFQUF1QjtJQUFFLElBQUEsRUFBTSxJQUFSO0lBQWMsR0FBQSxFQUFLO0VBQW5CLENBQXZCO0FBWkssRUE5SlA7Ozs7QUErS0EsY0FBQSxHQUFpQixRQUFBLENBQUMsTUFBRCxDQUFBO0VBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLGdCQUFBLENBQUEsQ0FBbUIsTUFBbkIsQ0FBQSxDQUFaO0VBQ0EsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFkLEdBQTBCLENBQUEsT0FBQSxDQUFBLENBQVUsTUFBVixDQUFBO1NBQzFCLFNBQUEsR0FBWTtBQUhHOztBQUtqQixPQUFBLEdBQVUsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNSLFNBQU8sSUFBSSxPQUFKLENBQVksUUFBQSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQUE7QUFDckIsUUFBQTtJQUFJLEtBQUEsR0FBUSxJQUFJLGNBQUosQ0FBQTtJQUNSLEtBQUssQ0FBQyxrQkFBTixHQUEyQixRQUFBLENBQUEsQ0FBQTtBQUMvQixVQUFBO01BQVEsSUFBRyxDQUFDLElBQUMsQ0FBQSxVQUFELEtBQWUsQ0FBaEIsQ0FBQSxJQUF1QixDQUFDLElBQUMsQ0FBQSxNQUFELEtBQVcsR0FBWixDQUExQjtBQUVHOztVQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxZQUFqQjtpQkFDVixPQUFBLENBQVEsT0FBUixFQUZGO1NBR0EsYUFBQTtpQkFDRSxPQUFBLENBQVEsSUFBUixFQURGO1NBTEg7O0lBRHVCO0lBUTNCLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxFQUFrQixHQUFsQixFQUF1QixJQUF2QjtXQUNBLEtBQUssQ0FBQyxJQUFOLENBQUE7RUFYaUIsQ0FBWjtBQURDOztBQWNWLFFBQUEsR0FBVyxRQUFBLENBQUEsQ0FBQTtFQUNULElBQU8sZ0JBQUosSUFBZSxTQUFmLElBQTRCLFVBQS9CO0FBQ0UsV0FERjs7RUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVo7RUFDQSxJQUFHLENBQUksT0FBSixJQUFnQixnQkFBbkI7SUFDRSxRQUFBLENBQUEsRUFERjs7QUFMUzs7QUFTWCxVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7U0FDWCxRQUFBLENBQVMsU0FBVDtBQURXOztBQUdiLGlCQUFBLEdBQW9CLFFBQUEsQ0FBQSxDQUFBO0FBQ3BCLE1BQUEsSUFBQSxFQUFBO0VBQUUsSUFBRyxnQkFBQSxJQUFZLGdCQUFaLElBQXdCLG1CQUF4QixJQUF1QyxDQUFJLFVBQTlDO0lBQ0UsU0FBQSxHQUFZO0lBQ1osSUFBRyxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF0QjtNQUNFLFNBQUEsR0FBWSxTQUFTLENBQUMsQ0FBRCxFQUR2Qjs7SUFFQSxJQUFBLEdBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBVDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsS0FBQSxFQUFPLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFGN0I7TUFHQSxLQUFBLEVBQU87SUFIUDtJQUtGLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixFQUEyQixJQUEzQjtXQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFtQjtNQUNqQixFQUFBLEVBQUksTUFEYTtNQUVqQixHQUFBLEVBQUssTUFGWTtNQUdqQixJQUFBLEVBQU07SUFIVyxDQUFuQixFQVhGOztBQURrQjs7QUFrQnBCLFFBQUEsR0FBVyxRQUFBLENBQUMsVUFBVSxLQUFYLENBQUE7QUFDWCxNQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLFlBQUEsRUFBQTtFQUFFLElBQUcsU0FBQSxJQUFhLFVBQWhCO0FBQ0UsV0FERjs7RUFHQSxJQUFHLENBQUksT0FBSixJQUFtQixtQkFBdEI7SUFDRSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO01BQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWjtNQUNBLFNBQUEsR0FBWSxDQUFFLGNBQWMsQ0FBQyxDQUFELENBQWhCO01BQ1osS0FBQSxnRUFBQTs7UUFDRSxJQUFZLEtBQUEsS0FBUyxDQUFyQjtBQUFBLG1CQUFBOztRQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEtBQUEsR0FBUSxDQUFULENBQTNCO1FBQ0osU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFTLENBQUMsQ0FBRCxDQUF4QjtRQUNBLFNBQVMsQ0FBQyxDQUFELENBQVQsR0FBZTtNQUpqQixDQUhGOztJQVNBLFNBQUEsR0FBWSxTQUFTLENBQUMsS0FBVixDQUFBLEVBVmQ7O0VBWUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBZkY7Ozs7O0VBc0JFLElBQUEsQ0FBSyxTQUFMLEVBQWdCLFNBQVMsQ0FBQyxFQUExQixFQUE4QixTQUFTLENBQUMsS0FBeEMsRUFBK0MsU0FBUyxDQUFDLEdBQXpEO0VBRUEsaUJBQUEsQ0FBQTtFQUVBLFNBQUEsR0FBWSxTQUFTLENBQUM7RUFDdEIsSUFBRyxTQUFBLEdBQVksQ0FBZjtJQUNFLFNBQUEsR0FBWSxFQURkOztFQUVBLE9BQUEsR0FBVSxTQUFTLENBQUM7RUFDcEIsSUFBRyxPQUFBLEdBQVUsQ0FBYjtJQUNFLE9BQUEsR0FBVSxTQUFTLENBQUMsU0FEdEI7O0VBRUEsWUFBQSxHQUFlLE9BQUEsR0FBVTtFQUN6QixJQUFHLHVCQUFIO0lBQ0UsWUFBQSxDQUFhLGVBQWI7SUFDQSxlQUFBLEdBQWtCLEtBRnBCOztFQUdBLElBQUcsWUFBQSxHQUFlLEVBQWxCO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLHNCQUFBLENBQUEsQ0FBeUIsWUFBQSxHQUFlLEVBQXhDLENBQUEsUUFBQSxDQUFaO1dBQ0EsZUFBQSxHQUFrQixVQUFBLENBQVcsVUFBWCxFQUF1QixDQUFDLFlBQUEsR0FBZSxFQUFoQixDQUFBLEdBQXNCLElBQTdDLEVBRnBCOztBQXJDUzs7QUF5Q1gsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO0VBQ1YsSUFBRyxjQUFIO1dBQ0UsTUFBTSxDQUFDLFdBQVAsQ0FBQSxFQURGOztBQURVOztBQUlaLFdBQUEsR0FBYyxRQUFBLENBQUMsR0FBRCxDQUFBO0VBQ1osSUFBTyxlQUFQO0FBQ0UsV0FERjs7RUFFQSxJQUFHLEdBQUcsQ0FBQyxFQUFKLEtBQVUsTUFBYjtBQUNFLFdBREY7R0FGRjs7QUFPRSxVQUFPLEdBQUcsQ0FBQyxHQUFYO0FBQUEsU0FDTyxNQURQO01BRUksUUFBQSxDQUFBO0FBREc7QUFEUCxTQUdPLFNBSFA7TUFJSSxRQUFBLENBQVMsSUFBVDtBQURHO0FBSFAsU0FLTyxPQUxQO01BTUksU0FBQSxDQUFBO0FBREc7QUFMUCxTQU9PLE1BUFA7TUFRSSxJQUFHLFVBQUg7UUFDRSxTQUFBLEdBQVksR0FBRyxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFHLGlCQUFIO1VBQ0UsSUFBTyxjQUFQO1lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaLEVBREY7O1VBRUEsSUFBQSxDQUFLLFNBQUwsRUFBZ0IsU0FBUyxDQUFDLEVBQTFCLEVBQThCLFNBQVMsQ0FBQyxLQUF4QyxFQUErQyxTQUFTLENBQUMsR0FBekQsRUFIRjtTQUZGOztBQVJKO0FBUlk7O0FBeUJkLFdBQUEsR0FBYyxNQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ2QsTUFBQTtFQUFFLFVBQUEsR0FBYSxDQUFBLE1BQU0sT0FBQSxDQUFRLGNBQVIsQ0FBTjtFQUViLElBQUcsRUFBQSxDQUFHLFFBQUgsQ0FBSDtJQUNFLFVBQUEsR0FBYTtBQUNiLFdBRkY7O0VBSUEsWUFBQSxHQUFlLEVBQUEsQ0FBRyxTQUFIO0VBQ2YsY0FBQSxHQUFpQixDQUFBLE1BQU0sT0FBTyxDQUFDLFlBQVIsQ0FBcUIsWUFBckIsQ0FBTjtFQUNqQixJQUFPLHNCQUFQO0lBQ0UsY0FBQSxDQUFlLDJCQUFmO0FBQ0EsV0FGRjs7RUFJQSxJQUFHLGNBQWMsQ0FBQyxNQUFmLEtBQXlCLENBQTVCO0lBQ0UsY0FBQSxDQUFlLGtDQUFmO0FBQ0EsV0FGRjs7RUFHQSxTQUFBLEdBQVksY0FBYyxDQUFDO1NBRTNCLFdBQUEsQ0FBWSxRQUFaLEVBQXNCLElBQXRCO0FBbEJZLEVBdFNkOzs7QUE0VEEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsUUFBQSxDQUFBLENBQUE7RUFDZCxNQUFBLEdBQVMsSUFBSSxNQUFKLENBQVcsYUFBWCxFQUEwQixLQUExQjtFQUNULE1BQU0sQ0FBQyxLQUFQLEdBQWUsUUFBQSxDQUFDLEtBQUQsQ0FBQTtXQUNiLE9BQUEsR0FBVTtFQURHO0VBRWYsTUFBTSxDQUFDLElBQVAsQ0FBWSxhQUFaLEVBSEY7RUFLRSxNQUFBLEdBQVMsRUFBQSxDQUFHLE1BQUg7RUFFVCxNQUFBLEdBQVMsRUFBQSxDQUFBO0VBRVQsTUFBTSxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFFBQUEsQ0FBQSxDQUFBO0lBQ25CLElBQUcsY0FBSDtNQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtRQUFFLEVBQUEsRUFBSTtNQUFOLENBQXBCO2FBQ0EsaUJBQUEsQ0FBQSxFQUZGOztFQURtQixDQUFyQjtFQUtBLElBQUcsY0FBSDs7SUFHRSxXQUFBLENBQUE7V0FFQSxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtNQUNoQixJQUFHLGVBQUg7ZUFDRSxXQUFBLENBQVksR0FBWixFQURGOztJQURnQixDQUFsQixFQUxGO0dBQUEsTUFBQTs7SUFXRSxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQSxFQUFBOzthQUVoQixJQUFBLENBQUssR0FBTCxFQUFVLEdBQUcsQ0FBQyxFQUFkLEVBQWtCLEdBQUcsQ0FBQyxLQUF0QixFQUE2QixHQUFHLENBQUMsR0FBakM7SUFGZ0IsQ0FBbEI7SUFJQSxNQUFNLENBQUMsRUFBUCxDQUFVLFFBQVYsRUFBb0IsUUFBQSxDQUFDLEdBQUQsQ0FBQSxFQUFBOzthQUVsQixRQUFBLENBQVMsR0FBVDtJQUZrQixDQUFwQjtJQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsUUFBVixFQUFvQixRQUFBLENBQUMsTUFBRCxDQUFBO01BQ2xCLElBQUcscUJBQUEsSUFBaUIsQ0FBQyxXQUFBLEtBQWUsTUFBTSxDQUFDLEtBQXZCLENBQXBCO1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnRkFBWjtRQUNBLFNBQUEsQ0FBQSxFQUZGOzthQUdBLFdBQUEsR0FBYyxNQUFNLENBQUM7SUFKSCxDQUFwQjtXQU1BLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCLEVBekJGOztBQWZjOzs7O0FDNVRoQixJQUFBLE1BQUEsRUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0FBRUosU0FBTixNQUFBLE9BQUE7RUFDRSxXQUFhLENBQUMsS0FBRCxFQUFRLGVBQWUsSUFBdkIsQ0FBQTtBQUNmLFFBQUE7SUFBSSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsT0FBQSxHQUFVO0lBQ1YsSUFBRyxDQUFJLFlBQVA7TUFDRSxPQUFBLEdBQVU7UUFBRSxRQUFBLEVBQVU7TUFBWixFQURaOztJQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxJQUFKLENBQVMsS0FBVCxFQUFnQixPQUFoQjtJQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLE9BQVQsRUFBa0IsQ0FBQyxLQUFELENBQUEsR0FBQTthQUNoQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQTtJQURnQixDQUFsQjtJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLE9BQVQsRUFBa0IsQ0FBQyxLQUFELENBQUEsR0FBQTtNQUNoQixJQUFHLGtCQUFIO2VBQ0UsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQURGOztJQURnQixDQUFsQjtJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFNBQVQsRUFBb0IsQ0FBQyxLQUFELENBQUEsR0FBQTtNQUNsQixJQUFHLG9CQUFIO2VBQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQWYsRUFERjs7SUFEa0IsQ0FBcEI7RUFaVzs7RUFnQmIsSUFBTSxDQUFDLEVBQUQsRUFBSyxlQUFlLE1BQXBCLEVBQStCLGFBQWEsTUFBNUMsQ0FBQTtBQUNSLFFBQUEsTUFBQSxFQUFBO0lBQUksTUFBQSxHQUFTLE9BQU8sQ0FBQyxVQUFSLENBQW1CLEVBQW5CO0lBQ1QsSUFBTyxjQUFQO0FBQ0UsYUFERjs7QUFHQSxZQUFPLE1BQU0sQ0FBQyxRQUFkO0FBQUEsV0FDTyxTQURQO1FBRUksTUFBQSxHQUFTO1VBQ1AsR0FBQSxFQUFLLE1BQU0sQ0FBQyxJQURMO1VBRVAsUUFBQSxFQUFVO1FBRkg7QUFETjtBQURQLFdBTU8sS0FOUDtRQU9JLE1BQUEsR0FBUztVQUNQLEdBQUEsRUFBSyxDQUFBLFFBQUEsQ0FBQSxDQUFXLE1BQU0sQ0FBQyxJQUFsQixDQUFBLElBQUEsQ0FERTtVQUVQLElBQUEsRUFBTTtRQUZDO0FBRE47QUFOUDtBQVlJO0FBWko7SUFjQSxJQUFHLHNCQUFBLElBQWtCLENBQUMsWUFBQSxHQUFlLENBQWhCLENBQXJCO01BQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLEdBQWlCLGFBRG5CO0tBQUEsTUFBQTtNQUdFLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixPQUhuQjs7SUFJQSxJQUFHLG9CQUFBLElBQWdCLENBQUMsVUFBQSxHQUFhLENBQWQsQ0FBbkI7TUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxXQURqQjtLQUFBLE1BQUE7TUFHRSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxPQUhqQjs7V0FJQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FDRTtNQUFBLElBQUEsRUFBTSxPQUFOO01BQ0EsS0FBQSxFQUFPLEtBRFA7TUFFQSxPQUFBLEVBQVMsQ0FBQyxNQUFEO0lBRlQ7RUE1QkU7O0VBZ0NOLFdBQWEsQ0FBQSxDQUFBO0lBQ1gsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQVQ7YUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQSxFQURGO0tBQUEsTUFBQTthQUdFLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBLEVBSEY7O0VBRFc7O0FBakRmOztBQXVEQSxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ3pEakIsSUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBLGNBQUEsRUFBQSx5QkFBQSxFQUFBLGNBQUEsRUFBQSxvQkFBQSxFQUFBLFlBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLGFBQUEsRUFBQTs7QUFBQSxjQUFBLEdBQWlCOztBQUNqQixjQUFBLEdBQWlCLENBQUE7O0FBRWpCLG9CQUFBLEdBQXVCOztBQUN2Qix5QkFBQSxHQUE0Qjs7QUFDNUIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUjs7QUFFVixXQUFBLEdBQWM7O0FBRWQsR0FBQSxHQUFNLFFBQUEsQ0FBQSxDQUFBO0FBQ0osU0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLElBQXhCO0FBREg7O0FBR04sYUFBQSxHQUFnQixRQUFBLENBQUMsQ0FBRCxDQUFBO0FBQ2QsU0FBTyxPQUFPLENBQUMsU0FBUixDQUFrQixPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsQ0FBbEI7QUFETzs7QUFHaEIsa0JBQUEsR0FBcUIsUUFBQSxDQUFDLEVBQUQsRUFBSyxRQUFMLEVBQWUsbUJBQWYsQ0FBQTtFQUNuQixjQUFBLEdBQWlCO0VBQ2pCLG9CQUFBLEdBQXVCO1NBQ3ZCLHlCQUFBLEdBQTRCO0FBSFQ7O0FBS3JCLE9BQUEsR0FBVSxRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ1IsU0FBTyxJQUFJLE9BQUosQ0FBWSxRQUFBLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FBQTtBQUNyQixRQUFBO0lBQUksS0FBQSxHQUFRLElBQUksY0FBSixDQUFBO0lBQ1IsS0FBSyxDQUFDLGtCQUFOLEdBQTJCLFFBQUEsQ0FBQSxDQUFBO0FBQy9CLFVBQUE7TUFBUSxJQUFHLENBQUMsSUFBQyxDQUFBLFVBQUQsS0FBZSxDQUFoQixDQUFBLElBQXVCLENBQUMsSUFBQyxDQUFBLE1BQUQsS0FBVyxHQUFaLENBQTFCO0FBRUc7O1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFlBQWpCO2lCQUNWLE9BQUEsQ0FBUSxPQUFSLEVBRkY7U0FHQSxhQUFBO2lCQUNFLE9BQUEsQ0FBUSxJQUFSLEVBREY7U0FMSDs7SUFEdUI7SUFRM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLEVBQWtCLEdBQWxCLEVBQXVCLElBQXZCO1dBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBQTtFQVhpQixDQUFaO0FBREM7O0FBY1YsYUFBQSxHQUFnQixNQUFBLFFBQUEsQ0FBQyxVQUFELENBQUE7RUFDZCxJQUFPLGtDQUFQO0lBQ0UsY0FBYyxDQUFDLFVBQUQsQ0FBZCxHQUE2QixDQUFBLE1BQU0sT0FBQSxDQUFRLENBQUEsb0JBQUEsQ0FBQSxDQUF1QixrQkFBQSxDQUFtQixVQUFuQixDQUF2QixDQUFBLENBQVIsQ0FBTjtJQUM3QixJQUFPLGtDQUFQO2FBQ0UsY0FBQSxDQUFlLENBQUEsNkJBQUEsQ0FBQSxDQUFnQyxVQUFoQyxDQUFBLENBQWYsRUFERjtLQUZGOztBQURjOztBQU1oQixTQUFBLEdBQVksUUFBQSxDQUFBLENBQUE7QUFDVixTQUFPO0FBREc7O0FBR1osWUFBQSxHQUFlLE1BQUEsUUFBQSxDQUFDLFlBQUQsRUFBZSxlQUFlLEtBQTlCLENBQUE7QUFDZixNQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsaUJBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLGNBQUEsRUFBQSxhQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUE7RUFBRSxXQUFBLEdBQWM7RUFDZCxXQUFBLEdBQWM7RUFDZCxJQUFHLHNCQUFBLElBQWtCLENBQUMsWUFBWSxDQUFDLE1BQWIsR0FBc0IsQ0FBdkIsQ0FBckI7SUFDRSxXQUFBLEdBQWM7SUFDZCxVQUFBLEdBQWEsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsT0FBbkI7SUFDYixLQUFBLDRDQUFBOztNQUNFLE1BQUEsR0FBUyxNQUFNLENBQUMsSUFBUCxDQUFBO01BQ1QsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFuQjtRQUNFLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLEVBREY7O0lBRkY7SUFJQSxJQUFHLFdBQVcsQ0FBQyxNQUFaLEtBQXNCLENBQXpCOztNQUVFLFdBQUEsR0FBYyxLQUZoQjtLQVBGOztFQVVBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixFQUF3QixXQUF4QjtFQUNBLElBQUcsc0JBQUg7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLHdCQUFaLEVBREY7R0FBQSxNQUFBO0lBR0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWjtJQUNBLGNBQUEsR0FBaUIsQ0FBQSxNQUFNLE9BQUEsQ0FBUSxnQkFBUixDQUFOO0lBQ2pCLElBQU8sc0JBQVA7QUFDRSxhQUFPLEtBRFQ7S0FMRjs7RUFRQSxZQUFBLEdBQWUsQ0FBQTtFQUNmLGNBQUEsR0FBaUI7RUFDakIsSUFBRyxtQkFBSDtJQUNFLEtBQUEsb0JBQUE7O01BQ0UsQ0FBQyxDQUFDLE9BQUYsR0FBWTtNQUNaLENBQUMsQ0FBQyxPQUFGLEdBQVk7SUFGZDtJQUlBLFVBQUEsR0FBYTtJQUNiLEtBQUEsK0NBQUE7O01BQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYjtNQUNULElBQUcsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFhLFNBQWhCO0FBQ0UsaUJBREY7O01BRUEsSUFBRyxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWEsU0FBaEI7UUFDRSxXQUFBLEdBQWM7QUFDZCxpQkFGRjs7TUFJQSxPQUFBLEdBQVU7TUFDVixRQUFBLEdBQVc7TUFDWCxJQUFHLE1BQU0sQ0FBQyxDQUFELENBQU4sS0FBYSxNQUFoQjtRQUNFLFFBQUEsR0FBVztRQUNYLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFGRjtPQUFBLE1BR0ssSUFBRyxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWEsS0FBaEI7UUFDSCxRQUFBLEdBQVc7UUFDWCxPQUFBLEdBQVUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFIRzs7TUFJTCxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQXBCO0FBQ0UsaUJBREY7O01BRUEsSUFBRyxRQUFBLEtBQVksU0FBZjtRQUNFLFVBQUEsR0FBYSxNQURmOztNQUdBLFNBQUEsR0FBWSxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLEdBQXJCO01BQ1osUUFBQSxHQUFXO01BRVgsSUFBRyxPQUFBLEdBQVUsTUFBTSxDQUFDLENBQUQsQ0FBRyxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBYjtRQUNFLE9BQUEsR0FBVSxDQUFDO1FBQ1gsTUFBTSxDQUFDLENBQUQsQ0FBTixHQUFZLE9BQU8sQ0FBQyxDQUFELEVBRnJCOztNQUlBLE9BQUEsR0FBVSxNQUFNLENBQUMsQ0FBRCxDQUFHLENBQUMsV0FBVixDQUFBO0FBQ1YsY0FBTyxPQUFQO0FBQUEsYUFDTyxRQURQO0FBQUEsYUFDaUIsTUFEakI7VUFFSSxTQUFBLEdBQVksU0FBUyxDQUFDLFdBQVYsQ0FBQTtVQUNaLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTttQkFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUFzQixDQUFDLE9BQXZCLENBQStCLENBQS9CLENBQUEsS0FBcUMsQ0FBQztVQUFoRDtBQUZBO0FBRGpCLGFBSU8sT0FKUDtBQUFBLGFBSWdCLE1BSmhCO1VBS0ksU0FBQSxHQUFZLFNBQVMsQ0FBQyxXQUFWLENBQUE7VUFDWixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4QixDQUE5QixDQUFBLEtBQW9DLENBQUM7VUFBL0M7QUFGRDtBQUpoQixhQU9PLE9BUFA7VUFRSSxVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsQ0FBQyxDQUFDLFFBQUYsS0FBYztVQUF4QjtBQURWO0FBUFAsYUFTTyxVQVRQO1VBVUksVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO21CQUFVLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxDQUFDLElBQWQsQ0FBbUIsQ0FBQyxNQUFwQixLQUE4QjtVQUF4QztBQURWO0FBVFAsYUFXTyxLQVhQO1VBWUksU0FBQSxHQUFZLFNBQVMsQ0FBQyxXQUFWLENBQUE7VUFDWixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFELENBQU4sS0FBYTtVQUF2QjtBQUZWO0FBWFAsYUFjTyxRQWRQO0FBQUEsYUFjaUIsT0FkakI7VUFlSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsU0FBQSxDQUFBLENBQVksU0FBWixDQUFBLENBQUEsQ0FBWjtBQUNBO1lBQ0UsaUJBQUEsR0FBb0IsYUFBQSxDQUFjLFNBQWQsRUFEdEI7V0FFQSxhQUFBO1lBQU0sc0JBQ2hCOztZQUNZLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSw0QkFBQSxDQUFBLENBQStCLGFBQS9CLENBQUEsQ0FBWjtBQUNBLG1CQUFPLEtBSFQ7O1VBS0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFVBQUEsQ0FBQSxDQUFhLFNBQWIsQ0FBQSxJQUFBLENBQUEsQ0FBNkIsaUJBQTdCLENBQUEsQ0FBWjtVQUNBLEtBQUEsR0FBUSxHQUFBLENBQUEsQ0FBQSxHQUFRO1VBQ2hCLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTttQkFBVSxDQUFDLENBQUMsS0FBRixHQUFVO1VBQXBCO0FBWEE7QUFkakIsYUEwQk8sTUExQlA7QUFBQSxhQTBCZSxNQTFCZjtBQUFBLGFBMEJ1QixNQTFCdkI7QUFBQSxhQTBCK0IsTUExQi9CO1VBMkJJLGFBQUEsR0FBZ0I7VUFDaEIsVUFBQSxHQUFhO1VBQ2IsSUFBRyxvQkFBSDtZQUNFLFVBQUEsR0FBYSx5QkFBQSxDQUEwQixVQUExQjtZQUNiLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtBQUFTLGtCQUFBO3NFQUEyQixDQUFFLFVBQUYsV0FBMUIsS0FBMkM7WUFBckQsRUFGZjtXQUFBLE1BQUE7WUFJRSxNQUFNLGFBQUEsQ0FBYyxVQUFkO1lBQ04sVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO0FBQVMsa0JBQUE7c0VBQTJCLENBQUUsQ0FBQyxDQUFDLEVBQUosV0FBMUIsS0FBcUM7WUFBL0MsRUFMZjs7QUFIMkI7QUExQi9CLGFBbUNPLE1BbkNQO1VBb0NJLGFBQUEsR0FBZ0I7VUFDaEIsVUFBQSxHQUFhO1VBQ2IsSUFBRyxvQkFBSDtZQUNFLFVBQUEsR0FBYSx5QkFBQSxDQUEwQixVQUExQjtZQUNiLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtBQUFTLGtCQUFBO3NFQUEyQixDQUFFLFVBQUYsV0FBMUIsS0FBMkM7WUFBckQsRUFGZjtXQUFBLE1BQUE7WUFJRSxNQUFNLGFBQUEsQ0FBYyxVQUFkO1lBQ04sVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO0FBQVMsa0JBQUE7c0VBQTJCLENBQUUsQ0FBQyxDQUFDLEVBQUosV0FBMUIsS0FBcUM7WUFBL0MsRUFMZjs7QUFIRztBQW5DUCxhQTRDTyxNQTVDUDtVQTZDSSxTQUFBLEdBQVksU0FBUyxDQUFDLFdBQVYsQ0FBQTtVQUNaLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtBQUN2QixnQkFBQTtZQUFZLElBQUEsR0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUFBLEdBQXlCLEtBQXpCLEdBQWlDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBO21CQUN4QyxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBQSxLQUFtQixDQUFDO1VBRlQ7QUFGVjtBQTVDUCxhQWlETyxJQWpEUDtBQUFBLGFBaURhLEtBakRiO1VBa0RJLFFBQUEsR0FBVyxDQUFBO0FBQ1g7VUFBQSxLQUFBLHVDQUFBOztZQUNFLElBQUcsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFULENBQUg7QUFDRSxvQkFERjs7WUFFQSxRQUFRLENBQUMsRUFBRCxDQUFSLEdBQWU7VUFIakI7VUFJQSxVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFIO1VBQWxCO0FBTko7QUFqRGIsYUF3RE8sSUF4RFA7QUFBQSxhQXdEYSxJQXhEYjtBQUFBLGFBd0RtQixVQXhEbkI7VUF5REksUUFBQSxHQUFXLENBQUE7QUFDWDtVQUFBLEtBQUEsd0NBQUE7O1lBQ0UsSUFBRyxFQUFFLENBQUMsS0FBSCxDQUFTLElBQVQsQ0FBSDtBQUNFLG9CQURGOztZQUVBLElBQUcsQ0FBSSxFQUFFLENBQUMsS0FBSCxDQUFTLFdBQVQsQ0FBSixJQUE4QixDQUFJLEVBQUUsQ0FBQyxLQUFILENBQVMsT0FBVCxDQUFyQztjQUNFLEVBQUEsR0FBSyxDQUFBLFFBQUEsQ0FBQSxDQUFXLEVBQVgsQ0FBQSxFQURQOztZQUVBLFNBQUEsR0FBWSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQVQ7WUFDWixFQUFBLEdBQUssU0FBUyxDQUFDLEtBQVYsQ0FBQTtZQUNMLEtBQUEsR0FBUSxDQUFDO1lBQ1QsR0FBQSxHQUFNLENBQUM7WUFDUCxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO2NBQ0UsS0FBQSxHQUFRLFFBQUEsQ0FBUyxTQUFTLENBQUMsS0FBVixDQUFBLENBQVQsRUFEVjs7WUFFQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO2NBQ0UsR0FBQSxHQUFNLFFBQUEsQ0FBUyxTQUFTLENBQUMsS0FBVixDQUFBLENBQVQsRUFEUjs7WUFFQSxLQUFBLEdBQVE7WUFDUixJQUFHLE9BQUEsR0FBVSxLQUFLLENBQUMsS0FBTixDQUFZLGVBQVosQ0FBYjtjQUNFLEtBQUEsR0FBUSxPQUFPLENBQUMsQ0FBRCxFQURqQjthQUFBLE1BRUssSUFBRyxPQUFBLEdBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxXQUFaLENBQWI7Y0FDSCxLQUFBLEdBQVEsT0FBTyxDQUFDLENBQUQsRUFEWjs7WUFFTCxZQUFZLENBQUMsRUFBRCxDQUFaLEdBQ0U7Y0FBQSxFQUFBLEVBQUksRUFBSjtjQUNBLE1BQUEsRUFBUSxpQkFEUjtjQUVBLEtBQUEsRUFBTyxLQUZQO2NBR0EsSUFBQSxFQUFNLENBQUEsQ0FITjtjQUlBLFFBQUEsRUFBVSxVQUpWO2NBS0EsT0FBQSxFQUFTLFVBTFQ7Y0FNQSxLQUFBLEVBQU8sY0FOUDtjQU9BLEtBQUEsRUFBTyxLQVBQO2NBUUEsR0FBQSxFQUFLLEdBUkw7Y0FTQSxRQUFBLEVBQVU7WUFUVixFQWxCZDs7WUE4QlksSUFBRywwQkFBSDtjQUNFLGNBQWMsQ0FBQyxFQUFELENBQUksQ0FBQyxPQUFuQixHQUE2QixLQUQvQjs7QUFFQTtVQWpDRjtBQUZlO0FBeERuQjs7QUE4Rkk7QUE5Rko7TUFnR0EsSUFBRyxnQkFBSDtRQUNFLEtBQUEsY0FBQTtVQUNFLENBQUEsR0FBSSxjQUFjLENBQUMsRUFBRDtVQUNsQixJQUFPLFNBQVA7QUFDRSxxQkFERjs7VUFFQSxPQUFBLEdBQVU7VUFDVixJQUFHLE9BQUg7WUFDRSxPQUFBLEdBQVUsQ0FBQyxRQURiOztVQUVBLElBQUcsT0FBSDtZQUNFLENBQUMsQ0FBQyxRQUFELENBQUQsR0FBYyxLQURoQjs7UUFQRixDQURGO09BQUEsTUFBQTtRQVdFLEtBQUEsb0JBQUE7O1VBQ0UsT0FBQSxHQUFVLFVBQUEsQ0FBVyxDQUFYLEVBQWMsU0FBZDtVQUNWLElBQUcsT0FBSDtZQUNFLE9BQUEsR0FBVSxDQUFDLFFBRGI7O1VBRUEsSUFBRyxPQUFIO1lBQ0UsQ0FBQyxDQUFDLFFBQUQsQ0FBRCxHQUFjLEtBRGhCOztRQUpGLENBWEY7O0lBOUhGO0lBZ0pBLEtBQUEsb0JBQUE7O01BQ0UsSUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFGLElBQWEsVUFBZCxDQUFBLElBQThCLENBQUksQ0FBQyxDQUFDLE9BQXZDO1FBQ0UsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEIsRUFERjs7SUFERixDQXRKRjtHQUFBLE1BQUE7O0lBMkpFLEtBQUEsb0JBQUE7O01BQ0UsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEI7SUFERixDQTNKRjs7RUE4SkEsS0FBQSxpQkFBQTs7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFwQjtFQURGO0VBR0EsSUFBRyxZQUFBLElBQWlCLENBQUksV0FBeEI7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNsQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLEVBRFQ7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxFQURUOztBQUVBLGFBQU87SUFUVyxDQUFwQixFQURGOztBQVdBLFNBQU87QUFwTU07O0FBc01mLFVBQUEsR0FBYSxRQUFBLENBQUMsRUFBRCxDQUFBO0FBQ2IsTUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTtFQUFFLElBQUcsQ0FBSSxDQUFBLE9BQUEsR0FBVSxFQUFFLENBQUMsS0FBSCxDQUFTLGlCQUFULENBQVYsQ0FBUDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxvQkFBQSxDQUFBLENBQXVCLEVBQXZCLENBQUEsQ0FBWjtBQUNBLFdBQU8sS0FGVDs7RUFHQSxRQUFBLEdBQVcsT0FBTyxDQUFDLENBQUQ7RUFDbEIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxDQUFEO0FBRWQsVUFBTyxRQUFQO0FBQUEsU0FDTyxTQURQO01BRUksR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixJQUFwQixDQUFBO0FBREg7QUFEUCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxTQUFBLEVBQVcsU0FEWDtFQUVBLFlBQUEsRUFBYyxZQUZkO0VBR0EsVUFBQSxFQUFZO0FBSFoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBIG1vZHVsZSBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uc1xuICovXG5cbi8qKlxuICogVGhlIHBhdHRlcm4gdXNlZCBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uIChQblluTW5EVG5Ibk1uUykuXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIHRoZSB3ZWVrIGZvcm1hdCBQblcuXG4gKi9cblxuLy8gUG5Zbk1uRFRuSG5NblNcbnZhciBudW1iZXJzID0gJ1xcXFxkKyg/OltcXFxcLixdXFxcXGQrKT8nO1xudmFyIHdlZWtQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdXKSc7XG52YXIgZGF0ZVBhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1kpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnRCk/JztcbnZhciB0aW1lUGF0dGVybiA9ICdUKCcgKyBudW1iZXJzICsgJ0gpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnUyk/JztcblxudmFyIGlzbzg2MDEgPSAnUCg/OicgKyB3ZWVrUGF0dGVybiArICd8JyArIGRhdGVQYXR0ZXJuICsgJyg/OicgKyB0aW1lUGF0dGVybiArICcpPyknO1xudmFyIG9iak1hcCA9IFsnd2Vla3MnLCAneWVhcnMnLCAnbW9udGhzJywgJ2RheXMnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbi8qKlxuICogVGhlIElTTzg2MDEgcmVnZXggZm9yIG1hdGNoaW5nIC8gdGVzdGluZyBkdXJhdGlvbnNcbiAqL1xudmFyIHBhdHRlcm4gPSBleHBvcnRzLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGlzbzg2MDEpO1xuXG4vKiogUGFyc2UgUG5Zbk1uRFRuSG5NblMgZm9ybWF0IHRvIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGR1cmF0aW9uU3RyaW5nIC0gUG5Zbk1uRFRuSG5NblMgZm9ybWF0dGVkIHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fSAtIFdpdGggYSBwcm9wZXJ0eSBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBwYXR0ZXJuXG4gKi9cbnZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShkdXJhdGlvblN0cmluZykge1xuICAvLyBTbGljZSBhd2F5IGZpcnN0IGVudHJ5IGluIG1hdGNoLWFycmF5XG4gIHJldHVybiBkdXJhdGlvblN0cmluZy5tYXRjaChwYXR0ZXJuKS5zbGljZSgxKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIG5leHQsIGlkeCkge1xuICAgIHByZXZbb2JqTWFwW2lkeF1dID0gcGFyc2VGbG9hdChuZXh0KSB8fCAwO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gYW4gZW5kIERhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgRGF0ZSBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtEYXRlfSAtIFRoZSByZXN1bHRpbmcgZW5kIERhdGVcbiAqL1xudmFyIGVuZCA9IGV4cG9ydHMuZW5kID0gZnVuY3Rpb24gZW5kKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgLy8gQ3JlYXRlIHR3byBlcXVhbCB0aW1lc3RhbXBzLCBhZGQgZHVyYXRpb24gdG8gJ3RoZW4nIGFuZCByZXR1cm4gdGltZSBkaWZmZXJlbmNlXG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIHRoZW4gPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXG4gIHRoZW4uc2V0RnVsbFllYXIodGhlbi5nZXRGdWxsWWVhcigpICsgZHVyYXRpb24ueWVhcnMpO1xuICB0aGVuLnNldE1vbnRoKHRoZW4uZ2V0TW9udGgoKSArIGR1cmF0aW9uLm1vbnRocyk7XG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLmRheXMpO1xuICB0aGVuLnNldEhvdXJzKHRoZW4uZ2V0SG91cnMoKSArIGR1cmF0aW9uLmhvdXJzKTtcbiAgdGhlbi5zZXRNaW51dGVzKHRoZW4uZ2V0TWludXRlcygpICsgZHVyYXRpb24ubWludXRlcyk7XG4gIC8vIFRoZW4uc2V0U2Vjb25kcyh0aGVuLmdldFNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMpO1xuICB0aGVuLnNldE1pbGxpc2Vjb25kcyh0aGVuLmdldE1pbGxpc2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyAqIDEwMDApO1xuICAvLyBTcGVjaWFsIGNhc2Ugd2Vla3NcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24ud2Vla3MgKiA3KTtcblxuICByZXR1cm4gdGhlbjtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBzZWNvbmRzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG52YXIgdG9TZWNvbmRzID0gZXhwb3J0cy50b1NlY29uZHMgPSBmdW5jdGlvbiB0b1NlY29uZHMoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICB2YXIgdGhlbiA9IGVuZChkdXJhdGlvbiwgbm93KTtcblxuICB2YXIgc2Vjb25kcyA9ICh0aGVuLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgcmV0dXJuIHNlY29uZHM7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGVuZDogZW5kLFxuICB0b1NlY29uZHM6IHRvU2Vjb25kcyxcbiAgcGF0dGVybjogcGF0dGVybixcbiAgcGFyc2U6IHBhcnNlXG59OyIsIlBsYXllciA9IHJlcXVpcmUgJy4vcGxheWVyJ1xyXG5cclxucGxheWVyID0gbnVsbFxyXG5zb2NrZXQgPSBudWxsXHJcbnBsYXlpbmcgPSBmYWxzZVxyXG5zZXJ2ZXJFcG9jaCA9IG51bGxcclxuXHJcbmZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xyXG5cclxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXHJcblxyXG5zb2xvSUQgPSBudWxsXHJcbnNvbG9MYWJlbHMgPSB7fVxyXG5zb2xvVW5zaHVmZmxlZCA9IFtdXHJcbnNvbG9RdWV1ZSA9IFtdXHJcbnNvbG9WaWRlbyA9IG51bGxcclxuc29sb0NvdW50ID0gMFxyXG5zb2xvU2hvd1RpbWVvdXQgPSBudWxsXHJcbnNvbG9FcnJvciA9IGZhbHNlXHJcbnNvbG9NaXJyb3IgPSBmYWxzZVxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxub3ZlclRpbWVycyA9IFtdXHJcblxyXG5vcGluaW9uT3JkZXIgPSBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG5cclxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxyXG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5zaG93VGl0bGVzID0gdHJ1ZVxyXG5pZiBxcygnaGlkZXRpdGxlcycpXHJcbiAgc2hvd1RpdGxlcyA9IGZhbHNlXHJcblxyXG5mYWRlSW4gPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiXHJcbiAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAwXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgKz0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5ID49IDFcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcblxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MSlcIlxyXG5cclxuZmFkZU91dCA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDFcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSAtPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDBcclxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgcGt0XHJcblxyXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXHJcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZm9yIHQgaW4gb3ZlclRpbWVyc1xyXG4gICAgY2xlYXJUaW1lb3V0KHQpXHJcbiAgb3ZlclRpbWVycyA9IFtdXHJcblxyXG4gIGlmIHNob3dUaXRsZXNcclxuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcclxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgICAgIGlmIG5vdCBjb21wYW55P1xyXG4gICAgICAgIGNvbXBhbnkgPSBwa3Qubmlja25hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwa3Qubmlja25hbWUuc2xpY2UoMSlcclxuICAgICAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gICAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICAgIGlmIHNvbG9NaXJyb3JcclxuICAgICAgICBodG1sICs9IFwiXFxuTWlycm9yIE1vZGVcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaHRtbCArPSBcIlxcblNvbG8gTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICAgIGZlZWxpbmdzID0gW11cclxuICAgICAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgICAgZmVlbGluZ3MucHVzaCBvXHJcbiAgICAgIGlmIGZlZWxpbmdzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciBmZWVsaW5nIGluIGZlZWxpbmdzXHJcbiAgICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgICBsaXN0LnNvcnQoKVxyXG4gICAgICAgICAgaHRtbCArPSBcIlxcbiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OiAje2xpc3Quam9pbignLCAnKX1cIlxyXG4gICAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICAgIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMzAwMFxyXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcclxuICAgICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIHBsYXllci5wbGF5KGlkLCBzdGFydFNlY29uZHMsIGVuZFNlY29uZHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgc2hvd0luZm8ocGt0KVxyXG5cclxuc2VuZFJlYWR5ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcclxuICB1c2VyID0gcXMoJ3VzZXInKVxyXG4gIHNmdyA9IGZhbHNlXHJcbiAgaWYgcXMoJ3NmdycpXHJcbiAgICBzZncgPSB0cnVlXHJcbiAgc29ja2V0LmVtaXQgJ3JlYWR5JywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XHJcblxyXG50aWNrID0gLT5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgIHNlbmRSZWFkeSgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdXNlciA9IHFzKCd1c2VyJylcclxuICBzZncgPSBmYWxzZVxyXG4gIGlmIHFzKCdzZncnKVxyXG4gICAgc2Z3ID0gdHJ1ZVxyXG4gIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFNvbG8gTW9kZSBFbmdpbmVcclxuXHJcbnNvbG9GYXRhbEVycm9yID0gKHJlYXNvbikgLT5cclxuICBjb25zb2xlLmxvZyBcInNvbG9GYXRhbEVycm9yOiAje3JlYXNvbn1cIlxyXG4gIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogI3tyZWFzb259XCJcclxuICBzb2xvRXJyb3IgPSB0cnVlXHJcblxyXG5nZXREYXRhID0gKHVybCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG5zb2xvVGljayA9IC0+XHJcbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzb2xvUGxheSgpXHJcbiAgICByZXR1cm5cclxuXHJcbnNvbG9FbmRpbmcgPSAtPlxyXG4gIHNob3dJbmZvKHNvbG9WaWRlbylcclxuXHJcbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cclxuICBpZiBzb2NrZXQ/IGFuZCBzb2xvSUQ/IGFuZCBzb2xvVmlkZW8/IGFuZCBub3Qgc29sb01pcnJvclxyXG4gICAgbmV4dFZpZGVvID0gbnVsbFxyXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA+IDBcclxuICAgICAgbmV4dFZpZGVvID0gc29sb1F1ZXVlWzBdXHJcbiAgICBpbmZvID1cclxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXHJcbiAgICAgIG5leHQ6IG5leHRWaWRlb1xyXG4gICAgICBpbmRleDogc29sb0NvdW50IC0gc29sb1F1ZXVlLmxlbmd0aFxyXG4gICAgICBjb3VudDogc29sb0NvdW50XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJCcm9hZGNhc3Q6IFwiLCBpbmZvXHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycse1xyXG4gICAgICBpZDogc29sb0lEXHJcbiAgICAgIGNtZDogJ2luZm8nXHJcbiAgICAgIGluZm86IGluZm9cclxuICAgIH1cclxuXHJcbnNvbG9QbGF5ID0gKHJlc3RhcnQgPSBmYWxzZSkgLT5cclxuICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCByZXN0YXJ0IG9yIG5vdCBzb2xvVmlkZW8/XHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID09IDBcclxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXHJcbiAgICAgIHNvbG9RdWV1ZSA9IFsgc29sb1Vuc2h1ZmZsZWRbMF0gXVxyXG4gICAgICBmb3IgaSwgaW5kZXggaW4gc29sb1Vuc2h1ZmZsZWRcclxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXHJcbiAgICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpbmRleCArIDEpKVxyXG4gICAgICAgIHNvbG9RdWV1ZS5wdXNoKHNvbG9RdWV1ZVtqXSlcclxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXHJcblxyXG4gICAgc29sb1ZpZGVvID0gc29sb1F1ZXVlLnNoaWZ0KClcclxuXHJcbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXHJcblxyXG4gICMgZGVidWdcclxuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXHJcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcclxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXHJcblxyXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuXHJcbiAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBzdGFydFRpbWUgPSBzb2xvVmlkZW8uc3RhcnRcclxuICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICBzdGFydFRpbWUgPSAwXHJcbiAgZW5kVGltZSA9IHNvbG9WaWRlby5lbmRcclxuICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgZW5kVGltZSA9IHNvbG9WaWRlby5kdXJhdGlvblxyXG4gIHNvbG9EdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICBpZiBzb2xvU2hvd1RpbWVvdXQ/XHJcbiAgICBjbGVhclRpbWVvdXQoc29sb1Nob3dUaW1lb3V0KVxyXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxyXG4gIGlmIHNvbG9EdXJhdGlvbiA+IDMwXHJcbiAgICBjb25zb2xlLmxvZyBcIlNob3dpbmcgaW5mbyBhZ2FpbiBpbiAje3NvbG9EdXJhdGlvbiAtIDE1fSBzZWNvbmRzXCJcclxuICAgIHNvbG9TaG93VGltZW91dCA9IHNldFRpbWVvdXQoc29sb0VuZGluZywgKHNvbG9EdXJhdGlvbiAtIDE1KSAqIDEwMDApXHJcblxyXG5zb2xvUGF1c2UgPSAtPlxyXG4gIGlmIHBsYXllcj9cclxuICAgIHBsYXllci50b2dnbGVQYXVzZSgpXHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgbm90IHBrdC5jbWQ/XHJcbiAgICByZXR1cm5cclxuICBpZiBwa3QuaWQgIT0gc29sb0lEXHJcbiAgICByZXR1cm5cclxuXHJcbiAgIyBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XHJcblxyXG4gIHN3aXRjaCBwa3QuY21kXHJcbiAgICB3aGVuICdza2lwJ1xyXG4gICAgICBzb2xvUGxheSgpXHJcbiAgICB3aGVuICdyZXN0YXJ0J1xyXG4gICAgICBzb2xvUGxheSh0cnVlKVxyXG4gICAgd2hlbiAncGF1c2UnXHJcbiAgICAgIHNvbG9QYXVzZSgpXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxyXG4gICAgICAgIGlmIHNvbG9WaWRlbz9cclxuICAgICAgICAgIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXHJcbiAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG4gIHJldHVyblxyXG5cclxuc29sb1N0YXJ0dXAgPSAtPlxyXG4gIHNvbG9MYWJlbHMgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vbGFiZWxzXCIpXHJcblxyXG4gIGlmIHFzKCdtaXJyb3InKVxyXG4gICAgc29sb01pcnJvciA9IHRydWVcclxuICAgIHJldHVyblxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXHJcbiAgaWYgbm90IHNvbG9VbnNodWZmbGVkP1xyXG4gICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgc29sb1Vuc2h1ZmZsZWQubGVuZ3RoID09IDBcclxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcclxuICAgIHJldHVyblxyXG4gIHNvbG9Db3VudCA9IHNvbG9VbnNodWZmbGVkLmxlbmd0aFxyXG5cclxuICBzZXRJbnRlcnZhbChzb2xvVGljaywgNTAwMClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG53aW5kb3cub25sb2FkID0gLT5cclxuICBwbGF5ZXIgPSBuZXcgUGxheWVyKCcjbXR2LXBsYXllcicsIGZhbHNlKVxyXG4gIHBsYXllci5lbmRlZCA9IChldmVudCkgLT5cclxuICAgIHBsYXlpbmcgPSBmYWxzZVxyXG4gIHBsYXllci5wbGF5KCdBQjd5a09mQWdJQScpICMgTVRWIExvYWRpbmcuLi5cclxuXHJcbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8gbW9kZSFcclxuXHJcbiAgICBzb2xvU3RhcnR1cCgpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgICAgaWYgcGt0LmNtZD9cclxuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXHJcbiAgZWxzZVxyXG4gICAgIyBOb3JtYWwgTVRWIG1vZGVcclxuXHJcbiAgICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcblxyXG4gICAgc29ja2V0Lm9uICdlbmRpbmcnLCAocGt0KSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxyXG4gICAgICBzaG93SW5mbyhwa3QpXHJcblxyXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxyXG4gICAgICBpZiBzZXJ2ZXJFcG9jaD8gYW5kIChzZXJ2ZXJFcG9jaCAhPSBzZXJ2ZXIuZXBvY2gpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJTZXJ2ZXIgZXBvY2ggY2hhbmdlZCEgVGhlIHNlcnZlciBtdXN0IGhhdmUgcmVib290ZWQuIFJlcXVlc3RpbmcgZnJlc2ggdmlkZW8uLi5cIlxyXG4gICAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHNlcnZlckVwb2NoID0gc2VydmVyLmVwb2NoXHJcblxyXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcclxuIiwiZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXHJcblxyXG5jbGFzcyBQbGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogKGRvbUlELCBzaG93Q29udHJvbHMgPSB0cnVlKSAtPlxyXG4gICAgQGVuZGVkID0gbnVsbFxyXG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZFxyXG4gICAgaWYgbm90IHNob3dDb250cm9sc1xyXG4gICAgICBvcHRpb25zID0geyBjb250cm9sczogW10gfVxyXG4gICAgQHBseXIgPSBuZXcgUGx5cihkb21JRCwgb3B0aW9ucylcclxuICAgIEBwbHlyLm9uICdyZWFkeScsIChldmVudCkgPT5cclxuICAgICAgQHBseXIucGxheSgpXHJcbiAgICBAcGx5ci5vbiAnZW5kZWQnLCAoZXZlbnQpID0+XHJcbiAgICAgIGlmIEBlbmRlZD9cclxuICAgICAgICBAZW5kZWQoKVxyXG5cclxuICAgIEBwbHlyLm9uICdwbGF5aW5nJywgKGV2ZW50KSA9PlxyXG4gICAgICBpZiBAb25UaXRsZT9cclxuICAgICAgICBAb25UaXRsZShAcGx5ci5tdHZUaXRsZSlcclxuXHJcbiAgcGxheTogKGlkLCBzdGFydFNlY29uZHMgPSB1bmRlZmluZWQsIGVuZFNlY29uZHMgPSB1bmRlZmluZWQpIC0+XHJcbiAgICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oaWQpXHJcbiAgICBpZiBub3QgaWRJbmZvP1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBzd2l0Y2ggaWRJbmZvLnByb3ZpZGVyXHJcbiAgICAgIHdoZW4gJ3lvdXR1YmUnXHJcbiAgICAgICAgc291cmNlID0ge1xyXG4gICAgICAgICAgc3JjOiBpZEluZm8ucmVhbFxyXG4gICAgICAgICAgcHJvdmlkZXI6ICd5b3V0dWJlJ1xyXG4gICAgICAgIH1cclxuICAgICAgd2hlbiAnbXR2J1xyXG4gICAgICAgIHNvdXJjZSA9IHtcclxuICAgICAgICAgIHNyYzogXCIvdmlkZW9zLyN7aWRJbmZvLnJlYWx9Lm1wNFwiXHJcbiAgICAgICAgICB0eXBlOiAndmlkZW8vbXA0J1xyXG4gICAgICAgIH1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgIGlmKHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPiAwKSlcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSBzdGFydFNlY29uZHNcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSB1bmRlZmluZWRcclxuICAgIGlmKGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+IDApKVxyXG4gICAgICBAcGx5ci5tdHZFbmQgPSBlbmRTZWNvbmRzXHJcbiAgICBlbHNlXHJcbiAgICAgIEBwbHlyLm10dkVuZCA9IHVuZGVmaW5lZFxyXG4gICAgQHBseXIuc291cmNlID1cclxuICAgICAgdHlwZTogJ3ZpZGVvJyxcclxuICAgICAgdGl0bGU6ICdNVFYnLFxyXG4gICAgICBzb3VyY2VzOiBbc291cmNlXVxyXG5cclxuICB0b2dnbGVQYXVzZTogLT5cclxuICAgIGlmIEBwbHlyLnBhdXNlZFxyXG4gICAgICBAcGx5ci5wbGF5KClcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIucGF1c2UoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXHJcbmZpbHRlck9waW5pb25zID0ge31cclxuXHJcbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxyXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxyXG5pc284NjAxID0gcmVxdWlyZSAnaXNvODYwMS1kdXJhdGlvbidcclxuXHJcbmxhc3RPcmRlcmVkID0gZmFsc2VcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XHJcbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXHJcblxyXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxyXG4gIGZpbHRlckRhdGFiYXNlID0gZGJcclxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXHJcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cclxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxyXG4gICAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxyXG5cclxuaXNPcmRlcmVkID0gLT5cclxuICByZXR1cm4gbGFzdE9yZGVyZWRcclxuXHJcbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxyXG4gIGxhc3RPcmRlcmVkID0gZmFsc2VcclxuICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxyXG4gIGVsc2VcclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxyXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcclxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgc29sb1VubGlzdGVkID0ge31cclxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXHJcbiAgaWYgc29sb0ZpbHRlcnM/XHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcclxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcclxuXHJcbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxyXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xyXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcclxuICAgICAgaWYgcGllY2VzWzBdID09IFwicHJpdmF0ZVwiXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcGllY2VzWzBdID09IFwib3JkZXJlZFwiXHJcbiAgICAgICAgbGFzdE9yZGVyZWQgPSB0cnVlXHJcbiAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxyXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXHJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxyXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxyXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXHJcbiAgICAgIGlmIHBpZWNlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXHJcbiAgICAgICAgYWxsQWxsb3dlZCA9IGZhbHNlXHJcblxyXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcclxuICAgICAgaWRMb29rdXAgPSBudWxsXHJcblxyXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXHJcblxyXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdLnRvTG93ZXJDYXNlKClcclxuICAgICAgc3dpdGNoIGNvbW1hbmRcclxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLm5pY2tuYW1lID09IHNcclxuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxyXG4gICAgICAgIHdoZW4gJ3RhZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXHJcbiAgICAgICAgd2hlbiAncmVjZW50JywgJ3NpbmNlJ1xyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICBkdXJhdGlvbkluU2Vjb25kcyA9IHBhcnNlRHVyYXRpb24oc3Vic3RyaW5nKVxyXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxyXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcclxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBwYXJzaW5nIGV4Y2VwdGlvbjogI3tzb21lRXhjZXB0aW9ufVwiXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBbI3tzdWJzdHJpbmd9XSAtICN7ZHVyYXRpb25JblNlY29uZHN9XCJcclxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcclxuICAgICAgICB3aGVuICdsb3ZlJywgJ2xpa2UnLCAnYmxlaCcsICdoYXRlJ1xyXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnbm9uZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnZnVsbCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XHJcbiAgICAgICAgICAgIGZ1bGwgPSBlLmFydGlzdC50b0xvd2VyQ2FzZSgpICsgXCIgLSBcIiArIGUudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXHJcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XHJcbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXHJcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIHdoZW4gJ3VuJywgJ3VsJywgJ3VubGlzdGVkJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGlmIG5vdCBpZC5tYXRjaCgvXnlvdXR1YmVfLykgYW5kIG5vdCBpZC5tYXRjaCgvXm10dl8vKVxyXG4gICAgICAgICAgICAgIGlkID0gXCJ5b3V0dWJlXyN7aWR9XCJcclxuICAgICAgICAgICAgcGlwZVNwbGl0ID0gaWQuc3BsaXQoL1xcfC8pXHJcbiAgICAgICAgICAgIGlkID0gcGlwZVNwbGl0LnNoaWZ0KClcclxuICAgICAgICAgICAgc3RhcnQgPSAtMVxyXG4gICAgICAgICAgICBlbmQgPSAtMVxyXG4gICAgICAgICAgICBpZiBwaXBlU3BsaXQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXHJcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXHJcbiAgICAgICAgICAgIHRpdGxlID0gaWRcclxuICAgICAgICAgICAgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eeW91dHViZV8oLispLylcclxuICAgICAgICAgICAgICB0aXRsZSA9IG1hdGNoZXNbMV1cclxuICAgICAgICAgICAgZWxzZSBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL15tdHZfKC4rKS8pXHJcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXHJcbiAgICAgICAgICAgIHNvbG9Vbmxpc3RlZFtpZF0gPVxyXG4gICAgICAgICAgICAgIGlkOiBpZFxyXG4gICAgICAgICAgICAgIGFydGlzdDogJ1VubGlzdGVkIFZpZGVvcydcclxuICAgICAgICAgICAgICB0aXRsZTogdGl0bGVcclxuICAgICAgICAgICAgICB0YWdzOiB7fVxyXG4gICAgICAgICAgICAgIG5pY2tuYW1lOiAnVW5saXN0ZWQnXHJcbiAgICAgICAgICAgICAgY29tcGFueTogJ1VubGlzdGVkJ1xyXG4gICAgICAgICAgICAgIHRodW1iOiAndW5saXN0ZWQucG5nJ1xyXG4gICAgICAgICAgICAgIHN0YXJ0OiBzdGFydFxyXG4gICAgICAgICAgICAgIGVuZDogZW5kXHJcbiAgICAgICAgICAgICAgdW5saXN0ZWQ6IHRydWVcclxuXHJcbiAgICAgICAgICAgICMgZm9yY2Utc2tpcCBhbnkgcHJlLWV4aXN0aW5nIERCIHZlcnNpb25zIG9mIHRoaXMgSURcclxuICAgICAgICAgICAgaWYgZmlsdGVyRGF0YWJhc2VbaWRdP1xyXG4gICAgICAgICAgICAgIGZpbHRlckRhdGFiYXNlW2lkXS5za2lwcGVkID0gdHJ1ZVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGlmIGlkTG9va3VwP1xyXG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxyXG4gICAgICAgICAgZSA9IGZpbHRlckRhdGFiYXNlW2lkXVxyXG4gICAgICAgICAgaWYgbm90IGU/XHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICBpc01hdGNoID0gdHJ1ZVxyXG4gICAgICAgICAgaWYgbmVnYXRlZFxyXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgZm9yIGssIHVubGlzdGVkIG9mIHNvbG9Vbmxpc3RlZFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQucHVzaCB1bmxpc3RlZFxyXG5cclxuICBpZiBzb3J0QnlBcnRpc3QgYW5kIG5vdCBsYXN0T3JkZXJlZFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcclxuXHJcbmNhbGNJZEluZm8gPSAoaWQpIC0+XHJcbiAgaWYgbm90IG1hdGNoZXMgPSBpZC5tYXRjaCgvXihbYS16XSspXyhcXFMrKS8pXHJcbiAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBJRDogI3tpZH1cIlxyXG4gICAgcmV0dXJuIG51bGxcclxuICBwcm92aWRlciA9IG1hdGNoZXNbMV1cclxuICByZWFsID0gbWF0Y2hlc1syXVxyXG5cclxuICBzd2l0Y2ggcHJvdmlkZXJcclxuICAgIHdoZW4gJ3lvdXR1YmUnXHJcbiAgICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je3JlYWx9XCJcclxuICAgIHdoZW4gJ210didcclxuICAgICAgdXJsID0gXCIvdmlkZW9zLyN7cmVhbH0ubXA0XCJcclxuICAgIGVsc2VcclxuICAgICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgUHJvdmlkZXI6ICN7cHJvdmlkZXJ9XCJcclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGlkOiBpZFxyXG4gICAgcHJvdmlkZXI6IHByb3ZpZGVyXHJcbiAgICByZWFsOiByZWFsXHJcbiAgICB1cmw6IHVybFxyXG4gIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xyXG4gIGlzT3JkZXJlZDogaXNPcmRlcmVkXHJcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcclxuICBjYWxjSWRJbmZvOiBjYWxjSWRJbmZvXHJcbiJdfQ==
