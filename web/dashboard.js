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
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, cacheEnabled, castAvailable, castSession, constants, convertPlaylistData, convertPlaylistMode, discordNickname, discordTag, discordToken, downloadCache, enableSearch, filters, i, init, lastClicked, lastPlayed, lastTag, lastUser, len, logout, now, o, onError, onInitSuccess, opinionButtonOrder, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, rawMode, rawModeTag, receiveIdentity, ref, renderEntries, searchChanged, searchEnabled, searchSubstring, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, showBoth, showConvertedPlaylist, showList, showLists, showPlaying, showPlaylist, showQueue, showRecent, showStats, showTag, showUser, showWatchForm, showWatchLink, socket, startCast, updateOpinion, updateOther;

constants = require('../constants');

filters = require('../filters');

socket = null;

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast';

lastClicked = null;

lastUser = null;

lastTag = null;

discordTag = null;

discordNickname = null;

discordToken = null;

lastPlayed = null;

searchEnabled = false;

searchSubstring = "";

downloadCache = {};

cacheEnabled = {
  "/info/playlist": true
};

castAvailable = false;

castSession = null;

rawMode = false;

rawModeTag = "";

convertPlaylistMode = null;

convertPlaylistData = null;

opinionOrder = constants.opinionOrder;

opinionButtonOrder = [];

ref = constants.opinionOrder;
for (i = 0, len = ref.length; i < len; i++) {
  o = ref[i];
  opinionButtonOrder.push(o);
}

opinionButtonOrder.push('none');

now = function() {
  return Math.floor(Date.now() / 1000);
};

pageEpoch = now();

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

secondsToTime = function(t) {
  var j, len1, str, u, unit, units;
  units = [
    {
      suffix: "h",
      factor: 3600,
      skip: true
    },
    {
      suffix: "m",
      factor: 60,
      skip: false
    },
    {
      suffix: "s",
      factor: 1,
      skip: false
    }
  ];
  str = "";
  for (j = 0, len1 = units.length; j < len1; j++) {
    unit = units[j];
    u = Math.floor(t / unit.factor);
    if ((u > 0) || !unit.skip) {
      t -= u * unit.factor;
      if (str.length > 0) {
        str += ":";
        if (u < 10) {
          str += "0";
        }
      }
      str += String(u);
    }
  }
  return str;
};

prettyDuration = function(e) {
  var endTime, startTime;
  startTime = e.start;
  if (startTime < 0) {
    startTime = 0;
  }
  endTime = e.end;
  if (endTime < 0) {
    endTime = e.duration;
  }
  return `${secondsToTime(startTime)}-${secondsToTime(endTime)}`;
};

SORT_NONE = 0;

SORT_ARTIST_TITLE = 1;

SORT_ADDED = 2;

renderEntries = function(firstTitle, restTitle, entries, isMap, sortMethod = SORT_NONE, tagFilter = null) {
  var actions, artist, count, e, entryIndex, extraInfo, feeling, html, idInfo, j, k, len1, lowercaseSearch, m, params, ref1, tag, tagString, tags, title, url, v;
  html = "";
  if (isMap) {
    // console.log entries
    m = entries;
    entries = [];
    for (k in m) {
      v = m[k];
      entries.push(v);
    }
  }
  switch (sortMethod) {
    case SORT_ARTIST_TITLE:
      entries.sort(function(a, b) {
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
      break;
    case SORT_ADDED:
      entries.sort(function(a, b) {
        if (a.added > b.added) {
          return -1;
        }
        if (a.added < b.added) {
          return 1;
        }
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
  if ((firstTitle == null) && (restTitle == null) && (tagFilter != null)) {
    html += `<div class="restTitle">Tag: ${tagFilter}</div>`;
  }
  lowercaseSearch = searchSubstring.toLowerCase();
  for (entryIndex = j = 0, len1 = entries.length; j < len1; entryIndex = ++j) {
    e = entries[entryIndex];
    if ((tagFilter != null) && (e.tags[tagFilter] == null)) {
      continue;
    }
    artist = e.artist;
    if (artist == null) {
      artist = "Unknown";
    }
    title = e.title;
    if (title == null) {
      title = e.id;
    }
    if (searchEnabled && (lowercaseSearch.length > 0)) {
      if ((artist.toLowerCase().indexOf(lowercaseSearch) === -1) && (title.toLowerCase().indexOf(lowercaseSearch) === -1)) {
        continue;
      }
    }
    params = "";
    if (e.start >= 0) {
      params += params.length === 0 ? "?" : "&";
      params += `start=${e.start}`;
    }
    if (e.end >= 0) {
      params += params.length === 0 ? "?" : "&";
      params += `end=${e.end}`;
    }
    idInfo = filters.calcIdInfo(e.id);
    if (idInfo == null) {
      continue;
    }
    url = idInfo.url + params;
    extraInfo = "";
    tags = [];
    for (tag in e.tags) {
      extraInfo += `, ${tag}`;
      tags.push(tag);
    }
    if (tags.length > 0) {
      tagString = " - <span class=\"rawtags\">" + tags.join("</span>, <span class=\"rawtags\">") + "</span>";
    } else {
      tagString = "";
    }
    if ((e.start !== -1) || (e.end !== -1)) {
      extraInfo += `, ${prettyDuration(e)}`;
    }
    if (e.opinions != null) {
      ref1 = e.opinions;
      for (feeling in ref1) {
        count = ref1[feeling];
        extraInfo += `, ${count} ${feeling}${count === 1 ? "" : "s"}`;
      }
    }
    if (firstTitle != null) {
      if (entryIndex === 0) {
        html += `<div class="firstTitle">${firstTitle}</div>
<div class="previewContainer"><img class="preview" src="${e.thumb}"></div>`;
      } else if (entryIndex === 1) {
        html += `<div class="restTitle">${restTitle}</div>`;
      }
    }
    if (discordTag) {
      actions = ""; // " [ Do stuff as #{discordTag} ]"
    } else {
      actions = "";
    }
    switch (rawMode) {
      case "edit":
        html += `<div><span class=\"selectall\">#mtv edit ${e.id} COMMANDHERE</span> # <a target="_blank" href="${url}"><span class="entryartist">${artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="${url}"><span class="entrytitle">${title}</span></a>${tagString}</div>`;
        break;
      case "solo":
        html += `<div>id ${e.id} # <a target="_blank" href="${url}">${artist} - ${title}</a></div>`;
        break;
      case "tag":
        html += `<div><span class=\"selectall\">#mtv edit ${e.id} tag ${rawModeTag}</span> | <a target="_blank" href="${url}"><span class="entryartist">${artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="${url}"><span class="entrytitle">${title}</span></a>${tagString}</div>`;
        break;
      default:
        html += `<div> * <a target="_blank" href="${url}"><span class="entryartist">${artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="${url}"><span class="entrytitle">${title}</span></a> <span class="user">(${e.nickname}${extraInfo})</span>${actions}</div>
`;
    }
  }
  return html;
};

showList = function(firstTitle, restTitle, url, isMap = false, sortMethod = SORT_NONE, tagFilter = null) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    if (downloadCache[url] != null) {
      console.log(`Using cache: ${url}`);
      resolve(renderEntries(firstTitle, restTitle, downloadCache[url], isMap, sortMethod, tagFilter));
      return;
    }
    console.log(`Downloading: ${url}`);
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          if (cacheEnabled[url]) {
            downloadCache[url] = entries;
          }
          return resolve(renderEntries(firstTitle, restTitle, entries, isMap, sortMethod, tagFilter));
        } catch (error) {
          return resolve("Error");
        }
      }
    };
    xhttp.open("GET", url, true);
    return xhttp.send();
  });
};

updateOther = function() {
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var j, len1, name, nameString, other, ref1, remainingCount;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        other = JSON.parse(xhttp.responseText);
        console.log(other);
        nameString = "";
        if ((other.names != null) && (other.names.length > 0)) {
          nameString = "";
          ref1 = other.names;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            name = ref1[j];
            if (nameString.length > 0) {
              nameString += ", ";
            }
            nameString += name;
          }
          remainingCount = other.playing - other.names.length;
          if (remainingCount > 0) {
            nameString += ` + ${remainingCount} anon`;
          }
          nameString = `: ${nameString}`;
        }
        document.getElementById("playing").innerHTML = `${other.playing} Watching${nameString}`;
        lastPlayed = other.current;
        if (discordToken != null) {
          return socket.emit('opinion', {
            token: discordToken,
            id: lastPlayed.id
          });
        }
      } catch (error) {

      }
    }
  };
  // nothing?
  xhttp.open("GET", "/info/other", true);
  return xhttp.send();
};

showPlaying = async function() {
  enableSearch(false);
  document.getElementById('main').innerHTML = (await showList("Now Playing:", "History:", "/info/history"));
  updateOther();
  return lastClicked = showPlaying;
};

showQueue = async function() {
  enableSearch(false);
  document.getElementById('main').innerHTML = (await showList("Up Next:", "Queue:", "/info/queue"));
  updateOther();
  return lastClicked = showQueue;
};

showBoth = async function() {
  var leftSide, rightSide;
  enableSearch(false);
  leftSide = (await showList("Now Playing:", "History:", "/info/history"));
  rightSide = (await showList("Up Next:", "Queue:", "/info/queue"));
  document.getElementById('main').innerHTML = `<div id="mainl">${leftSide}</div>
<div id="mainr">${rightSide}</div>`;
  updateOther();
  return lastClicked = showBoth;
};

enableSearch = function(enabled) {
  searchEnabled = enabled;
  if (enabled) {
    document.getElementById('search').style.display = 'block';
    return searchSubstring = document.getElementById('searchinput').value;
  } else {
    document.getElementById('search').style.display = 'none';
    return searchSubstring = "";
  }
};

searchChanged = async function() {
  if (!searchEnabled) {
    return;
  }
  if (downloadCache["/info/playlist"] == null) {
    return;
  }
  searchSubstring = document.getElementById('searchinput').value;
  return document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE));
};

showPlaylist = async function() {
  enableSearch(true);
  downloadCache["/info/playlist"] = null; // don't cache if they click on All
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE));
  updateOther();
  return lastClicked = showPlaylist;
};

showRecent = async function() {
  enableSearch(false);
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ADDED));
  updateOther();
  return lastClicked = showRecent;
};

showTag = async function() {
  enableSearch(false);
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE, lastTag));
  updateOther();
  return lastClicked = showTag;
};

showLists = function() {
  var html, xhttp;
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var e, entries, j, lastNickname, len1;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        entries = JSON.parse(xhttp.responseText);
        entries.sort(function(a, b) {
          if (a.nickname < b.nickname) {
            return -1;
          }
          if (a.nickname > b.nickname) {
            return 1;
          }
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
        html += `<div>&nbsp;</div>
<div class="statsheader">Public User Playlists:</div>`;
        lastNickname = null;
        for (j = 0, len1 = entries.length; j < len1; j++) {
          e = entries[j];
          if ((lastNickname != null) && (lastNickname !== e.nickname)) {
            html += `<div>&nbsp;</div>`;
          }
          html += `<div> * <a href="/p/${encodeURIComponent(e.nickname)}/${encodeURIComponent(e.name)}"><span class="entryartist">${e.nickname}</span></a><span class="entrymiddle"> - </span><a href="/p/${encodeURIComponent(e.nickname)}/${encodeURIComponent(e.name)}"><span class="entrytitle">${e.name}</span></a></div>`;
          lastNickname = e.nickname;
        }
      } catch (error) {
        html = "Error!";
      }
    }
    return document.getElementById("main").innerHTML = html;
  };
  xhttp.open("GET", "/info/userplaylists", true);
  xhttp.send();
  updateOther();
  return lastClicked = showLists;
};

showConvertedPlaylist = function() {
  var id, j, len1, playlistOutput;
  if (discordToken == null) {
    document.getElementById("main").innerHTML = `Not authorized.`;
    return;
  }
  if (convertPlaylistData != null) {
    if (!Array.isArray(convertPlaylistData)) {
      convertPlaylistData = [];
    }
    playlistOutput = "un";
    for (j = 0, len1 = convertPlaylistData.length; j < len1; j++) {
      id = convertPlaylistData[j];
      playlistOutput += ` ${id}`;
    }
    document.getElementById("main").innerHTML = `Converted Youtube Playlist: ${convertPlaylistMode}<br>
<br>
<span class="convertoutput">${playlistOutput}</span>`;
    return;
  }
  return document.getElementById("main").innerHTML = `Converting Youtube Playlist: ${convertPlaylistMode}`;
};

showStats = function() {
  var html, xhttp;
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var amt, duration, e, endTime, entries, j, k, l, len1, len2, len3, len4, m, n, name1, p, startTime, tagCounts, tagName, tagNames, timeUnits, totalDuration, totalDurationString, unit, user, userCounts, userList, v;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        entries = JSON.parse(xhttp.responseText);
        m = entries;
        entries = [];
        for (k in m) {
          v = m[k];
          entries.push(v);
        }
        totalDuration = 0;
        userCounts = {};
        tagCounts = {};
        for (j = 0, len1 = entries.length; j < len1; j++) {
          e = entries[j];
          if (userCounts[name1 = e.nickname] == null) {
            userCounts[name1] = 0;
          }
          userCounts[e.nickname] += 1;
          startTime = e.start;
          if (startTime < 0) {
            startTime = 0;
          }
          endTime = e.end;
          if (endTime < 0) {
            endTime = e.duration;
          }
          duration = endTime - startTime;
          totalDuration += duration;
          for (tagName in e.tags) {
            if (tagCounts[tagName] == null) {
              tagCounts[tagName] = 0;
            }
            tagCounts[tagName] += 1;
          }
        }
        userList = Object.keys(userCounts);
        userList.sort(function(a, b) {
          if (userCounts[a] < userCounts[b]) {
            return 1;
          }
          if (userCounts[a] > userCounts[b]) {
            return -1;
          }
          return 0;
        });
        totalDurationString = "";
        timeUnits = [
          {
            name: 'day',
            factor: 3600 * 24
          },
          {
            name: 'hour',
            factor: 3600
          },
          {
            name: 'min',
            factor: 60
          },
          {
            name: 'second',
            factor: 1
          }
        ];
        for (l = 0, len2 = timeUnits.length; l < len2; l++) {
          unit = timeUnits[l];
          if (totalDuration >= unit.factor) {
            amt = Math.floor(totalDuration / unit.factor);
            totalDuration -= amt * unit.factor;
            if (totalDurationString.length !== 0) {
              totalDurationString += ", ";
            }
            totalDurationString += `${amt} ${unit.name}${amt === 1 ? "" : "s"}`;
          }
        }
        html += `<div class="statsheader">Basic Stats:</div>
<div>Total Songs: ${entries.length}</div>
<div>Total Duration: ${totalDurationString}</div>

<div>&nbsp;</div>
<div class="statsheader">Songs by User:</div>`;
        for (n = 0, len3 = userList.length; n < len3; n++) {
          user = userList[n];
          html += `<div> * <a href="#user/${encodeURIComponent(user)}">${user}</a>: ${userCounts[user]}</div>`;
        }
        html += `<div>&nbsp;</div>
<div class="statsheader">Songs by Tag:</div>`;
        tagNames = Object.keys(tagCounts).sort();
        for (p = 0, len4 = tagNames.length; p < len4; p++) {
          tagName = tagNames[p];
          html += `<div> * <a href="#tag/${encodeURIComponent(tagName)}">${tagName}</a>: ${tagCounts[tagName]}</div>`;
        }
      } catch (error) {
        // html = "<pre>" + JSON.stringify(userCounts, null, 2) + "</pre>"
        html = "Error!";
      }
    }
    return document.getElementById("main").innerHTML = html;
  };
  xhttp.open("GET", "/info/playlist", true);
  xhttp.send();
  updateOther();
  return lastClicked = showStats;
};

showUser = function() {
  var html, xhttp;
  document.getElementById('search').style.display = 'none';
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var feeling, hasIncomingOpinions, hasOutgoingOpinions, incoming, j, l, len1, len2, len3, len4, len5, len6, listHTML, n, name, outgoing, p, q, r, ref1, ref2, sortedFeelings, userInfo;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        userInfo = JSON.parse(xhttp.responseText);
      } catch (error) {
        document.getElementById("main").innerHTML = "Error!";
        return;
      }
      html = `<div class="statsheader">User: ${lastUser}</div>`;
      listHTML = "";
      sortedFeelings = [];
      for (j = 0, len1 = opinionOrder.length; j < len1; j++) {
        feeling = opinionOrder[j];
        if (userInfo.opinions[feeling] != null) {
          sortedFeelings.push(feeling);
        }
      }
      for (l = 0, len2 = sortedFeelings.length; l < len2; l++) {
        feeling = sortedFeelings[l];
        listHTML += `<div class="restTitle">${feeling.charAt(0).toUpperCase() + feeling.slice(1)}:</div>
<div id="user${feeling}"></div>`;
      }
      if (userInfo.added.length > 0) {
        listHTML += `<div class="restTitle">Added:</div>
<div id="useradded"></div>`;
      }
      if (listHTML.length === 0) {
        listHTML += `<div class="restTitle">(No info on this user)</div>`;
      } else {
        hasIncomingOpinions = Object.keys(userInfo.otherTotals.incoming).length > 0;
        hasOutgoingOpinions = Object.keys(userInfo.otherTotals.outgoing).length > 0;
        if (hasIncomingOpinions || hasOutgoingOpinions) {
          html += `<div class="restTitle">Opinion Stats:</div>
<ul>`;
          if (hasIncomingOpinions) {
            html += `<li>Incoming Totals:</li><ul>`;
            for (n = 0, len3 = opinionOrder.length; n < len3; n++) {
              feeling = opinionOrder[n];
              if (userInfo.otherTotals.incoming[feeling] != null) {
                html += `<li>${feeling}: ${userInfo.otherTotals.incoming[feeling]}</li>`;
              }
            }
            html += `</ul>`;
            html += `<li>Incoming by user:</li><ul>`;
            ref1 = userInfo.otherOpinions.incoming;
            for (name in ref1) {
              incoming = ref1[name];
              html += `<li><a href="#user/${encodeURIComponent(name)}">${name}</a></li><ul>`;
              for (p = 0, len4 = opinionOrder.length; p < len4; p++) {
                feeling = opinionOrder[p];
                if (incoming[feeling] != null) {
                  html += `<li>${feeling}: ${incoming[feeling]}</li>`;
                }
              }
              html += `</ul>`;
            }
            html += `</ul>`;
          }
          if (hasOutgoingOpinions) {
            html += `<li>Outgoing:</li>
<ul>`;
            for (q = 0, len5 = opinionOrder.length; q < len5; q++) {
              feeling = opinionOrder[q];
              if (userInfo.otherTotals.outgoing[feeling] != null) {
                html += `<li>${feeling}: ${userInfo.otherTotals.outgoing[feeling]}</li>`;
              }
            }
            html += `</ul>`;
            html += `<li>Outgoing by user:</li><ul>`;
            ref2 = userInfo.otherOpinions.outgoing;
            for (name in ref2) {
              outgoing = ref2[name];
              html += `<li><a href="#user/${encodeURIComponent(name)}">${name}</a></li><ul>`;
              for (r = 0, len6 = opinionOrder.length; r < len6; r++) {
                feeling = opinionOrder[r];
                if (outgoing[feeling] != null) {
                  html += `<li>${feeling}: ${outgoing[feeling]}</li>`;
                }
              }
              html += `</ul>`;
            }
            html += `</ul>`;
          }
          html += `</ul>`;
        }
      }
      html += listHTML;
      document.getElementById("main").innerHTML = html;
      return setTimeout(function() {
        var list, ref3;
        ref3 = userInfo.opinions;
        for (feeling in ref3) {
          list = ref3[feeling];
          document.getElementById(`user${feeling}`).innerHTML = renderEntries(null, null, userInfo.opinions[feeling], false, SORT_ARTIST_TITLE);
        }
        if (userInfo.added.length > 0) {
          return document.getElementById("useradded").innerHTML = renderEntries(null, null, userInfo.added, false, SORT_ARTIST_TITLE);
        }
      }, 0);
    }
  };
  xhttp.open("GET", `/info/user?user=${encodeURIComponent(lastUser)}`, true);
  xhttp.send();
  updateOther();
  return lastClicked = showUser;
};

updateOpinion = function(pkt) {
  var capo, classes, html, j;
  if ((discordTag == null) || (lastPlayed == null)) {
    document.getElementById('remote').innerHTML = "";
    return;
  }
  html = `<div class="opinionname">`;
  for (j = opinionButtonOrder.length - 1; j >= 0; j += -1) {
    o = opinionButtonOrder[j];
    capo = o.charAt(0).toUpperCase() + o.slice(1);
    classes = "obutto";
    if (o === pkt.opinion) {
      classes += " chosen";
    }
    html += `<a class="${classes}" onclick="setOpinion('${o}'); return false;">${capo}</a>`;
  }
  html += ` - <span class=\"entryartist\">${lastPlayed.artist}</span> - <span class=\"entrytitle\">${lastPlayed.title}</span></div>`;
  return document.getElementById('opinions').innerHTML = html;
};

setOpinion = function(opinion) {
  if ((discordToken == null) || (lastPlayed == null) || (lastPlayed.id == null)) {
    return;
  }
  return socket.emit('opinion', {
    token: discordToken,
    id: lastPlayed.id,
    set: opinion,
    src: "dashboard"
  });
};

showWatchForm = function() {
  // document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'block';
  document.getElementById('castbutton').style.display = 'inline-block';
  return document.getElementById("userinput").focus();
};

showWatchLink = function() {
  // document.getElementById('aslink').style.display = 'inline-block'
  return document.getElementById('asform').style.display = 'none';
};

processHash = function() {
  var currentHash, matches;
  if (convertPlaylistMode != null) {
    showConvertedPlaylist();
    return;
  }
  currentHash = window.location.hash;
  if (matches = currentHash.match(/^#user\/(.+)/)) {
    lastUser = decodeURIComponent(matches[1]);
    showUser();
    return;
  }
  if (matches = currentHash.match(/^#tag\/(.+)/)) {
    lastTag = decodeURIComponent(matches[1]);
    showTag();
    return;
  }
  switch (currentHash) {
    case '#queue':
      return showQueue();
    case '#all':
      return showPlaylist();
    case '#recent':
      return showRecent();
    case '#both':
      return showBoth();
    case '#lists':
      return showLists();
    case '#stats':
      return showStats();
    default:
      return showPlaying();
  }
};

logout = function() {
  document.getElementById("identity").innerHTML = "Logging out...";
  localStorage.removeItem('token');
  return sendIdentity();
};

sendIdentity = function() {
  var identityPayload;
  discordToken = localStorage.getItem('token');
  identityPayload = {
    token: discordToken
  };
  console.log("Sending identify: ", identityPayload);
  return socket.emit('identify', identityPayload);
};

receiveIdentity = function(pkt) {
  var discordNicknameString, html, loginLink, redirectURL;
  console.log("identify response:", pkt);
  if (pkt.disabled) {
    console.log("Discord auth disabled.");
    document.getElementById("identity").innerHTML = "";
    return;
  }
  if ((pkt.tag != null) && (pkt.tag.length > 0)) {
    discordTag = pkt.tag;
    discordNicknameString = "";
    if (pkt.nickname != null) {
      discordNickname = pkt.nickname;
      discordNicknameString = ` (${discordNickname})`;
    }
    html = `${discordTag}${discordNicknameString} - [<a onclick="logout()">Logout</a>]`;
  } else {
    discordTag = null;
    discordNickname = null;
    discordToken = null;
    redirectURL = String(window.location).replace(/#.*$/, "") + "oauth";
    loginLink = `https://discord.com/api/oauth2/authorize?client_id=${window.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`;
    html = `[<a href="${loginLink}">Login</a>]`;
  }
  return document.getElementById("identity").innerHTML = html;
};

//  if lastClicked?
//    lastClicked()
onInitSuccess = function() {
  console.log("Cast available!");
  return castAvailable = true;
};

onError = function(message) {};

sessionListener = function(e) {
  return castSession = e;
};

sessionUpdateListener = function(isAlive) {
  if (!isAlive) {
    return castSession = null;
  }
};

prepareCast = function() {
  var apiConfig, sessionRequest;
  if (!chrome.cast || !chrome.cast.isAvailable) {
    if (now() < (pageEpoch + 10)) { // give up after 10 seconds
      window.setTimeout(prepareCast, 100);
    }
    return;
  }
  sessionRequest = new chrome.cast.SessionRequest('5C3F0A3C'); // Dashcast
  apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, function() {});
  return chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

startCast = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  console.log("start cast!");
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "cast?" + querystring;
  console.log(`We're going here: ${mtvURL}`);
  return chrome.cast.requestSession(function(e) {
    castSession = e;
    return castSession.sendMessage(DASHCAST_NAMESPACE, {
      url: mtvURL,
      force: true
    });
  }, onError);
};

init = function() {
  var matches, token;
  window.logout = logout;
  window.onhashchange = processHash;
  window.showBoth = showBoth;
  window.showPlaying = showPlaying;
  window.showPlaylist = showPlaylist;
  window.showQueue = showQueue;
  window.showLists = showLists;
  window.showStats = showStats;
  window.showUser = showUser;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.startCast = startCast;
  window.setOpinion = setOpinion;
  window.searchChanged = searchChanged;
  rawMode = qs('raw');
  if (rawMode != null) {
    if (matches = rawMode.match(/^tag_(.+)/)) {
      rawMode = "tag";
      rawModeTag = matches[1];
    }
  }
  convertPlaylistMode = qs('list');
  token = qs('token');
  if (token != null) {
    localStorage.setItem('token', token);
    window.location = '/';
    return;
  }
  discordToken = localStorage.getItem('token');
  processHash();
  socket = io();
  socket.on('connect', function() {
    // switch which line is commented here to allow identity on the dash
    sendIdentity();
    // document.getElementById("identity").innerHTML = ""
    if (convertPlaylistMode != null) {
      console.log("emitting convertplaylist");
      return socket.emit('convertplaylist', {
        token: discordToken,
        list: convertPlaylistMode
      });
    }
  });
  socket.on('play', function(pkt) {
    if (lastClicked != null) {
      return lastClicked();
    }
  });
  socket.on('refresh', function(pkt) {
    if (lastClicked != null) {
      return lastClicked();
    }
  });
  socket.on('identify', function(pkt) {
    return receiveIdentity(pkt);
  });
  socket.on('opinion', function(pkt) {
    return updateOpinion(pkt);
  });
  socket.on('convertplaylist', function(pkt) {
    convertPlaylistData = pkt;
    return showConvertedPlaylist();
  });
  return prepareCast();
};

window.onload = init;


},{"../constants":3,"../filters":4}],3:[function(require,module,exports){
module.exports = {
  opinions: {
    love: true,
    like: true,
    meh: true,
    bleh: true,
    hate: true
  },
  goodOpinions: { // don't skip these
    love: true,
    like: true
  },
  weakOpinions: { // skip these if we all agree
    meh: true
  },
  badOpinions: { // skip these
    bleh: true,
    hate: true
  },
  opinionOrder: [
    'love',
    'like',
    'meh',
    'bleh',
    'hate' // always in this specific order
  ]
};


},{}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSIsInNyYy9maWx0ZXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLG1CQUFBLEVBQUEsbUJBQUEsRUFBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVB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TyxDQUFDLENBQUQ7RUFDbEIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxDQUFEO0FBRWQsVUFBTyxRQUFQO0FBQUEsU0FDTyxTQURQO01BRUksR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixJQUFwQixDQUFBO0FBREg7QUFEUCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxTQUFBLEVBQVcsU0FEWDtFQUVBLFlBQUEsRUFBYyxZQUZkO0VBR0EsVUFBQSxFQUFZO0FBSFoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBIG1vZHVsZSBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uc1xuICovXG5cbi8qKlxuICogVGhlIHBhdHRlcm4gdXNlZCBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uIChQblluTW5EVG5Ibk1uUykuXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIHRoZSB3ZWVrIGZvcm1hdCBQblcuXG4gKi9cblxuLy8gUG5Zbk1uRFRuSG5NblNcbnZhciBudW1iZXJzID0gJ1xcXFxkKyg/OltcXFxcLixdXFxcXGQrKT8nO1xudmFyIHdlZWtQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdXKSc7XG52YXIgZGF0ZVBhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1kpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnRCk/JztcbnZhciB0aW1lUGF0dGVybiA9ICdUKCcgKyBudW1iZXJzICsgJ0gpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnUyk/JztcblxudmFyIGlzbzg2MDEgPSAnUCg/OicgKyB3ZWVrUGF0dGVybiArICd8JyArIGRhdGVQYXR0ZXJuICsgJyg/OicgKyB0aW1lUGF0dGVybiArICcpPyknO1xudmFyIG9iak1hcCA9IFsnd2Vla3MnLCAneWVhcnMnLCAnbW9udGhzJywgJ2RheXMnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbnZhciBkZWZhdWx0RHVyYXRpb24gPSBPYmplY3QuZnJlZXplKHtcbiAgeWVhcnM6IDAsXG4gIG1vbnRoczogMCxcbiAgd2Vla3M6IDAsXG4gIGRheXM6IDAsXG4gIGhvdXJzOiAwLFxuICBtaW51dGVzOiAwLFxuICBzZWNvbmRzOiAwXG59KTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICBkdXJhdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHREdXJhdGlvbiwgZHVyYXRpb24pO1xuXG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgZHVyYXRpb24gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0RHVyYXRpb24sIGR1cmF0aW9uKTtcblxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICB2YXIgdGhlbiA9IGVuZChkdXJhdGlvbiwgbm93KTtcblxuICB2YXIgc2Vjb25kcyA9ICh0aGVuLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgcmV0dXJuIHNlY29uZHM7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGVuZDogZW5kLFxuICB0b1NlY29uZHM6IHRvU2Vjb25kcyxcbiAgcGF0dGVybjogcGF0dGVybixcbiAgcGFyc2U6IHBhcnNlXG59OyIsImNvbnN0YW50cyA9IHJlcXVpcmUgJy4uL2NvbnN0YW50cydcbmZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xuXG5zb2NrZXQgPSBudWxsXG5cbkRBU0hDQVNUX05BTUVTUEFDRSA9ICd1cm46eC1jYXN0OmVzLm9mZmQuZGFzaGNhc3QnXG5cbmxhc3RDbGlja2VkID0gbnVsbFxubGFzdFVzZXIgPSBudWxsXG5sYXN0VGFnID0gbnVsbFxuZGlzY29yZFRhZyA9IG51bGxcbmRpc2NvcmROaWNrbmFtZSA9IG51bGxcbmRpc2NvcmRUb2tlbiA9IG51bGxcbmxhc3RQbGF5ZWQgPSBudWxsXG5cbnNlYXJjaEVuYWJsZWQgPSBmYWxzZVxuc2VhcmNoU3Vic3RyaW5nID0gXCJcIlxuXG5kb3dubG9hZENhY2hlID0ge31cbmNhY2hlRW5hYmxlZCA9IHtcbiAgXCIvaW5mby9wbGF5bGlzdFwiOiB0cnVlXG59XG5cbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxuY2FzdFNlc3Npb24gPSBudWxsXG5cbnJhd01vZGUgPSBmYWxzZVxucmF3TW9kZVRhZyA9IFwiXCJcblxuY29udmVydFBsYXlsaXN0TW9kZSA9IG51bGxcbmNvbnZlcnRQbGF5bGlzdERhdGEgPSBudWxsXG5cbm9waW5pb25PcmRlciA9IGNvbnN0YW50cy5vcGluaW9uT3JkZXJcbm9waW5pb25CdXR0b25PcmRlciA9IFtdXG5mb3IgbyBpbiBjb25zdGFudHMub3Bpbmlvbk9yZGVyXG4gIG9waW5pb25CdXR0b25PcmRlci5wdXNoIG9cbm9waW5pb25CdXR0b25PcmRlci5wdXNoKCdub25lJylcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnBhZ2VFcG9jaCA9IG5vdygpXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zZWNvbmRzVG9UaW1lID0gKHQpIC0+XG4gIHVuaXRzID0gW1xuICAgIHsgc3VmZml4OiBcImhcIiwgZmFjdG9yOiAzNjAwLCBza2lwOiB0cnVlIH1cbiAgICB7IHN1ZmZpeDogXCJtXCIsIGZhY3RvcjogNjAsIHNraXA6IGZhbHNlIH1cbiAgICB7IHN1ZmZpeDogXCJzXCIsIGZhY3RvcjogMSwgc2tpcDogZmFsc2UgfVxuICBdXG5cbiAgc3RyID0gXCJcIlxuICBmb3IgdW5pdCBpbiB1bml0c1xuICAgIHUgPSBNYXRoLmZsb29yKHQgLyB1bml0LmZhY3RvcilcbiAgICBpZiAodSA+IDApIG9yIG5vdCB1bml0LnNraXBcbiAgICAgIHQgLT0gdSAqIHVuaXQuZmFjdG9yXG4gICAgICBpZiBzdHIubGVuZ3RoID4gMFxuICAgICAgICBzdHIgKz0gXCI6XCJcbiAgICAgICAgaWYgdSA8IDEwXG4gICAgICAgICAgc3RyICs9IFwiMFwiXG4gICAgICBzdHIgKz0gU3RyaW5nKHUpXG4gIHJldHVybiBzdHJcblxucHJldHR5RHVyYXRpb24gPSAoZSkgLT5cbiAgc3RhcnRUaW1lID0gZS5zdGFydFxuICBpZiBzdGFydFRpbWUgPCAwXG4gICAgc3RhcnRUaW1lID0gMFxuICBlbmRUaW1lID0gZS5lbmRcbiAgaWYgZW5kVGltZSA8IDBcbiAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxuICByZXR1cm4gXCIje3NlY29uZHNUb1RpbWUoc3RhcnRUaW1lKX0tI3tzZWNvbmRzVG9UaW1lKGVuZFRpbWUpfVwiXG5cblNPUlRfTk9ORSA9IDBcblNPUlRfQVJUSVNUX1RJVExFID0gMVxuU09SVF9BRERFRCA9IDJcblxucmVuZGVyRW50cmllcyA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGVudHJpZXMsIGlzTWFwLCBzb3J0TWV0aG9kID0gU09SVF9OT05FLCB0YWdGaWx0ZXIgPSBudWxsKSAtPlxuICBodG1sID0gXCJcIlxuXG4gIGlmIGlzTWFwXG4gICAgIyBjb25zb2xlLmxvZyBlbnRyaWVzXG4gICAgbSA9IGVudHJpZXNcbiAgICBlbnRyaWVzID0gW11cbiAgICBmb3IgaywgdiBvZiBtXG4gICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gIHN3aXRjaCBzb3J0TWV0aG9kXG4gICAgd2hlbiBTT1JUX0FSVElTVF9USVRMRVxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgIHdoZW4gU09SVF9BRERFRFxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxuICAgICAgICBpZiBhLmFkZGVkID4gYi5hZGRlZFxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLmFkZGVkIDwgYi5hZGRlZFxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG5cbiAgaWYgbm90IGZpcnN0VGl0bGU/IGFuZCBub3QgcmVzdFRpdGxlPyBhbmQgdGFnRmlsdGVyP1xuICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+VGFnOiAje3RhZ0ZpbHRlcn08L2Rpdj5cbiAgICBcIlwiXCJcblxuICBsb3dlcmNhc2VTZWFyY2ggPSBzZWFyY2hTdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcbiAgICBpZiB0YWdGaWx0ZXI/IGFuZCBub3QgZS50YWdzW3RhZ0ZpbHRlcl0/XG4gICAgICBjb250aW51ZVxuXG4gICAgYXJ0aXN0ID0gZS5hcnRpc3RcbiAgICBpZiBub3QgYXJ0aXN0P1xuICAgICAgYXJ0aXN0ID0gXCJVbmtub3duXCJcbiAgICB0aXRsZSA9IGUudGl0bGVcbiAgICBpZiBub3QgdGl0bGU/XG4gICAgICB0aXRsZSA9IGUuaWRcblxuICAgIGlmIHNlYXJjaEVuYWJsZWQgYW5kIChsb3dlcmNhc2VTZWFyY2gubGVuZ3RoID4gMClcbiAgICAgIGlmIChhcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKGxvd2VyY2FzZVNlYXJjaCkgPT0gLTEpIGFuZCAodGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGxvd2VyY2FzZVNlYXJjaCkgPT0gLTEpXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICBwYXJhbXMgPSBcIlwiXG4gICAgaWYgZS5zdGFydCA+PSAwXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxuICAgICAgcGFyYW1zICs9IFwic3RhcnQ9I3tlLnN0YXJ0fVwiXG4gICAgaWYgZS5lbmQgPj0gMFxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcbiAgICAgIHBhcmFtcyArPSBcImVuZD0je2UuZW5kfVwiXG5cbiAgICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oZS5pZClcbiAgICBpZiBub3QgaWRJbmZvP1xuICAgICAgY29udGludWVcbiAgICB1cmwgPSBpZEluZm8udXJsICsgcGFyYW1zXG5cbiAgICBleHRyYUluZm8gPSBcIlwiXG4gICAgdGFncyA9IFtdXG4gICAgZm9yIHRhZyBvZiBlLnRhZ3NcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3t0YWd9XCJcbiAgICAgIHRhZ3MucHVzaCB0YWdcbiAgICBpZiB0YWdzLmxlbmd0aCA+IDBcbiAgICAgIHRhZ1N0cmluZyA9IFwiIC0gPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiICsgdGFncy5qb2luKFwiPC9zcGFuPiwgPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiKSArIFwiPC9zcGFuPlwiXG4gICAgZWxzZVxuICAgICAgdGFnU3RyaW5nID0gXCJcIlxuICAgIGlmIChlLnN0YXJ0ICE9IC0xKSBvciAgKGUuZW5kICE9IC0xKVxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXG4gICAgaWYgZS5vcGluaW9ucz9cbiAgICAgIGZvciBmZWVsaW5nLCBjb3VudCBvZiBlLm9waW5pb25zXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxuXG4gICAgaWYgZmlyc3RUaXRsZT9cbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZpcnN0VGl0bGVcIj4je2ZpcnN0VGl0bGV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlIGlmIChlbnRyeUluZGV4ID09IDEpXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7cmVzdFRpdGxlfTwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgIGlmIGRpc2NvcmRUYWdcbiAgICAgIGFjdGlvbnMgPSBcIlwiICMgXCIgWyBEbyBzdHVmZiBhcyAje2Rpc2NvcmRUYWd9IF1cIlxuICAgIGVsc2VcbiAgICAgIGFjdGlvbnMgPSBcIlwiXG5cbiAgICBzd2l0Y2ggcmF3TW9kZVxuICAgICAgd2hlbiBcImVkaXRcIlxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXY+PHNwYW4gY2xhc3M9XFxcInNlbGVjdGFsbFxcXCI+I210diBlZGl0ICN7ZS5pZH0gQ09NTUFOREhFUkU8L3NwYW4+ICMgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4je3RhZ1N0cmluZ308L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICB3aGVuIFwic29sb1wiXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj5pZCAje2UuaWR9ICMgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7YXJ0aXN0fSAtICN7dGl0bGV9PC9hPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIHdoZW4gXCJ0YWdcIlxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXY+PHNwYW4gY2xhc3M9XFxcInNlbGVjdGFsbFxcXCI+I210diBlZGl0ICN7ZS5pZH0gdGFnICN7cmF3TW9kZVRhZ308L3NwYW4+IHwgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4je3RhZ1N0cmluZ308L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj4gKiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiA8c3BhbiBjbGFzcz1cInVzZXJcIj4oI3tlLm5pY2tuYW1lfSN7ZXh0cmFJbmZvfSk8L3NwYW4+I3thY3Rpb25zfTwvZGl2PlxuXG4gICAgICAgIFwiXCJcIlxuICByZXR1cm4gaHRtbFxuXG5cbnNob3dMaXN0ID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgdXJsLCBpc01hcCA9IGZhbHNlLCBzb3J0TWV0aG9kID0gU09SVF9OT05FLCB0YWdGaWx0ZXIgPSBudWxsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBpZiBkb3dubG9hZENhY2hlW3VybF0/XG4gICAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlOiAje3VybH1cIlxuICAgICAgcmVzb2x2ZShyZW5kZXJFbnRyaWVzKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZG93bmxvYWRDYWNoZVt1cmxdLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcbiAgICAgIHJldHVyblxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmc6ICN7dXJsfVwiXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgIGlmIGNhY2hlRW5hYmxlZFt1cmxdXG4gICAgICAgICAgICAgICBkb3dubG9hZENhY2hlW3VybF0gPSBlbnRyaWVzXG4gICAgICAgICAgICAgcmVzb2x2ZShyZW5kZXJFbnRyaWVzKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QsIHRhZ0ZpbHRlcikpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbnVwZGF0ZU90aGVyID0gLT5cbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICB0cnlcbiAgICAgICAgICBvdGhlciA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXG4gICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcbiAgICAgICAgICBpZiBvdGhlci5uYW1lcz8gYW5kIChvdGhlci5uYW1lcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcbiAgICAgICAgICAgIGZvciBuYW1lIGluIG90aGVyLm5hbWVzXG4gICAgICAgICAgICAgIGlmIG5hbWVTdHJpbmcubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gbmFtZVxuICAgICAgICAgICAgcmVtYWluaW5nQ291bnQgPSBvdGhlci5wbGF5aW5nIC0gb3RoZXIubmFtZXMubGVuZ3RoXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiArICN7cmVtYWluaW5nQ291bnR9IGFub25cIlxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiOiAje25hbWVTdHJpbmd9XCJcblxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWluZ1wiKS5pbm5lckhUTUwgPSBcIiN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9XCJcbiAgICAgICAgICBsYXN0UGxheWVkID0gb3RoZXIuY3VycmVudFxuICAgICAgICAgIGlmIGRpc2NvcmRUb2tlbj9cbiAgICAgICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogbGFzdFBsYXllZC5pZCB9XG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgIyBub3RoaW5nP1xuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcbiAgeGh0dHAuc2VuZCgpXG5cbnNob3dQbGF5aW5nID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWluZ1xuXG5zaG93UXVldWUgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcblxuc2hvd0JvdGggPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGxlZnRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPGRpdiBpZD1cIm1haW5sXCI+I3tsZWZ0U2lkZX08L2Rpdj5cbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cbiAgXCJcIlwiXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxuXG5lbmFibGVTZWFyY2ggPSAoZW5hYmxlZCkgLT5cbiAgc2VhcmNoRW5hYmxlZCA9IGVuYWJsZWRcbiAgaWYgZW5hYmxlZFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICAgIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXG4gIGVsc2VcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHNlYXJjaFN1YnN0cmluZyA9IFwiXCJcblxuXG5zZWFyY2hDaGFuZ2VkID0gLT5cbiAgaWYgbm90IHNlYXJjaEVuYWJsZWRcbiAgICByZXR1cm5cbiAgaWYgbm90IGRvd25sb2FkQ2FjaGVbXCIvaW5mby9wbGF5bGlzdFwiXT9cbiAgICByZXR1cm5cbiAgc2VhcmNoU3Vic3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaGlucHV0JykudmFsdWVcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxuXG5zaG93UGxheWxpc3QgPSAtPlxuICBlbmFibGVTZWFyY2godHJ1ZSlcbiAgZG93bmxvYWRDYWNoZVtcIi9pbmZvL3BsYXlsaXN0XCJdID0gbnVsbCAjIGRvbid0IGNhY2hlIGlmIHRoZXkgY2xpY2sgb24gQWxsXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5bGlzdFxuXG5zaG93UmVjZW50ID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BRERFRClcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dSZWNlbnRcblxuc2hvd1RhZyA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFLCBsYXN0VGFnKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1RhZ1xuXG5zaG93TGlzdHMgPSAtPlxuICBodG1sID0gXCJcIlxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgdHJ5XG4gICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPCBiLm5pY2tuYW1lXG4gICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYS5uaWNrbmFtZSA+IGIubmlja25hbWVcbiAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICByZXR1cm4gMFxuXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5QdWJsaWMgVXNlciBQbGF5bGlzdHM6PC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBsYXN0Tmlja25hbWUgPSBudWxsXG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xuICAgICAgICAgICAgaWYgbGFzdE5pY2tuYW1lPyBhbmQgKGxhc3ROaWNrbmFtZSAhPSBlLm5pY2tuYW1lKVxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiL3AvI3tlbmNvZGVVUklDb21wb25lbnQoZS5uaWNrbmFtZSl9LyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmFtZSl9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7ZS5uaWNrbmFtZX08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgaHJlZj1cIi9wLyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChlLm5hbWUpfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7ZS5uYW1lfTwvc3Bhbj48L2E+PC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGxhc3ROaWNrbmFtZSA9IGUubmlja25hbWVcblxuICAgICAgIGNhdGNoXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VycGxheWxpc3RzXCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93TGlzdHNcblxuc2hvd0NvbnZlcnRlZFBsYXlsaXN0ID0gLT5cbiAgaWYgbm90IGRpc2NvcmRUb2tlbj9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICBOb3QgYXV0aG9yaXplZC5cbiAgICBcIlwiXCJcbiAgICByZXR1cm5cblxuICBpZiBjb252ZXJ0UGxheWxpc3REYXRhP1xuICAgIGlmIG5vdCBBcnJheS5pc0FycmF5KGNvbnZlcnRQbGF5bGlzdERhdGEpXG4gICAgICBjb252ZXJ0UGxheWxpc3REYXRhID0gW11cblxuICAgIHBsYXlsaXN0T3V0cHV0ID0gXCJ1blwiXG4gICAgZm9yIGlkIGluIGNvbnZlcnRQbGF5bGlzdERhdGFcbiAgICAgIHBsYXlsaXN0T3V0cHV0ICs9IFwiICN7aWR9XCJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICBDb252ZXJ0ZWQgWW91dHViZSBQbGF5bGlzdDogI3tjb252ZXJ0UGxheWxpc3RNb2RlfTxicj5cbiAgICAgIDxicj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiY29udmVydG91dHB1dFwiPiN7cGxheWxpc3RPdXRwdXR9PC9zcGFuPlxuICAgIFwiXCJcIlxuICAgIHJldHVyblxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICBDb252ZXJ0aW5nIFlvdXR1YmUgUGxheWxpc3Q6ICN7Y29udmVydFBsYXlsaXN0TW9kZX1cbiAgXCJcIlwiXG5cbnNob3dTdGF0cyA9IC0+XG4gIGh0bWwgPSBcIlwiXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICB0cnlcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgbSA9IGVudHJpZXNcbiAgICAgICAgICBlbnRyaWVzID0gW11cbiAgICAgICAgICBmb3IgaywgdiBvZiBtXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcblxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxuICAgICAgICAgIHRhZ0NvdW50cyA9IHt9XG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdICs9IDFcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXG5cbiAgICAgICAgICAgIGZvciB0YWdOYW1lIG9mIGUudGFnc1xuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gPz0gMFxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gKz0gMVxuXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICByZXR1cm4gMFxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cbiAgICAgICAgICBdXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFRhZzo8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ0NvdW50cykuc29ydCgpXG4gICAgICAgICAgZm9yIHRhZ05hbWUgaW4gdGFnTmFtZXNcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN0YWcvI3tlbmNvZGVVUklDb21wb25lbnQodGFnTmFtZSl9XCI+I3t0YWdOYW1lfTwvYT46ICN7dGFnQ291bnRzW3RhZ05hbWVdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcblxuICAgICAgIGNhdGNoXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXG5cbnNob3dVc2VyID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICB0cnlcbiAgICAgICAgdXNlckluZm8gPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgIGNhdGNoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XG4gICAgICBcIlwiXCJcblxuICAgICAgbGlzdEhUTUwgPSBcIlwiXG5cbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cbiAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcblxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+QWRkZWQ6PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPihObyBpbmZvIG9uIHRoaXMgdXNlcik8L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIGhhc0luY29taW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZykubGVuZ3RoID4gMFxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcblxuICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zIG9yIGhhc091dGdvaW5nT3BpbmlvbnNcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIGluY29taW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XG4gICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgICBpZiBvdXRnb2luZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIFwiXCJcIlxuXG5cbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXIje2ZlZWxpbmd9XCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10sIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICwgMFxuXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1VzZXJcblxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XG4gIGlmIG5vdCBkaXNjb3JkVGFnPyBvciBub3QgbGFzdFBsYXllZD9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlJykuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGh0bWwgPSBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwib3Bpbmlvbm5hbWVcIj5cbiAgXCJcIlwiXG4gIGZvciBvIGluIG9waW5pb25CdXR0b25PcmRlciBieSAtMVxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxuICAgIGNsYXNzZXMgPSBcIm9idXR0b1wiXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxuICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cbiAgICBcIlwiXCJcbiAgaHRtbCArPSBcIiAtIDxzcGFuIGNsYXNzPVxcXCJlbnRyeWFydGlzdFxcXCI+I3tsYXN0UGxheWVkLmFydGlzdH08L3NwYW4+IC0gPHNwYW4gY2xhc3M9XFxcImVudHJ5dGl0bGVcXFwiPiN7bGFzdFBsYXllZC50aXRsZX08L3NwYW4+PC9kaXY+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxuXG5zZXRPcGluaW9uID0gKG9waW5pb24pIC0+XG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkPyBvciBub3QgbGFzdFBsYXllZC5pZD9cbiAgICByZXR1cm5cblxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQsIHNldDogb3Bpbmlvbiwgc3JjOiBcImRhc2hib2FyZFwiIH1cblxuc2hvd1dhdGNoRm9ybSA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcblxuc2hvd1dhdGNoTGluayA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG5wcm9jZXNzSGFzaCA9IC0+XG4gIGlmIGNvbnZlcnRQbGF5bGlzdE1vZGU/XG4gICAgc2hvd0NvbnZlcnRlZFBsYXlsaXN0KClcbiAgICByZXR1cm5cblxuICBjdXJyZW50SGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXG4gICAgbGFzdFVzZXIgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcbiAgICBzaG93VXNlcigpXG4gICAgcmV0dXJuXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN0YWdcXC8oLispLylcbiAgICBsYXN0VGFnID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXG4gICAgc2hvd1RhZygpXG4gICAgcmV0dXJuXG4gIHN3aXRjaCBjdXJyZW50SGFzaFxuICAgIHdoZW4gJyNxdWV1ZSdcbiAgICAgIHNob3dRdWV1ZSgpXG4gICAgd2hlbiAnI2FsbCdcbiAgICAgIHNob3dQbGF5bGlzdCgpXG4gICAgd2hlbiAnI3JlY2VudCdcbiAgICAgIHNob3dSZWNlbnQoKVxuICAgIHdoZW4gJyNib3RoJ1xuICAgICAgc2hvd0JvdGgoKVxuICAgIHdoZW4gJyNsaXN0cydcbiAgICAgIHNob3dMaXN0cygpXG4gICAgd2hlbiAnI3N0YXRzJ1xuICAgICAgc2hvd1N0YXRzKClcbiAgICBlbHNlXG4gICAgICBzaG93UGxheWluZygpXG5cbmxvZ291dCA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXG4gIHNlbmRJZGVudGl0eSgpXG5cbnNlbmRJZGVudGl0eSA9IC0+XG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXG4gIGlkZW50aXR5UGF5bG9hZCA9IHtcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXG4gIH1cbiAgY29uc29sZS5sb2cgXCJTZW5kaW5nIGlkZW50aWZ5OiBcIiwgaWRlbnRpdHlQYXlsb2FkXG4gIHNvY2tldC5lbWl0ICdpZGVudGlmeScsIGlkZW50aXR5UGF5bG9hZFxuXG5yZWNlaXZlSWRlbnRpdHkgPSAocGt0KSAtPlxuICBjb25zb2xlLmxvZyBcImlkZW50aWZ5IHJlc3BvbnNlOlwiLCBwa3RcbiAgaWYgcGt0LmRpc2FibGVkXG4gICAgY29uc29sZS5sb2cgXCJEaXNjb3JkIGF1dGggZGlzYWJsZWQuXCJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcbiAgICByZXR1cm5cblxuICBpZiBwa3QudGFnPyBhbmQgKHBrdC50YWcubGVuZ3RoID4gMClcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xuICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiXCJcbiAgICBpZiBwa3Qubmlja25hbWU/XG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcbiAgICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiICgje2Rpc2NvcmROaWNrbmFtZX0pXCJcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcbiAgICBkaXNjb3JkVG9rZW4gPSBudWxsXG5cbiAgICByZWRpcmVjdFVSTCA9IFN0cmluZyh3aW5kb3cubG9jYXRpb24pLnJlcGxhY2UoLyMuKiQvLCBcIlwiKSArIFwib2F1dGhcIlxuICAgIGxvZ2luTGluayA9IFwiaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL2F1dGhvcml6ZT9jbGllbnRfaWQ9I3t3aW5kb3cuQ0xJRU5UX0lEfSZyZWRpcmVjdF91cmk9I3tlbmNvZGVVUklDb21wb25lbnQocmVkaXJlY3RVUkwpfSZyZXNwb25zZV90eXBlPWNvZGUmc2NvcGU9aWRlbnRpZnlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgIFs8YSBocmVmPVwiI3tsb2dpbkxpbmt9XCI+TG9naW48L2E+XVxuICAgIFwiXCJcIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcbiMgIGlmIGxhc3RDbGlja2VkP1xuIyAgICBsYXN0Q2xpY2tlZCgpXG5cbm9uSW5pdFN1Y2Nlc3MgPSAtPlxuICBjb25zb2xlLmxvZyBcIkNhc3QgYXZhaWxhYmxlIVwiXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXG5cbm9uRXJyb3IgPSAobWVzc2FnZSkgLT5cblxuc2Vzc2lvbkxpc3RlbmVyID0gKGUpIC0+XG4gIGNhc3RTZXNzaW9uID0gZVxuXG5zZXNzaW9uVXBkYXRlTGlzdGVuZXIgPSAoaXNBbGl2ZSkgLT5cbiAgaWYgbm90IGlzQWxpdmVcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcblxucHJlcGFyZUNhc3QgPSAtPlxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXG4gICAgaWYgbm93KCkgPCAocGFnZUVwb2NoICsgMTApICMgZ2l2ZSB1cCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChwcmVwYXJlQ2FzdCwgMTAwKVxuICAgIHJldHVyblxuXG4gIHNlc3Npb25SZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0LlNlc3Npb25SZXF1ZXN0KCc1QzNGMEEzQycpICMgRGFzaGNhc3RcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxuICBjaHJvbWUuY2FzdC5pbml0aWFsaXplKGFwaUNvbmZpZywgb25Jbml0U3VjY2Vzcywgb25FcnJvcilcblxuc3RhcnRDYXN0ID0gLT5cbiAgY29uc29sZS5sb2cgXCJzdGFydCBjYXN0IVwiXG5cbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiY2FzdD9cIiArIHF1ZXJ5c3RyaW5nXG4gIGNvbnNvbGUubG9nIFwiV2UncmUgZ29pbmcgaGVyZTogI3ttdHZVUkx9XCJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XG4gICAgY2FzdFNlc3Npb24gPSBlXG4gICAgY2FzdFNlc3Npb24uc2VuZE1lc3NhZ2UoREFTSENBU1RfTkFNRVNQQUNFLCB7IHVybDogbXR2VVJMLCBmb3JjZTogdHJ1ZSB9KVxuICAsIG9uRXJyb3JcblxuaW5pdCA9IC0+XG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcbiAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IHByb2Nlc3NIYXNoXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXG4gIHdpbmRvdy5zaG93UGxheWluZyA9IHNob3dQbGF5aW5nXG4gIHdpbmRvdy5zaG93UGxheWxpc3QgPSBzaG93UGxheWxpc3RcbiAgd2luZG93LnNob3dRdWV1ZSA9IHNob3dRdWV1ZVxuICB3aW5kb3cuc2hvd0xpc3RzID0gc2hvd0xpc3RzXG4gIHdpbmRvdy5zaG93U3RhdHMgPSBzaG93U3RhdHNcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXG4gIHdpbmRvdy5zaG93V2F0Y2hMaW5rID0gc2hvd1dhdGNoTGlua1xuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxuICB3aW5kb3cuc2VhcmNoQ2hhbmdlZCA9IHNlYXJjaENoYW5nZWRcblxuICByYXdNb2RlID0gcXMoJ3JhdycpXG4gIGlmIHJhd01vZGU/XG4gICAgaWYgbWF0Y2hlcyA9IHJhd01vZGUubWF0Y2goL150YWdfKC4rKS8pXG4gICAgICByYXdNb2RlID0gXCJ0YWdcIlxuICAgICAgcmF3TW9kZVRhZyA9IG1hdGNoZXNbMV1cblxuICBjb252ZXJ0UGxheWxpc3RNb2RlID0gcXMoJ2xpc3QnKVxuXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcbiAgaWYgdG9rZW4/XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgdG9rZW4pXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXG4gICAgcmV0dXJuXG5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgcHJvY2Vzc0hhc2goKVxuXG4gIHNvY2tldCA9IGlvKClcblxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxuICAgICMgc3dpdGNoIHdoaWNoIGxpbmUgaXMgY29tbWVudGVkIGhlcmUgdG8gYWxsb3cgaWRlbnRpdHkgb24gdGhlIGRhc2hcbiAgICBzZW5kSWRlbnRpdHkoKVxuICAgICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXG5cbiAgICBpZiBjb252ZXJ0UGxheWxpc3RNb2RlP1xuICAgICAgY29uc29sZS5sb2cgXCJlbWl0dGluZyBjb252ZXJ0cGxheWxpc3RcIlxuICAgICAgc29ja2V0LmVtaXQgJ2NvbnZlcnRwbGF5bGlzdCcsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgbGlzdDogY29udmVydFBsYXlsaXN0TW9kZSB9XG5cbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICBpZiBsYXN0Q2xpY2tlZD9cbiAgICAgIGxhc3RDbGlja2VkKClcblxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxuICAgIGlmIGxhc3RDbGlja2VkP1xuICAgICAgbGFzdENsaWNrZWQoKVxuXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXG5cbiAgc29ja2V0Lm9uICdvcGluaW9uJywgKHBrdCkgLT5cbiAgICB1cGRhdGVPcGluaW9uKHBrdClcblxuICBzb2NrZXQub24gJ2NvbnZlcnRwbGF5bGlzdCcsIChwa3QpIC0+XG4gICAgY29udmVydFBsYXlsaXN0RGF0YSA9IHBrdFxuICAgIHNob3dDb252ZXJ0ZWRQbGF5bGlzdCgpXG5cbiAgcHJlcGFyZUNhc3QoKVxuXG53aW5kb3cub25sb2FkID0gaW5pdFxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBvcGluaW9uczpcbiAgICBsb3ZlOiB0cnVlXG4gICAgbGlrZTogdHJ1ZVxuICAgIG1laDogdHJ1ZVxuICAgIGJsZWg6IHRydWVcbiAgICBoYXRlOiB0cnVlXG5cbiAgZ29vZE9waW5pb25zOiAjIGRvbid0IHNraXAgdGhlc2VcbiAgICBsb3ZlOiB0cnVlXG4gICAgbGlrZTogdHJ1ZVxuXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxuICAgIG1laDogdHJ1ZVxuXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcbiAgICBibGVoOiB0cnVlXG4gICAgaGF0ZTogdHJ1ZVxuXG4gIG9waW5pb25PcmRlcjogWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcbiIsImZpbHRlckRhdGFiYXNlID0gbnVsbFxuZmlsdGVyT3BpbmlvbnMgPSB7fVxuXG5maWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG51bGxcbmZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBudWxsXG5pc284NjAxID0gcmVxdWlyZSAnaXNvODYwMS1kdXJhdGlvbidcblxubGFzdE9yZGVyZWQgPSBmYWxzZVxuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxuXG5pc09yZGVyZWQgPSAtPlxuICByZXR1cm4gbGFzdE9yZGVyZWRcblxuZ2VuZXJhdGVMaXN0ID0gKGZpbHRlclN0cmluZywgc29ydEJ5QXJ0aXN0ID0gZmFsc2UpIC0+XG4gIGxhc3RPcmRlcmVkID0gZmFsc2VcbiAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcbiAgICBzb2xvRmlsdGVycyA9IFtdXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXG4gICAgICAjIE5vIGZpbHRlcnNcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cbiAgICAgIHJldHVybiBudWxsXG5cbiAgc29sb1VubGlzdGVkID0ge31cbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxuICBpZiBzb2xvRmlsdGVycz9cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxuXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgcGllY2VzWzBdID09IFwib3JkZXJlZFwiXG4gICAgICAgIGxhc3RPcmRlcmVkID0gdHJ1ZVxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBuZWdhdGVkID0gZmFsc2VcbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxuXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcbiAgICAgIGlkTG9va3VwID0gbnVsbFxuXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cblxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ25vbmUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ2Z1bGwnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxuICAgICAgICB3aGVuICd1bicsICd1bCcsICd1bmxpc3RlZCdcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxuICAgICAgICAgICAgaWYgaWQubWF0Y2goL14jLylcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlmIG5vdCBpZC5tYXRjaCgvXnlvdXR1YmVfLykgYW5kIG5vdCBpZC5tYXRjaCgvXm10dl8vKVxuICAgICAgICAgICAgICBpZCA9IFwieW91dHViZV8je2lkfVwiXG4gICAgICAgICAgICBwaXBlU3BsaXQgPSBpZC5zcGxpdCgvXFx8LylcbiAgICAgICAgICAgIGlkID0gcGlwZVNwbGl0LnNoaWZ0KClcbiAgICAgICAgICAgIHN0YXJ0ID0gLTFcbiAgICAgICAgICAgIGVuZCA9IC0xXG4gICAgICAgICAgICBpZiBwaXBlU3BsaXQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KHBpcGVTcGxpdC5zaGlmdCgpKVxuICAgICAgICAgICAgaWYgcGlwZVNwbGl0Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXG4gICAgICAgICAgICB0aXRsZSA9IGlkXG4gICAgICAgICAgICBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL155b3V0dWJlXyguKykvKVxuICAgICAgICAgICAgICB0aXRsZSA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgIGVsc2UgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9ebXR2XyguKykvKVxuICAgICAgICAgICAgICB0aXRsZSA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgIHNvbG9Vbmxpc3RlZFtpZF0gPVxuICAgICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICAgICAgYXJ0aXN0OiAnVW5saXN0ZWQgVmlkZW9zJ1xuICAgICAgICAgICAgICB0aXRsZTogdGl0bGVcbiAgICAgICAgICAgICAgdGFnczoge31cbiAgICAgICAgICAgICAgbmlja25hbWU6ICdVbmxpc3RlZCdcbiAgICAgICAgICAgICAgY29tcGFueTogJ1VubGlzdGVkJ1xuICAgICAgICAgICAgICB0aHVtYjogJ3VubGlzdGVkLnBuZydcbiAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0XG4gICAgICAgICAgICAgIGVuZDogZW5kXG4gICAgICAgICAgICAgIHVubGlzdGVkOiB0cnVlXG5cbiAgICAgICAgICAgICMgZm9yY2Utc2tpcCBhbnkgcHJlLWV4aXN0aW5nIERCIHZlcnNpb25zIG9mIHRoaXMgSURcbiAgICAgICAgICAgIGlmIGZpbHRlckRhdGFiYXNlW2lkXT9cbiAgICAgICAgICAgICAgZmlsdGVyRGF0YWJhc2VbaWRdLnNraXBwZWQgPSB0cnVlXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgaWYgaWRMb29rdXA/XG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cbiAgICAgICAgICBpZiBub3QgZT9cbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxuICAgICAgICAgIGlmIG5lZ2F0ZWRcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxuICAgICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxuXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuICBlbHNlXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuXG4gIGZvciBrLCB1bmxpc3RlZCBvZiBzb2xvVW5saXN0ZWRcbiAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIHVubGlzdGVkXG5cbiAgaWYgc29ydEJ5QXJ0aXN0IGFuZCBub3QgbGFzdE9yZGVyZWRcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcblxuY2FsY0lkSW5mbyA9IChpZCkgLT5cbiAgaWYgbm90IG1hdGNoZXMgPSBpZC5tYXRjaCgvXihbYS16XSspXyhcXFMrKS8pXG4gICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgSUQ6ICN7aWR9XCJcbiAgICByZXR1cm4gbnVsbFxuICBwcm92aWRlciA9IG1hdGNoZXNbMV1cbiAgcmVhbCA9IG1hdGNoZXNbMl1cblxuICBzd2l0Y2ggcHJvdmlkZXJcbiAgICB3aGVuICd5b3V0dWJlJ1xuICAgICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7cmVhbH1cIlxuICAgIHdoZW4gJ210didcbiAgICAgIHVybCA9IFwiL3ZpZGVvcy8je3JlYWx9Lm1wNFwiXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgUHJvdmlkZXI6ICN7cHJvdmlkZXJ9XCJcbiAgICAgIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIHtcbiAgICBpZDogaWRcbiAgICBwcm92aWRlcjogcHJvdmlkZXJcbiAgICByZWFsOiByZWFsXG4gICAgdXJsOiB1cmxcbiAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHNldFNlcnZlckRhdGFiYXNlczogc2V0U2VydmVyRGF0YWJhc2VzXG4gIGlzT3JkZXJlZDogaXNPcmRlcmVkXG4gIGdlbmVyYXRlTGlzdDogZ2VuZXJhdGVMaXN0XG4gIGNhbGNJZEluZm86IGNhbGNJZEluZm9cbiJdfQ==
