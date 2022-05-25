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
var cacheOpinions, calcIdInfo, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, iso8601, now, parseDuration, setServerDatabases;

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
      if (pieces[0] === "private") {
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
  generateList: generateList,
  calcIdInfo: calcIdInfo
};


},{"iso8601-duration":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Nhc3QuY29mZmVlIiwic3JjL2NsaWVudC9wbGF5ZXIuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLGNB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QixFQURGOztBQVdBLFNBQU87QUF4Sk07O0FBMEpmLFVBQUEsR0FBYSxRQUFBLENBQUMsRUFBRCxDQUFBO0FBQ2IsTUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTtFQUFFLElBQUcsQ0FBSSxDQUFBLE9BQUEsR0FBVSxFQUFFLENBQUMsS0FBSCxDQUFTLGlCQUFULENBQVYsQ0FBUDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxvQkFBQSxDQUFBLENBQXVCLEVBQXZCLENBQUEsQ0FBWjtBQUNBLFdBQU8sS0FGVDs7RUFHQSxRQUFBLEdBQVcsT0FBTyxDQUFDLENBQUQ7RUFDbEIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxDQUFEO0FBRWQsVUFBTyxRQUFQO0FBQUEsU0FDTyxTQURQO01BRUksR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixJQUFwQixDQUFBO0FBREg7QUFEUCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWMsWUFEZDtFQUVBLFVBQUEsRUFBWTtBQUZaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJQbGF5ZXIgPSByZXF1aXJlICcuL3BsYXllcidcblxucGxheWVyID0gbnVsbFxuc29ja2V0ID0gbnVsbFxucGxheWluZyA9IGZhbHNlXG5zZXJ2ZXJFcG9jaCA9IG51bGxcblxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5zb2xvSUQgPSBudWxsXG5zb2xvTGFiZWxzID0ge31cbnNvbG9VbnNodWZmbGVkID0gW11cbnNvbG9RdWV1ZSA9IFtdXG5zb2xvVmlkZW8gPSBudWxsXG5zb2xvQ291bnQgPSAwXG5zb2xvU2hvd1RpbWVvdXQgPSBudWxsXG5zb2xvRXJyb3IgPSBmYWxzZVxuc29sb01pcnJvciA9IGZhbHNlXG5cbmVuZGVkVGltZXIgPSBudWxsXG5vdmVyVGltZXJzID0gW11cblxub3Bpbmlvbk9yZGVyID0gWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zaG93VGl0bGVzID0gdHJ1ZVxuaWYgcXMoJ2hpZGV0aXRsZXMnKVxuICBzaG93VGl0bGVzID0gZmFsc2VcblxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxuICBpZiBub3QgZWxlbT9cbiAgICByZXR1cm5cblxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDBcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMVxuXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXG5cbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDFcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMFxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG5cbnNob3dJbmZvID0gKHBrdCkgLT5cbiAgY29uc29sZS5sb2cgcGt0XG5cbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gIGZvciB0IGluIG92ZXJUaW1lcnNcbiAgICBjbGVhclRpbWVvdXQodClcbiAgb3ZlclRpbWVycyA9IFtdXG5cbiAgaWYgc2hvd1RpdGxlc1xuICAgIGFydGlzdCA9IHBrdC5hcnRpc3RcbiAgICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXlxccysvLCBcIlwiKVxuICAgIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gICAgdGl0bGUgPSBwa3QudGl0bGVcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL1xccyskLywgXCJcIilcbiAgICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxuICAgIGlmIHNvbG9JRD9cbiAgICAgIGNvbXBhbnkgPSBzb2xvTGFiZWxzW3BrdC5uaWNrbmFtZV1cbiAgICAgIGlmIG5vdCBjb21wYW55P1xuICAgICAgICBjb21wYW55ID0gcGt0Lm5pY2tuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGt0Lm5pY2tuYW1lLnNsaWNlKDEpXG4gICAgICAgIGNvbXBhbnkgKz0gXCIgUmVjb3Jkc1wiXG4gICAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXG4gICAgICBpZiBzb2xvTWlycm9yXG4gICAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXG4gICAgICBlbHNlXG4gICAgICAgIGh0bWwgKz0gXCJcXG5Tb2xvIE1vZGVcIlxuICAgIGVsc2VcbiAgICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXG4gICAgICBmZWVsaW5ncyA9IFtdXG4gICAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xuICAgICAgICAgIGZlZWxpbmdzLnB1c2ggb1xuICAgICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcbiAgICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcbiAgICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXG4gICAgICAgICAgbGlzdC5zb3J0KClcbiAgICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXG4gICAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cbiAgICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcbiAgICAsIDMwMDBcbiAgICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxuICAgICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcbiAgICAsIDE1MDAwXG5cbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxuICBvcHRzID0ge1xuICAgIHZpZGVvSWQ6IGlkXG4gIH1cbiAgcGxheWVyLnBsYXkoaWQsIHN0YXJ0U2Vjb25kcywgZW5kU2Vjb25kcylcbiAgcGxheWluZyA9IHRydWVcblxuICBzaG93SW5mbyhwa3QpXG5cbnNlbmRSZWFkeSA9IC0+XG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxuICB1c2VyID0gcXMoJ3VzZXInKVxuICBzZncgPSBmYWxzZVxuICBpZiBxcygnc2Z3JylcbiAgICBzZncgPSB0cnVlXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxuXG50aWNrID0gLT5cbiAgaWYgc29sb0lEP1xuICAgIHJldHVyblxuXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XG4gICAgc2VuZFJlYWR5KClcbiAgICByZXR1cm5cblxuICB1c2VyID0gcXMoJ3VzZXInKVxuICBzZncgPSBmYWxzZVxuICBpZiBxcygnc2Z3JylcbiAgICBzZncgPSB0cnVlXG4gIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFNvbG8gTW9kZSBFbmdpbmVcblxuc29sb0ZhdGFsRXJyb3IgPSAocmVhc29uKSAtPlxuICBjb25zb2xlLmxvZyBcInNvbG9GYXRhbEVycm9yOiAje3JlYXNvbn1cIlxuICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6ICN7cmVhc29ufVwiXG4gIHNvbG9FcnJvciA9IHRydWVcblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5zb2xvVGljayA9IC0+XG4gIGlmIG5vdCBzb2xvSUQ/IG9yIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXG4gICAgcmV0dXJuXG5cbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcbiAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cbiAgICBzb2xvUGxheSgpXG4gICAgcmV0dXJuXG5cbnNvbG9FbmRpbmcgPSAtPlxuICBzaG93SW5mbyhzb2xvVmlkZW8pXG5cbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvPyBhbmQgbm90IHNvbG9NaXJyb3JcbiAgICBuZXh0VmlkZW8gPSBudWxsXG4gICAgaWYgc29sb1F1ZXVlLmxlbmd0aCA+IDBcbiAgICAgIG5leHRWaWRlbyA9IHNvbG9RdWV1ZVswXVxuICAgIGluZm8gPVxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXG4gICAgICBuZXh0OiBuZXh0VmlkZW9cbiAgICAgIGluZGV4OiBzb2xvQ291bnQgLSBzb2xvUXVldWUubGVuZ3RoXG4gICAgICBjb3VudDogc29sb0NvdW50XG5cbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cbiAgICBzb2NrZXQuZW1pdCAnc29sbycse1xuICAgICAgaWQ6IHNvbG9JRFxuICAgICAgY21kOiAnaW5mbydcbiAgICAgIGluZm86IGluZm9cbiAgICB9XG5cbnNvbG9QbGF5ID0gKHJlc3RhcnQgPSBmYWxzZSkgLT5cbiAgaWYgc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcbiAgICByZXR1cm5cblxuICBpZiBub3QgcmVzdGFydCBvciBub3Qgc29sb1ZpZGVvP1xuICAgIGlmIHNvbG9RdWV1ZS5sZW5ndGggPT0gMFxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXG4gICAgICBzb2xvUXVldWUgPSBbIHNvbG9VbnNodWZmbGVkWzBdIF1cbiAgICAgIGZvciBpLCBpbmRleCBpbiBzb2xvVW5zaHVmZmxlZFxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXG4gICAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaW5kZXggKyAxKSlcbiAgICAgICAgc29sb1F1ZXVlLnB1c2goc29sb1F1ZXVlW2pdKVxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXG5cbiAgICBzb2xvVmlkZW8gPSBzb2xvUXVldWUuc2hpZnQoKVxuXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xuXG4gICMgZGVidWdcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXG5cbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxuXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcblxuICBzdGFydFRpbWUgPSBzb2xvVmlkZW8uc3RhcnRcbiAgaWYgc3RhcnRUaW1lIDwgMFxuICAgIHN0YXJ0VGltZSA9IDBcbiAgZW5kVGltZSA9IHNvbG9WaWRlby5lbmRcbiAgaWYgZW5kVGltZSA8IDBcbiAgICBlbmRUaW1lID0gc29sb1ZpZGVvLmR1cmF0aW9uXG4gIHNvbG9EdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcbiAgaWYgc29sb1Nob3dUaW1lb3V0P1xuICAgIGNsZWFyVGltZW91dChzb2xvU2hvd1RpbWVvdXQpXG4gICAgc29sb1Nob3dUaW1lb3V0ID0gbnVsbFxuICBpZiBzb2xvRHVyYXRpb24gPiAzMFxuICAgIGNvbnNvbGUubG9nIFwiU2hvd2luZyBpbmZvIGFnYWluIGluICN7c29sb0R1cmF0aW9uIC0gMTV9IHNlY29uZHNcIlxuICAgIHNvbG9TaG93VGltZW91dCA9IHNldFRpbWVvdXQoc29sb0VuZGluZywgKHNvbG9EdXJhdGlvbiAtIDE1KSAqIDEwMDApXG5cbnNvbG9QYXVzZSA9IC0+XG4gIGlmIHBsYXllcj9cbiAgICBwbGF5ZXIudG9nZ2xlUGF1c2UoKVxuXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XG4gIGlmIG5vdCBwa3QuY21kP1xuICAgIHJldHVyblxuICBpZiBwa3QuaWQgIT0gc29sb0lEXG4gICAgcmV0dXJuXG5cbiAgIyBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XG5cbiAgc3dpdGNoIHBrdC5jbWRcbiAgICB3aGVuICdza2lwJ1xuICAgICAgc29sb1BsYXkoKVxuICAgIHdoZW4gJ3Jlc3RhcnQnXG4gICAgICBzb2xvUGxheSh0cnVlKVxuICAgIHdoZW4gJ3BhdXNlJ1xuICAgICAgc29sb1BhdXNlKClcbiAgICB3aGVuICdpbmZvJ1xuICAgICAgaWYgc29sb01pcnJvclxuICAgICAgICBzb2xvVmlkZW8gPSBwa3QuaW5mby5jdXJyZW50XG4gICAgICAgIGlmIHNvbG9WaWRlbz9cbiAgICAgICAgICBpZiBub3QgcGxheWVyP1xuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJubyBwbGF5ZXIgeWV0XCJcbiAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXG5cbiAgcmV0dXJuXG5cbnNvbG9TdGFydHVwID0gLT5cbiAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcblxuICBpZiBxcygnbWlycm9yJylcbiAgICBzb2xvTWlycm9yID0gdHJ1ZVxuICAgIHJldHVyblxuXG4gIGZpbHRlclN0cmluZyA9IHFzKCdmaWx0ZXJzJylcbiAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cbiAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgc29sbyBkYXRhYmFzZSFcIilcbiAgICByZXR1cm5cblxuICBpZiBzb2xvVW5zaHVmZmxlZC5sZW5ndGggPT0gMFxuICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcbiAgICByZXR1cm5cbiAgc29sb0NvdW50ID0gc29sb1Vuc2h1ZmZsZWQubGVuZ3RoXG5cbiAgc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5vbmxvYWQgPSAtPlxuICBwbGF5ZXIgPSBuZXcgUGxheWVyKCcjbXR2LXBsYXllcicsIGZhbHNlKVxuICBwbGF5ZXIuZW5kZWQgPSAoZXZlbnQpIC0+XG4gICAgcGxheWluZyA9IGZhbHNlXG4gIHBsYXllci5wbGF5KCdBQjd5a09mQWdJQScpICMgTVRWIExvYWRpbmcuLi5cblxuICBzb2xvSUQgPSBxcygnc29sbycpXG5cbiAgc29ja2V0ID0gaW8oKVxuXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XG4gICAgaWYgc29sb0lEP1xuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxuICAgICAgc29sb0luZm9Ccm9hZGNhc3QoKVxuXG4gIGlmIHNvbG9JRD9cbiAgICAjIFNvbG8gbW9kZSFcblxuICAgIHNvbG9TdGFydHVwKClcblxuICAgIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XG4gICAgICBpZiBwa3QuY21kP1xuICAgICAgICBzb2xvQ29tbWFuZChwa3QpXG4gIGVsc2VcbiAgICAjIE5vcm1hbCBNVFYgbW9kZVxuXG4gICAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICAgICMgY29uc29sZS5sb2cgcGt0XG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXG5cbiAgICBzb2NrZXQub24gJ2VuZGluZycsIChwa3QpIC0+XG4gICAgICAjIGNvbnNvbGUubG9nIHBrdFxuICAgICAgc2hvd0luZm8ocGt0KVxuXG4gICAgc29ja2V0Lm9uICdzZXJ2ZXInLCAoc2VydmVyKSAtPlxuICAgICAgaWYgc2VydmVyRXBvY2g/IGFuZCAoc2VydmVyRXBvY2ggIT0gc2VydmVyLmVwb2NoKVxuICAgICAgICBjb25zb2xlLmxvZyBcIlNlcnZlciBlcG9jaCBjaGFuZ2VkISBUaGUgc2VydmVyIG11c3QgaGF2ZSByZWJvb3RlZC4gUmVxdWVzdGluZyBmcmVzaCB2aWRlby4uLlwiXG4gICAgICAgIHNlbmRSZWFkeSgpXG4gICAgICBzZXJ2ZXJFcG9jaCA9IHNlcnZlci5lcG9jaFxuXG4gICAgc2V0SW50ZXJ2YWwodGljaywgNTAwMClcbiIsImZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xuXG5jbGFzcyBQbGF5ZXJcbiAgY29uc3RydWN0b3I6IChkb21JRCwgc2hvd0NvbnRyb2xzID0gdHJ1ZSkgLT5cbiAgICBAZW5kZWQgPSBudWxsXG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZFxuICAgIGlmIG5vdCBzaG93Q29udHJvbHNcbiAgICAgIG9wdGlvbnMgPSB7IGNvbnRyb2xzOiBbXSB9XG4gICAgQHBseXIgPSBuZXcgUGx5cihkb21JRCwgb3B0aW9ucylcbiAgICBAcGx5ci5vbiAncmVhZHknLCAoZXZlbnQpID0+XG4gICAgICBAcGx5ci5wbGF5KClcbiAgICBAcGx5ci5vbiAnZW5kZWQnLCAoZXZlbnQpID0+XG4gICAgICBpZiBAZW5kZWQ/XG4gICAgICAgIEBlbmRlZCgpXG5cbiAgcGxheTogKGlkLCBzdGFydFNlY29uZHMgPSB1bmRlZmluZWQsIGVuZFNlY29uZHMgPSB1bmRlZmluZWQpIC0+XG4gICAgaWRJbmZvID0gZmlsdGVycy5jYWxjSWRJbmZvKGlkKVxuICAgIGlmIG5vdCBpZEluZm8/XG4gICAgICByZXR1cm5cblxuICAgIHN3aXRjaCBpZEluZm8ucHJvdmlkZXJcbiAgICAgIHdoZW4gJ3lvdXR1YmUnXG4gICAgICAgIHNvdXJjZSA9IHtcbiAgICAgICAgICBzcmM6IGlkSW5mby5yZWFsXG4gICAgICAgICAgcHJvdmlkZXI6ICd5b3V0dWJlJ1xuICAgICAgICB9XG4gICAgICB3aGVuICdtdHYnXG4gICAgICAgIHNvdXJjZSA9IHtcbiAgICAgICAgICBzcmM6IFwiL3ZpZGVvcy8je2lkSW5mby5yZWFsfS5tcDRcIlxuICAgICAgICAgIHR5cGU6ICd2aWRlby9tcDQnXG4gICAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZihzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID4gMCkpXG4gICAgICBAcGx5ci5tdHZTdGFydCA9IHN0YXJ0U2Vjb25kc1xuICAgIGVsc2VcbiAgICAgIEBwbHlyLm10dlN0YXJ0ID0gdW5kZWZpbmVkXG4gICAgaWYoZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID4gMCkpXG4gICAgICBAcGx5ci5tdHZFbmQgPSBlbmRTZWNvbmRzXG4gICAgZWxzZVxuICAgICAgQHBseXIubXR2RW5kID0gdW5kZWZpbmVkXG4gICAgQHBseXIuc291cmNlID1cbiAgICAgIHR5cGU6ICd2aWRlbycsXG4gICAgICB0aXRsZTogJ01UVicsXG4gICAgICBzb3VyY2VzOiBbc291cmNlXVxuXG4gIHRvZ2dsZVBhdXNlOiAtPlxuICAgIGlmIEBwbHlyLnBhdXNlZFxuICAgICAgQHBseXIucGxheSgpXG4gICAgZWxzZVxuICAgICAgQHBseXIucGF1c2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXG5maWx0ZXJPcGluaW9ucyA9IHt9XG5cbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxuXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cbiAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcbiAgICBzb2xvRmlsdGVycyA9IFtdXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXG4gICAgICAjIE5vIGZpbHRlcnNcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cbiAgICAgIHJldHVybiBudWxsXG5cbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxuICBpZiBzb2xvRmlsdGVycz9cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxuXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBuZWdhdGVkID0gZmFsc2VcbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxuXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcbiAgICAgIGlkTG9va3VwID0gbnVsbFxuXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cblxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ25vbmUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ2Z1bGwnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgaWYgaWRMb29rdXA/XG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cbiAgICAgICAgICBpZiBub3QgZT9cbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxuICAgICAgICAgIGlmIG5lZ2F0ZWRcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxuICAgICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxuXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuICBlbHNlXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuXG4gIGlmIHNvcnRCeUFydGlzdFxuICAgIHNvbG9VbnNodWZmbGVkLnNvcnQgKGEsIGIpIC0+XG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIHJldHVybiAwXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxuXG5jYWxjSWRJbmZvID0gKGlkKSAtPlxuICBpZiBub3QgbWF0Y2hlcyA9IGlkLm1hdGNoKC9eKFthLXpdKylfKFxcUyspLylcbiAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBJRDogI3tpZH1cIlxuICAgIHJldHVybiBudWxsXG4gIHByb3ZpZGVyID0gbWF0Y2hlc1sxXVxuICByZWFsID0gbWF0Y2hlc1syXVxuXG4gIHN3aXRjaCBwcm92aWRlclxuICAgIHdoZW4gJ3lvdXR1YmUnXG4gICAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tyZWFsfVwiXG4gICAgd2hlbiAnbXR2J1xuICAgICAgdXJsID0gXCIvdmlkZW9zLyN7cmVhbH0ubXA0XCJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBQcm92aWRlcjogI3twcm92aWRlcn1cIlxuICAgICAgcmV0dXJuIG51bGxcblxuICByZXR1cm4ge1xuICAgIGlkOiBpZFxuICAgIHByb3ZpZGVyOiBwcm92aWRlclxuICAgIHJlYWw6IHJlYWxcbiAgICB1cmw6IHVybFxuICB9XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2V0U2VydmVyRGF0YWJhc2VzOiBzZXRTZXJ2ZXJEYXRhYmFzZXNcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcbiAgY2FsY0lkSW5mbzogY2FsY0lkSW5mb1xuIl19
