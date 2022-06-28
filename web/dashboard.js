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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSIsInNyYy9maWx0ZXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkEsSUFBQSxrQkFBQSxFQUFBLFVBQUEsRUFBQSxpQkFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsbUJBQUEsRUFBQSxtQkFBQSxFQUFBLGVBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVB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RFA7TUFFSSxHQUFBLEdBQU0sQ0FBQSxpQkFBQSxDQUFBLENBQW9CLElBQXBCLENBQUE7QUFESDtBQURQLFNBR08sS0FIUDtNQUlJLEdBQUEsR0FBTSxDQUFBLFFBQUEsQ0FBQSxDQUFXLElBQVgsQ0FBQSxJQUFBO0FBREg7QUFIUDtNQU1JLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSwwQkFBQSxDQUFBLENBQTZCLFFBQTdCLENBQUEsQ0FBWjtBQUNBLGFBQU87QUFQWDtBQVNBLFNBQU87SUFDTCxFQUFBLEVBQUksRUFEQztJQUVMLFFBQUEsRUFBVSxRQUZMO0lBR0wsSUFBQSxFQUFNLElBSEQ7SUFJTCxHQUFBLEVBQUs7RUFKQTtBQWhCSTs7QUF1QmIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLGtCQUFBLEVBQW9CLGtCQUFwQjtFQUNBLFNBQUEsRUFBVyxTQURYO0VBRUEsWUFBQSxFQUFjLFlBRmQ7RUFHQSxVQUFBLEVBQVk7QUFIWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbnNvY2tldCA9IG51bGxcblxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcblxubGFzdENsaWNrZWQgPSBudWxsXG5sYXN0VXNlciA9IG51bGxcbmxhc3RUYWcgPSBudWxsXG5kaXNjb3JkVGFnID0gbnVsbFxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuZGlzY29yZFRva2VuID0gbnVsbFxubGFzdFBsYXllZCA9IG51bGxcblxuc2VhcmNoRW5hYmxlZCA9IGZhbHNlXG5zZWFyY2hTdWJzdHJpbmcgPSBcIlwiXG5cbmRvd25sb2FkQ2FjaGUgPSB7fVxuY2FjaGVFbmFibGVkID0ge1xuICBcIi9pbmZvL3BsYXlsaXN0XCI6IHRydWVcbn1cblxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXG5jYXN0U2Vzc2lvbiA9IG51bGxcblxucmF3TW9kZSA9IGZhbHNlXG5yYXdNb2RlVGFnID0gXCJcIlxuXG5jb252ZXJ0UGxheWxpc3RNb2RlID0gbnVsbFxuY29udmVydFBsYXlsaXN0RGF0YSA9IG51bGxcblxub3Bpbmlvbk9yZGVyID0gY29uc3RhbnRzLm9waW5pb25PcmRlclxub3BpbmlvbkJ1dHRvbk9yZGVyID0gW11cbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcbiAgb3BpbmlvbkJ1dHRvbk9yZGVyLnB1c2ggb1xub3BpbmlvbkJ1dHRvbk9yZGVyLnB1c2goJ25vbmUnKVxuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFnZUVwb2NoID0gbm93KClcblxucXMgPSAobmFtZSkgLT5cbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cbiAgICByZXR1cm4gbnVsbFxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXG5cbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cbiAgdW5pdHMgPSBbXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxuICAgIHsgc3VmZml4OiBcInNcIiwgZmFjdG9yOiAxLCBza2lwOiBmYWxzZSB9XG4gIF1cblxuICBzdHIgPSBcIlwiXG4gIGZvciB1bml0IGluIHVuaXRzXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxuICAgIGlmICh1ID4gMCkgb3Igbm90IHVuaXQuc2tpcFxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXG4gICAgICAgIHN0ciArPSBcIjpcIlxuICAgICAgICBpZiB1IDwgMTBcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcbiAgICAgIHN0ciArPSBTdHJpbmcodSlcbiAgcmV0dXJuIHN0clxuXG5wcmV0dHlEdXJhdGlvbiA9IChlKSAtPlxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XG4gIGlmIHN0YXJ0VGltZSA8IDBcbiAgICBzdGFydFRpbWUgPSAwXG4gIGVuZFRpbWUgPSBlLmVuZFxuICBpZiBlbmRUaW1lIDwgMFxuICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcblxuU09SVF9OT05FID0gMFxuU09SVF9BUlRJU1RfVElUTEUgPSAxXG5TT1JUX0FEREVEID0gMlxuXG5yZW5kZXJFbnRyaWVzID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XG4gIGh0bWwgPSBcIlwiXG5cbiAgaWYgaXNNYXBcbiAgICAjIGNvbnNvbGUubG9nIGVudHJpZXNcbiAgICBtID0gZW50cmllc1xuICAgIGVudHJpZXMgPSBbXVxuICAgIGZvciBrLCB2IG9mIG1cbiAgICAgIGVudHJpZXMucHVzaCB2XG5cbiAgc3dpdGNoIHNvcnRNZXRob2RcbiAgICB3aGVuIFNPUlRfQVJUSVNUX1RJVExFXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgd2hlbiBTT1JUX0FEREVEXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XG4gICAgICAgIGlmIGEuYWRkZWQgPiBiLmFkZGVkXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEuYWRkZWQgPCBiLmFkZGVkXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICBpZiBub3QgZmlyc3RUaXRsZT8gYW5kIG5vdCByZXN0VGl0bGU/IGFuZCB0YWdGaWx0ZXI/XG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5UYWc6ICN7dGFnRmlsdGVyfTwvZGl2PlxuICAgIFwiXCJcIlxuXG4gIGxvd2VyY2FzZVNlYXJjaCA9IHNlYXJjaFN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgZm9yIGUsIGVudHJ5SW5kZXggaW4gZW50cmllc1xuICAgIGlmIHRhZ0ZpbHRlcj8gYW5kIG5vdCBlLnRhZ3NbdGFnRmlsdGVyXT9cbiAgICAgIGNvbnRpbnVlXG5cbiAgICBhcnRpc3QgPSBlLmFydGlzdFxuICAgIGlmIG5vdCBhcnRpc3Q/XG4gICAgICBhcnRpc3QgPSBcIlVua25vd25cIlxuICAgIHRpdGxlID0gZS50aXRsZVxuICAgIGlmIG5vdCB0aXRsZT9cbiAgICAgIHRpdGxlID0gZS5pZFxuXG4gICAgaWYgc2VhcmNoRW5hYmxlZCBhbmQgKGxvd2VyY2FzZVNlYXJjaC5sZW5ndGggPiAwKVxuICAgICAgaWYgKGFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YobG93ZXJjYXNlU2VhcmNoKSA9PSAtMSkgYW5kICh0aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobG93ZXJjYXNlU2VhcmNoKSA9PSAtMSlcbiAgICAgICAgY29udGludWVcblxuICAgIHBhcmFtcyA9IFwiXCJcbiAgICBpZiBlLnN0YXJ0ID49IDBcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcbiAgICBpZiBlLmVuZCA+PSAwXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcblxuICAgIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhlLmlkKVxuICAgIGlmIG5vdCBpZEluZm8/XG4gICAgICBjb250aW51ZVxuICAgIHVybCA9IGlkSW5mby51cmwgKyBwYXJhbXNcblxuICAgIGV4dHJhSW5mbyA9IFwiXCJcbiAgICB0YWdzID0gW11cbiAgICBmb3IgdGFnIG9mIGUudGFnc1xuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3RhZ31cIlxuICAgICAgdGFncy5wdXNoIHRhZ1xuICAgIGlmIHRhZ3MubGVuZ3RoID4gMFxuICAgICAgdGFnU3RyaW5nID0gXCIgLSA8c3BhbiBjbGFzcz1cXFwicmF3dGFnc1xcXCI+XCIgKyB0YWdzLmpvaW4oXCI8L3NwYW4+LCA8c3BhbiBjbGFzcz1cXFwicmF3dGFnc1xcXCI+XCIpICsgXCI8L3NwYW4+XCJcbiAgICBlbHNlXG4gICAgICB0YWdTdHJpbmcgPSBcIlwiXG4gICAgaWYgKGUuc3RhcnQgIT0gLTEpIG9yICAoZS5lbmQgIT0gLTEpXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7cHJldHR5RHVyYXRpb24oZSl9XCJcbiAgICBpZiBlLm9waW5pb25zP1xuICAgICAgZm9yIGZlZWxpbmcsIGNvdW50IG9mIGUub3BpbmlvbnNcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2NvdW50fSAje2ZlZWxpbmd9I3tpZiBjb3VudCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXG5cbiAgICBpZiBmaXJzdFRpdGxlP1xuICAgICAgaWYgKGVudHJ5SW5kZXggPT0gMClcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmlyc3RUaXRsZVwiPiN7Zmlyc3RUaXRsZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlld0NvbnRhaW5lclwiPjxpbWcgY2xhc3M9XCJwcmV2aWV3XCIgc3JjPVwiI3tlLnRodW1ifVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2UgaWYgKGVudHJ5SW5kZXggPT0gMSlcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaWYgZGlzY29yZFRhZ1xuICAgICAgYWN0aW9ucyA9IFwiXCIgIyBcIiBbIERvIHN0dWZmIGFzICN7ZGlzY29yZFRhZ30gXVwiXG4gICAgZWxzZVxuICAgICAgYWN0aW9ucyA9IFwiXCJcblxuICAgIHN3aXRjaCByYXdNb2RlXG4gICAgICB3aGVuIFwiZWRpdFwiXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSBDT01NQU5ESEVSRTwvc3Bhbj4gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIHdoZW4gXCJzb2xvXCJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PmlkICN7ZS5pZH0gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3thcnRpc3R9IC0gI3t0aXRsZX08L2E+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgd2hlbiBcInRhZ1wiXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSB0YWcgI3tyYXdNb2RlVGFnfTwvc3Bhbj4gfCA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XG5cbiAgICAgICAgXCJcIlwiXG4gIHJldHVybiBodG1sXG5cblxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGlmIGRvd25sb2FkQ2FjaGVbdXJsXT9cbiAgICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGU6ICN7dXJsfVwiXG4gICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBkb3dubG9hZENhY2hlW3VybF0sIGlzTWFwLCBzb3J0TWV0aG9kLCB0YWdGaWx0ZXIpKVxuICAgICAgcmV0dXJuXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZzogI3t1cmx9XCJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgaWYgY2FjaGVFbmFibGVkW3VybF1cbiAgICAgICAgICAgICAgIGRvd25sb2FkQ2FjaGVbdXJsXSA9IGVudHJpZXNcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKFwiRXJyb3JcIilcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxudXBkYXRlT3RoZXIgPSAtPlxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgIHRyeVxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgY29uc29sZS5sb2cgb3RoZXJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiwgXCJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcbiAgICAgICAgICAgIGlmIHJlbWFpbmluZ0NvdW50ID4gMFxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxuXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiI3tvdGhlci5wbGF5aW5nfSBXYXRjaGluZyN7bmFtZVN0cmluZ31cIlxuICAgICAgICAgIGxhc3RQbGF5ZWQgPSBvdGhlci5jdXJyZW50XG4gICAgICAgICAgaWYgZGlzY29yZFRva2VuP1xuICAgICAgICAgICAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBsYXN0UGxheWVkLmlkIH1cbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAjIG5vdGhpbmc/XG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9vdGhlclwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuc2hvd1BsYXlpbmcgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXG5cbnNob3dRdWV1ZSA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxuXG5zaG93Qm90aCA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgbGVmdFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxuICByaWdodFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj4je2xlZnRTaWRlfTwvZGl2PlxuICAgIDxkaXYgaWQ9XCJtYWluclwiPiN7cmlnaHRTaWRlfTwvZGl2PlxuICBcIlwiXCJcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dCb3RoXG5cbmVuYWJsZVNlYXJjaCA9IChlbmFibGVkKSAtPlxuICBzZWFyY2hFbmFibGVkID0gZW5hYmxlZFxuICBpZiBlbmFibGVkXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgc2VhcmNoU3Vic3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaGlucHV0JykudmFsdWVcbiAgZWxzZVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgc2VhcmNoU3Vic3RyaW5nID0gXCJcIlxuXG5cbnNlYXJjaENoYW5nZWQgPSAtPlxuICBpZiBub3Qgc2VhcmNoRW5hYmxlZFxuICAgIHJldHVyblxuICBpZiBub3QgZG93bmxvYWRDYWNoZVtcIi9pbmZvL3BsYXlsaXN0XCJdP1xuICAgIHJldHVyblxuICBzZWFyY2hTdWJzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoaW5wdXQnKS52YWx1ZVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXG5cbnNob3dQbGF5bGlzdCA9IC0+XG4gIGVuYWJsZVNlYXJjaCh0cnVlKVxuICBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0gPSBudWxsICMgZG9uJ3QgY2FjaGUgaWYgdGhleSBjbGljayBvbiBBbGxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XG5cbnNob3dSZWNlbnQgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FEREVEKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1JlY2VudFxuXG5zaG93VGFnID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUsIGxhc3RUYWcpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93VGFnXG5cbnNob3dMaXN0cyA9IC0+XG4gIGh0bWwgPSBcIlwiXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICB0cnlcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgaWYgYS5uaWNrbmFtZSA8IGIubmlja25hbWVcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhLm5pY2tuYW1lID4gYi5uaWNrbmFtZVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGEubmFtZS50b0xvd2VyQ2FzZSgpID4gYi5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIHJldHVybiAwXG5cbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlB1YmxpYyBVc2VyIFBsYXlsaXN0czo8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGxhc3ROaWNrbmFtZSA9IG51bGxcbiAgICAgICAgICBmb3IgZSBpbiBlbnRyaWVzXG4gICAgICAgICAgICBpZiBsYXN0Tmlja25hbWU/IGFuZCAobGFzdE5pY2tuYW1lICE9IGUubmlja25hbWUpXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIvcC8je2VuY29kZVVSSUNvbXBvbmVudChlLm5pY2tuYW1lKX0vI3tlbmNvZGVVUklDb21wb25lbnQoZS5uYW1lKX1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3tlLm5pY2tuYW1lfTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSBocmVmPVwiL3AvI3tlbmNvZGVVUklDb21wb25lbnQoZS5uaWNrbmFtZSl9LyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmFtZSl9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3tlLm5hbWV9PC9zcGFuPjwvYT48L2Rpdj5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbGFzdE5pY2tuYW1lID0gZS5uaWNrbmFtZVxuXG4gICAgICAgY2F0Y2hcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXJwbGF5bGlzdHNcIiwgdHJ1ZSlcbiAgeGh0dHAuc2VuZCgpXG5cbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dMaXN0c1xuXG5zaG93Q29udmVydGVkUGxheWxpc3QgPSAtPlxuICBpZiBub3QgZGlzY29yZFRva2VuP1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIE5vdCBhdXRob3JpemVkLlxuICAgIFwiXCJcIlxuICAgIHJldHVyblxuXG4gIGlmIGNvbnZlcnRQbGF5bGlzdERhdGE/XG4gICAgaWYgbm90IEFycmF5LmlzQXJyYXkoY29udmVydFBsYXlsaXN0RGF0YSlcbiAgICAgIGNvbnZlcnRQbGF5bGlzdERhdGEgPSBbXVxuXG4gICAgcGxheWxpc3RPdXRwdXQgPSBcInVuXCJcbiAgICBmb3IgaWQgaW4gY29udmVydFBsYXlsaXN0RGF0YVxuICAgICAgcGxheWxpc3RPdXRwdXQgKz0gXCIgI3tpZH1cIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIENvbnZlcnRlZCBZb3V0dWJlIFBsYXlsaXN0OiAje2NvbnZlcnRQbGF5bGlzdE1vZGV9PGJyPlxuICAgICAgPGJyPlxuICAgICAgPHNwYW4gY2xhc3M9XCJjb252ZXJ0b3V0cHV0XCI+I3twbGF5bGlzdE91dHB1dH08L3NwYW4+XG4gICAgXCJcIlwiXG4gICAgcmV0dXJuXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiXCJcIlxuICAgIENvbnZlcnRpbmcgWW91dHViZSBQbGF5bGlzdDogI3tjb252ZXJ0UGxheWxpc3RNb2RlfVxuICBcIlwiXCJcblxuc2hvd1N0YXRzID0gLT5cbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgIHRyeVxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICBtID0gZW50cmllc1xuICAgICAgICAgIGVudHJpZXMgPSBbXVxuICAgICAgICAgIGZvciBrLCB2IG9mIG1cbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XG5cbiAgICAgICAgICB0b3RhbER1cmF0aW9uID0gMFxuXG4gICAgICAgICAgdXNlckNvdW50cyA9IHt9XG4gICAgICAgICAgdGFnQ291bnRzID0ge31cbiAgICAgICAgICBmb3IgZSBpbiBlbnRyaWVzXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdID89IDBcbiAgICAgICAgICAgIHVzZXJDb3VudHNbZS5uaWNrbmFtZV0gKz0gMVxuICAgICAgICAgICAgc3RhcnRUaW1lID0gZS5zdGFydFxuICAgICAgICAgICAgaWYgc3RhcnRUaW1lIDwgMFxuICAgICAgICAgICAgICBzdGFydFRpbWUgPSAwXG4gICAgICAgICAgICBlbmRUaW1lID0gZS5lbmRcbiAgICAgICAgICAgIGlmIGVuZFRpbWUgPCAwXG4gICAgICAgICAgICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcbiAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gKz0gZHVyYXRpb25cblxuICAgICAgICAgICAgZm9yIHRhZ05hbWUgb2YgZS50YWdzXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSA/PSAwXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSArPSAxXG5cbiAgICAgICAgICB1c2VyTGlzdCA9IE9iamVjdC5rZXlzKHVzZXJDb3VudHMpXG4gICAgICAgICAgdXNlckxpc3Quc29ydCAoYSwgYikgLT5cbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXG4gICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdID4gdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgIHJldHVybiAwXG5cbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxuICAgICAgICAgIHRpbWVVbml0cyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2RheScsIGZhY3RvcjogMzYwMCAqIDI0IH1cbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnbWluJywgZmFjdG9yOiA2MCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdzZWNvbmQnLCBmYWN0b3I6IDEgfVxuICAgICAgICAgIF1cbiAgICAgICAgICBmb3IgdW5pdCBpbiB0aW1lVW5pdHNcbiAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb24gPj0gdW5pdC5mYWN0b3JcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gLT0gYW10ICogdW5pdC5mYWN0b3JcbiAgICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvblN0cmluZy5sZW5ndGggIT0gMFxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIje2FtdH0gI3t1bml0Lm5hbWV9I3tpZiBhbXQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxuXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPkJhc2ljIFN0YXRzOjwvZGl2PlxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBTb25nczogI3tlbnRyaWVzLmxlbmd0aH08L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cblxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZm9yIHVzZXIgaW4gdXNlckxpc3RcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHVzZXIpfVwiPiN7dXNlcn08L2E+OiAje3VzZXJDb3VudHNbdXNlcl19PC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+U29uZ3MgYnkgVGFnOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHRhZ05hbWVzID0gT2JqZWN0LmtleXModGFnQ291bnRzKS5zb3J0KClcbiAgICAgICAgICBmb3IgdGFnTmFtZSBpbiB0YWdOYW1lc1xuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3RhZy8je2VuY29kZVVSSUNvbXBvbmVudCh0YWdOYW1lKX1cIj4je3RhZ05hbWV9PC9hPjogI3t0YWdDb3VudHNbdGFnTmFtZV19PC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICMgaHRtbCA9IFwiPHByZT5cIiArIEpTT04uc3RyaW5naWZ5KHVzZXJDb3VudHMsIG51bGwsIDIpICsgXCI8L3ByZT5cIlxuXG4gICAgICAgY2F0Y2hcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93U3RhdHNcblxuc2hvd1VzZXIgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBodG1sID0gXCJcIlxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgIHRyeVxuICAgICAgICB1c2VySW5mbyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgY2F0Y2hcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+VXNlcjogI3tsYXN0VXNlcn08L2Rpdj5cbiAgICAgIFwiXCJcIlxuXG4gICAgICBsaXN0SFRNTCA9IFwiXCJcblxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxuICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgIGlmIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddP1xuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xuXG4gICAgICBmb3IgZmVlbGluZyBpbiBzb3J0ZWRGZWVsaW5nc1xuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXIje2ZlZWxpbmd9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5BZGRlZDo8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPVwidXNlcmFkZGVkXCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBpZiBsaXN0SFRNTC5sZW5ndGggPT0gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+KE5vIGluZm8gb24gdGhpcyB1c2VyKTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaGFzSW5jb21pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nKS5sZW5ndGggPiAwXG4gICAgICAgIGhhc091dGdvaW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZykubGVuZ3RoID4gMFxuXG4gICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnMgb3IgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnNcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7dXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZvciBuYW1lLCBpbmNvbWluZyBvZiB1c2VySW5mby5vdGhlck9waW5pb25zLmluY29taW5nXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgICAgaWYgaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmc6PC9saT5cbiAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgb3V0Z29pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5vdXRnb2luZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIG91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgXCJcIlwiXG5cblxuICAgICAgaHRtbCArPSBsaXN0SFRNTFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlciN7ZmVlbGluZ31cIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXSwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxuICAgICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxuICAgICAgLCAwXG5cbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxuXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cbiAgaWYgbm90IGRpc2NvcmRUYWc/IG9yIG5vdCBsYXN0UGxheWVkP1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW1vdGUnKS5pbm5lckhUTUwgPSBcIlwiXG4gICAgcmV0dXJuXG5cbiAgaHRtbCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJvcGluaW9ubmFtZVwiPlxuICBcIlwiXCJcbiAgZm9yIG8gaW4gb3BpbmlvbkJ1dHRvbk9yZGVyIGJ5IC0xXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcbiAgICBpZiBvID09IHBrdC5vcGluaW9uXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxhIGNsYXNzPVwiI3tjbGFzc2VzfVwiIG9uY2xpY2s9XCJzZXRPcGluaW9uKCcje299Jyk7IHJldHVybiBmYWxzZTtcIj4je2NhcG99PC9hPlxuICAgIFwiXCJcIlxuICBodG1sICs9IFwiIC0gPHNwYW4gY2xhc3M9XFxcImVudHJ5YXJ0aXN0XFxcIj4je2xhc3RQbGF5ZWQuYXJ0aXN0fTwvc3Bhbj4gLSA8c3BhbiBjbGFzcz1cXFwiZW50cnl0aXRsZVxcXCI+I3tsYXN0UGxheWVkLnRpdGxlfTwvc3Bhbj48L2Rpdj5cIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBodG1sXG5cbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cbiAgaWYgbm90IGRpc2NvcmRUb2tlbj8gb3Igbm90IGxhc3RQbGF5ZWQ/IG9yIG5vdCBsYXN0UGxheWVkLmlkP1xuICAgIHJldHVyblxuXG4gIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogbGFzdFBsYXllZC5pZCwgc2V0OiBvcGluaW9uLCBzcmM6IFwiZGFzaGJvYXJkXCIgfVxuXG5zaG93V2F0Y2hGb3JtID0gLT5cbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyaW5wdXRcIikuZm9jdXMoKVxuXG5zaG93V2F0Y2hMaW5rID0gLT5cbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbnByb2Nlc3NIYXNoID0gLT5cbiAgaWYgY29udmVydFBsYXlsaXN0TW9kZT9cbiAgICBzaG93Q29udmVydGVkUGxheWxpc3QoKVxuICAgIHJldHVyblxuXG4gIGN1cnJlbnRIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxuICAgIHNob3dVc2VyKClcbiAgICByZXR1cm5cbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3RhZ1xcLyguKykvKVxuICAgIGxhc3RUYWcgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcbiAgICBzaG93VGFnKClcbiAgICByZXR1cm5cbiAgc3dpdGNoIGN1cnJlbnRIYXNoXG4gICAgd2hlbiAnI3F1ZXVlJ1xuICAgICAgc2hvd1F1ZXVlKClcbiAgICB3aGVuICcjYWxsJ1xuICAgICAgc2hvd1BsYXlsaXN0KClcbiAgICB3aGVuICcjcmVjZW50J1xuICAgICAgc2hvd1JlY2VudCgpXG4gICAgd2hlbiAnI2JvdGgnXG4gICAgICBzaG93Qm90aCgpXG4gICAgd2hlbiAnI2xpc3RzJ1xuICAgICAgc2hvd0xpc3RzKClcbiAgICB3aGVuICcjc3RhdHMnXG4gICAgICBzaG93U3RhdHMoKVxuICAgIGVsc2VcbiAgICAgIHNob3dQbGF5aW5nKClcblxubG9nb3V0ID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcbiAgc2VuZElkZW50aXR5KClcblxuc2VuZElkZW50aXR5ID0gLT5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgfVxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXG5cbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxuICBpZiBwa3QuZGlzYWJsZWRcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxuICAgIGlmIHBrdC5uaWNrbmFtZT9cbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cbiAgICBcIlwiXCJcbiAgZWxzZVxuICAgIGRpc2NvcmRUYWcgPSBudWxsXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuICAgIGRpc2NvcmRUb2tlbiA9IG51bGxcblxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXG4gICAgXCJcIlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxuIyAgaWYgbGFzdENsaWNrZWQ/XG4jICAgIGxhc3RDbGlja2VkKClcblxub25Jbml0U3VjY2VzcyA9IC0+XG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcbiAgY2FzdEF2YWlsYWJsZSA9IHRydWVcblxub25FcnJvciA9IChtZXNzYWdlKSAtPlxuXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cbiAgY2FzdFNlc3Npb24gPSBlXG5cbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxuICBpZiBub3QgaXNBbGl2ZVxuICAgIGNhc3RTZXNzaW9uID0gbnVsbFxuXG5wcmVwYXJlQ2FzdCA9IC0+XG4gIGlmIG5vdCBjaHJvbWUuY2FzdCBvciBub3QgY2hyb21lLmNhc3QuaXNBdmFpbGFibGVcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXG4gICAgcmV0dXJuXG5cbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxuICBhcGlDb25maWcgPSBuZXcgY2hyb21lLmNhc3QuQXBpQ29uZmlnIHNlc3Npb25SZXF1ZXN0LCBzZXNzaW9uTGlzdGVuZXIsIC0+XG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxuXG5zdGFydENhc3QgPSAtPlxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcblxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJjYXN0P1wiICsgcXVlcnlzdHJpbmdcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxuICBjaHJvbWUuY2FzdC5yZXF1ZXN0U2Vzc2lvbiAoZSkgLT5cbiAgICBjYXN0U2Vzc2lvbiA9IGVcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXG4gICwgb25FcnJvclxuXG5pbml0ID0gLT5cbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXG4gIHdpbmRvdy5zaG93TGlzdHMgPSBzaG93TGlzdHNcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xuICB3aW5kb3cuc2hvd1VzZXIgPSBzaG93VXNlclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXG4gIHdpbmRvdy5zdGFydENhc3QgPSBzdGFydENhc3RcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXG4gIHdpbmRvdy5zZWFyY2hDaGFuZ2VkID0gc2VhcmNoQ2hhbmdlZFxuXG4gIHJhd01vZGUgPSBxcygncmF3JylcbiAgaWYgcmF3TW9kZT9cbiAgICBpZiBtYXRjaGVzID0gcmF3TW9kZS5tYXRjaCgvXnRhZ18oLispLylcbiAgICAgIHJhd01vZGUgPSBcInRhZ1wiXG4gICAgICByYXdNb2RlVGFnID0gbWF0Y2hlc1sxXVxuXG4gIGNvbnZlcnRQbGF5bGlzdE1vZGUgPSBxcygnbGlzdCcpXG5cbiAgdG9rZW4gPSBxcygndG9rZW4nKVxuICBpZiB0b2tlbj9cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbilcbiAgICB3aW5kb3cubG9jYXRpb24gPSAnLydcbiAgICByZXR1cm5cblxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxuICBwcm9jZXNzSGFzaCgpXG5cbiAgc29ja2V0ID0gaW8oKVxuXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XG4gICAgIyBzd2l0Y2ggd2hpY2ggbGluZSBpcyBjb21tZW50ZWQgaGVyZSB0byBhbGxvdyBpZGVudGl0eSBvbiB0aGUgZGFzaFxuICAgIHNlbmRJZGVudGl0eSgpXG4gICAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcblxuICAgIGlmIGNvbnZlcnRQbGF5bGlzdE1vZGU/XG4gICAgICBjb25zb2xlLmxvZyBcImVtaXR0aW5nIGNvbnZlcnRwbGF5bGlzdFwiXG4gICAgICBzb2NrZXQuZW1pdCAnY29udmVydHBsYXlsaXN0JywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBsaXN0OiBjb252ZXJ0UGxheWxpc3RNb2RlIH1cblxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxuICAgIGlmIGxhc3RDbGlja2VkP1xuICAgICAgbGFzdENsaWNrZWQoKVxuXG4gIHNvY2tldC5vbiAncmVmcmVzaCcsIChwa3QpIC0+XG4gICAgaWYgbGFzdENsaWNrZWQ/XG4gICAgICBsYXN0Q2xpY2tlZCgpXG5cbiAgc29ja2V0Lm9uICdpZGVudGlmeScsIChwa3QpIC0+XG4gICAgcmVjZWl2ZUlkZW50aXR5KHBrdClcblxuICBzb2NrZXQub24gJ29waW5pb24nLCAocGt0KSAtPlxuICAgIHVwZGF0ZU9waW5pb24ocGt0KVxuXG4gIHNvY2tldC5vbiAnY29udmVydHBsYXlsaXN0JywgKHBrdCkgLT5cbiAgICBjb252ZXJ0UGxheWxpc3REYXRhID0gcGt0XG4gICAgc2hvd0NvbnZlcnRlZFBsYXlsaXN0KClcblxuICBwcmVwYXJlQ2FzdCgpXG5cbndpbmRvdy5vbmxvYWQgPSBpbml0XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIG9waW5pb25zOlxuICAgIGxvdmU6IHRydWVcbiAgICBsaWtlOiB0cnVlXG4gICAgbWVoOiB0cnVlXG4gICAgYmxlaDogdHJ1ZVxuICAgIGhhdGU6IHRydWVcblxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxuICAgIGxvdmU6IHRydWVcbiAgICBsaWtlOiB0cnVlXG5cbiAgd2Vha09waW5pb25zOiAjIHNraXAgdGhlc2UgaWYgd2UgYWxsIGFncmVlXG4gICAgbWVoOiB0cnVlXG5cbiAgYmFkT3BpbmlvbnM6ICMgc2tpcCB0aGVzZVxuICAgIGJsZWg6IHRydWVcbiAgICBoYXRlOiB0cnVlXG5cbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXG5maWx0ZXJPcGluaW9ucyA9IHt9XG5cbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5sYXN0T3JkZXJlZCA9IGZhbHNlXG5cbm5vdyA9IC0+XG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxuXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxuICBmaWx0ZXJEYXRhYmFzZSA9IGRiXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXG5cbmlzT3JkZXJlZCA9IC0+XG4gIHJldHVybiBsYXN0T3JkZXJlZFxuXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cbiAgbGFzdE9yZGVyZWQgPSBmYWxzZVxuICBzb2xvRmlsdGVycyA9IG51bGxcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxuICAgIHNvbG9GaWx0ZXJzID0gW11cbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcbiAgICAgICMgTm8gZmlsdGVyc1xuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcbiAgZWxzZVxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xuICAgICAgcmV0dXJuIG51bGxcblxuICBzb2xvVW5saXN0ZWQgPSB7fVxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXG4gIGlmIHNvbG9GaWx0ZXJzP1xuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXG5cbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvICsvKVxuICAgICAgaWYgcGllY2VzWzBdID09IFwicHJpdmF0ZVwiXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJvcmRlcmVkXCJcbiAgICAgICAgbGFzdE9yZGVyZWQgPSB0cnVlXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxuICAgICAgaWYgcGllY2VzWzBdID09IFwic2tpcFwiXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcbiAgICAgIGVsc2UgaWYgcGllY2VzWzBdID09IFwiYW5kXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcbiAgICAgIGlmIHBpZWNlcy5sZW5ndGggPT0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgcHJvcGVydHkgPT0gXCJhbGxvd2VkXCJcbiAgICAgICAgYWxsQWxsb3dlZCA9IGZhbHNlXG5cbiAgICAgIHN1YnN0cmluZyA9IHBpZWNlcy5zbGljZSgxKS5qb2luKFwiIFwiKVxuICAgICAgaWRMb29rdXAgPSBudWxsXG5cbiAgICAgIGlmIG1hdGNoZXMgPSBwaWVjZXNbMF0ubWF0Y2goL14hKC4rKSQvKVxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxuXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdLnRvTG93ZXJDYXNlKClcbiAgICAgIHN3aXRjaCBjb21tYW5kXG4gICAgICAgIHdoZW4gJ2FydGlzdCcsICdiYW5kJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAndGl0bGUnLCAnc29uZydcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAnYWRkZWQnXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLm5pY2tuYW1lID09IHNcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBPYmplY3Qua2V5cyhlLnRhZ3MpLmxlbmd0aCA9PSAwXG4gICAgICAgIHdoZW4gJ3RhZydcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50YWdzW3NdID09IHRydWVcbiAgICAgICAgd2hlbiAncmVjZW50JywgJ3NpbmNlJ1xuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICBkdXJhdGlvbkluU2Vjb25kcyA9IHBhcnNlRHVyYXRpb24oc3Vic3RyaW5nKVxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cbiAgICAgICAgICAgICMgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgcGFyc2UgZHVyYXRpb246ICN7c3Vic3RyaW5nfVwiKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBwYXJzaW5nIGV4Y2VwdGlvbjogI3tzb21lRXhjZXB0aW9ufVwiXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBbI3tzdWJzdHJpbmd9XSAtICN7ZHVyYXRpb25JblNlY29uZHN9XCJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYWRkZWQgPiBzaW5jZVxuICAgICAgICB3aGVuICdsb3ZlJywgJ2xpa2UnLCAnYmxlaCcsICdoYXRlJ1xuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1tlLmlkXT9bZmlsdGVyVXNlcl0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgd2hlbiAnbm9uZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1tlLmlkXT9bZmlsdGVyVXNlcl0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgd2hlbiAnZnVsbCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT5cbiAgICAgICAgICAgIGZ1bGwgPSBlLmFydGlzdC50b0xvd2VyQ2FzZSgpICsgXCIgLSBcIiArIGUudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2lkJywgJ2lkcydcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxuICAgICAgICAgICAgaWYgaWQubWF0Y2goL14jLylcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXG4gICAgICAgIHdoZW4gJ3VuJywgJ3VsJywgJ3VubGlzdGVkJ1xuICAgICAgICAgIGlkTG9va3VwID0ge31cbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgbm90IGlkLm1hdGNoKC9eeW91dHViZV8vKSBhbmQgbm90IGlkLm1hdGNoKC9ebXR2Xy8pXG4gICAgICAgICAgICAgIGlkID0gXCJ5b3V0dWJlXyN7aWR9XCJcbiAgICAgICAgICAgIHBpcGVTcGxpdCA9IGlkLnNwbGl0KC9cXHwvKVxuICAgICAgICAgICAgaWQgPSBwaXBlU3BsaXQuc2hpZnQoKVxuICAgICAgICAgICAgc3RhcnQgPSAtMVxuICAgICAgICAgICAgZW5kID0gLTFcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXG4gICAgICAgICAgICBpZiBwaXBlU3BsaXQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICBlbmQgPSBwYXJzZUludChwaXBlU3BsaXQuc2hpZnQoKSlcbiAgICAgICAgICAgIHRpdGxlID0gaWRcbiAgICAgICAgICAgIGlmIG1hdGNoZXMgPSB0aXRsZS5tYXRjaCgvXnlvdXR1YmVfKC4rKS8pXG4gICAgICAgICAgICAgIHRpdGxlID0gbWF0Y2hlc1sxXVxuICAgICAgICAgICAgZWxzZSBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL15tdHZfKC4rKS8pXG4gICAgICAgICAgICAgIHRpdGxlID0gbWF0Y2hlc1sxXVxuICAgICAgICAgICAgc29sb1VubGlzdGVkW2lkXSA9XG4gICAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgICAgICBhcnRpc3Q6ICdVbmxpc3RlZCBWaWRlb3MnXG4gICAgICAgICAgICAgIHRpdGxlOiB0aXRsZVxuICAgICAgICAgICAgICB0YWdzOiB7fVxuICAgICAgICAgICAgICBuaWNrbmFtZTogJ1VubGlzdGVkJ1xuICAgICAgICAgICAgICBjb21wYW55OiAnVW5saXN0ZWQnXG4gICAgICAgICAgICAgIHRodW1iOiAndW5saXN0ZWQucG5nJ1xuICAgICAgICAgICAgICBzdGFydDogc3RhcnRcbiAgICAgICAgICAgICAgZW5kOiBlbmRcbiAgICAgICAgICAgICAgdW5saXN0ZWQ6IHRydWVcblxuICAgICAgICAgICAgIyBmb3JjZS1za2lwIGFueSBwcmUtZXhpc3RpbmcgREIgdmVyc2lvbnMgb2YgdGhpcyBJRFxuICAgICAgICAgICAgaWYgZmlsdGVyRGF0YWJhc2VbaWRdP1xuICAgICAgICAgICAgICBmaWx0ZXJEYXRhYmFzZVtpZF0uc2tpcHBlZCA9IHRydWVcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICBpZiBpZExvb2t1cD9cbiAgICAgICAgZm9yIGlkIG9mIGlkTG9va3VwXG4gICAgICAgICAgZSA9IGZpbHRlckRhdGFiYXNlW2lkXVxuICAgICAgICAgIGlmIG5vdCBlP1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICBpc01hdGNoID0gdHJ1ZVxuICAgICAgICAgIGlmIG5lZ2F0ZWRcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxuICAgICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgICAgICBpc01hdGNoID0gZmlsdGVyRnVuYyhlLCBzdWJzdHJpbmcpXG4gICAgICAgICAgaWYgbmVnYXRlZFxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgICAgaWYgaXNNYXRjaFxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXG5cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGlmIChlLmFsbG93ZWQgb3IgYWxsQWxsb3dlZCkgYW5kIG5vdCBlLnNraXBwZWRcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXG4gIGVsc2VcbiAgICAjIFF1ZXVlIGl0IGFsbCB1cFxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXG5cbiAgZm9yIGssIHVubGlzdGVkIG9mIHNvbG9Vbmxpc3RlZFxuICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggdW5saXN0ZWRcblxuICBpZiBzb3J0QnlBcnRpc3QgYW5kIG5vdCBsYXN0T3JkZXJlZFxuICAgIHNvbG9VbnNodWZmbGVkLnNvcnQgKGEsIGIpIC0+XG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIHJldHVybiAwXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxuXG5jYWxjSWRJbmZvID0gKGlkKSAtPlxuICBpZiBub3QgbWF0Y2hlcyA9IGlkLm1hdGNoKC9eKFthLXpdKylfKFxcUyspLylcbiAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBJRDogI3tpZH1cIlxuICAgIHJldHVybiBudWxsXG4gIHByb3ZpZGVyID0gbWF0Y2hlc1sxXVxuICByZWFsID0gbWF0Y2hlc1syXVxuXG4gIHN3aXRjaCBwcm92aWRlclxuICAgIHdoZW4gJ3lvdXR1YmUnXG4gICAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tyZWFsfVwiXG4gICAgd2hlbiAnbXR2J1xuICAgICAgdXJsID0gXCIvdmlkZW9zLyN7cmVhbH0ubXA0XCJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBQcm92aWRlcjogI3twcm92aWRlcn1cIlxuICAgICAgcmV0dXJuIG51bGxcblxuICByZXR1cm4ge1xuICAgIGlkOiBpZFxuICAgIHByb3ZpZGVyOiBwcm92aWRlclxuICAgIHJlYWw6IHJlYWxcbiAgICB1cmw6IHVybFxuICB9XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2V0U2VydmVyRGF0YWJhc2VzOiBzZXRTZXJ2ZXJEYXRhYmFzZXNcbiAgaXNPcmRlcmVkOiBpc09yZGVyZWRcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcbiAgY2FsY0lkSW5mbzogY2FsY0lkSW5mb1xuIl19
