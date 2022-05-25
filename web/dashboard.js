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
  var allAllowed, command, durationInSeconds, e, end, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, l, len, len1, len2, len3, m, matches, negated, pieces, pipeSplit, property, rawFilters, ref, ref1, since, soloFilters, soloUnlisted, soloUnshuffled, someException, start, substring, title, unlisted;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSIsInNyYy9maWx0ZXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkEsSUFBQSxrQkFBQSxFQUFBLFVBQUEsRUFBQSxpQkFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsbUJBQUEsRUFBQSxtQkFBQSxFQUFBLGVBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVB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QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWMsWUFEZDtFQUVBLFVBQUEsRUFBWTtBQUZaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXHJcbmZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbmxhc3RDbGlja2VkID0gbnVsbFxyXG5sYXN0VXNlciA9IG51bGxcclxubGFzdFRhZyA9IG51bGxcclxuZGlzY29yZFRhZyA9IG51bGxcclxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG5kaXNjb3JkVG9rZW4gPSBudWxsXHJcbmxhc3RQbGF5ZWQgPSBudWxsXHJcblxyXG5zZWFyY2hFbmFibGVkID0gZmFsc2Vcclxuc2VhcmNoU3Vic3RyaW5nID0gXCJcIlxyXG5cclxuZG93bmxvYWRDYWNoZSA9IHt9XHJcbmNhY2hlRW5hYmxlZCA9IHtcclxuICBcIi9pbmZvL3BsYXlsaXN0XCI6IHRydWVcclxufVxyXG5cclxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXHJcbmNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxucmF3TW9kZSA9IGZhbHNlXHJcbnJhd01vZGVUYWcgPSBcIlwiXHJcblxyXG5jb252ZXJ0UGxheWxpc3RNb2RlID0gbnVsbFxyXG5jb252ZXJ0UGxheWxpc3REYXRhID0gbnVsbFxyXG5cclxub3Bpbmlvbk9yZGVyID0gY29uc3RhbnRzLm9waW5pb25PcmRlclxyXG5vcGluaW9uQnV0dG9uT3JkZXIgPSBbXVxyXG5mb3IgbyBpbiBjb25zdGFudHMub3Bpbmlvbk9yZGVyXHJcbiAgb3BpbmlvbkJ1dHRvbk9yZGVyLnB1c2ggb1xyXG5vcGluaW9uQnV0dG9uT3JkZXIucHVzaCgnbm9uZScpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFnZUVwb2NoID0gbm93KClcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5zZWNvbmRzVG9UaW1lID0gKHQpIC0+XHJcbiAgdW5pdHMgPSBbXHJcbiAgICB7IHN1ZmZpeDogXCJoXCIsIGZhY3RvcjogMzYwMCwgc2tpcDogdHJ1ZSB9XHJcbiAgICB7IHN1ZmZpeDogXCJtXCIsIGZhY3RvcjogNjAsIHNraXA6IGZhbHNlIH1cclxuICAgIHsgc3VmZml4OiBcInNcIiwgZmFjdG9yOiAxLCBza2lwOiBmYWxzZSB9XHJcbiAgXVxyXG5cclxuICBzdHIgPSBcIlwiXHJcbiAgZm9yIHVuaXQgaW4gdW5pdHNcclxuICAgIHUgPSBNYXRoLmZsb29yKHQgLyB1bml0LmZhY3RvcilcclxuICAgIGlmICh1ID4gMCkgb3Igbm90IHVuaXQuc2tpcFxyXG4gICAgICB0IC09IHUgKiB1bml0LmZhY3RvclxyXG4gICAgICBpZiBzdHIubGVuZ3RoID4gMFxyXG4gICAgICAgIHN0ciArPSBcIjpcIlxyXG4gICAgICAgIGlmIHUgPCAxMFxyXG4gICAgICAgICAgc3RyICs9IFwiMFwiXHJcbiAgICAgIHN0ciArPSBTdHJpbmcodSlcclxuICByZXR1cm4gc3RyXHJcblxyXG5wcmV0dHlEdXJhdGlvbiA9IChlKSAtPlxyXG4gIHN0YXJ0VGltZSA9IGUuc3RhcnRcclxuICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICBzdGFydFRpbWUgPSAwXHJcbiAgZW5kVGltZSA9IGUuZW5kXHJcbiAgaWYgZW5kVGltZSA8IDBcclxuICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXHJcbiAgcmV0dXJuIFwiI3tzZWNvbmRzVG9UaW1lKHN0YXJ0VGltZSl9LSN7c2Vjb25kc1RvVGltZShlbmRUaW1lKX1cIlxyXG5cclxuU09SVF9OT05FID0gMFxyXG5TT1JUX0FSVElTVF9USVRMRSA9IDFcclxuU09SVF9BRERFRCA9IDJcclxuXHJcbnJlbmRlckVudHJpZXMgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cclxuICBodG1sID0gXCJcIlxyXG5cclxuICBpZiBpc01hcFxyXG4gICAgIyBjb25zb2xlLmxvZyBlbnRyaWVzXHJcbiAgICBtID0gZW50cmllc1xyXG4gICAgZW50cmllcyA9IFtdXHJcbiAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gIHN3aXRjaCBzb3J0TWV0aG9kXHJcbiAgICB3aGVuIFNPUlRfQVJUSVNUX1RJVExFXHJcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgcmV0dXJuIDBcclxuICAgIHdoZW4gU09SVF9BRERFRFxyXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgaWYgYS5hZGRlZCA+IGIuYWRkZWRcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEuYWRkZWQgPCBiLmFkZGVkXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICByZXR1cm4gMFxyXG5cclxuICBpZiBub3QgZmlyc3RUaXRsZT8gYW5kIG5vdCByZXN0VGl0bGU/IGFuZCB0YWdGaWx0ZXI/XHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+VGFnOiAje3RhZ0ZpbHRlcn08L2Rpdj5cclxuICAgIFwiXCJcIlxyXG5cclxuICBsb3dlcmNhc2VTZWFyY2ggPSBzZWFyY2hTdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG5cclxuICBmb3IgZSwgZW50cnlJbmRleCBpbiBlbnRyaWVzXHJcbiAgICBpZiB0YWdGaWx0ZXI/IGFuZCBub3QgZS50YWdzW3RhZ0ZpbHRlcl0/XHJcbiAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgYXJ0aXN0ID0gZS5hcnRpc3RcclxuICAgIGlmIG5vdCBhcnRpc3Q/XHJcbiAgICAgIGFydGlzdCA9IFwiVW5rbm93blwiXHJcbiAgICB0aXRsZSA9IGUudGl0bGVcclxuICAgIGlmIG5vdCB0aXRsZT9cclxuICAgICAgdGl0bGUgPSBlLmlkXHJcblxyXG4gICAgaWYgc2VhcmNoRW5hYmxlZCBhbmQgKGxvd2VyY2FzZVNlYXJjaC5sZW5ndGggPiAwKVxyXG4gICAgICBpZiAoYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKSBhbmQgKHRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKVxyXG4gICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgcGFyYW1zID0gXCJcIlxyXG4gICAgaWYgZS5zdGFydCA+PSAwXHJcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXHJcbiAgICAgIHBhcmFtcyArPSBcInN0YXJ0PSN7ZS5zdGFydH1cIlxyXG4gICAgaWYgZS5lbmQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJlbmQ9I3tlLmVuZH1cIlxyXG5cclxuICAgIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhlLmlkKVxyXG4gICAgaWYgbm90IGlkSW5mbz9cclxuICAgICAgY29udGludWVcclxuICAgIHVybCA9IGlkSW5mby51cmwgKyBwYXJhbXNcclxuXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICB0YWdzID0gW11cclxuICAgIGZvciB0YWcgb2YgZS50YWdzXHJcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3t0YWd9XCJcclxuICAgICAgdGFncy5wdXNoIHRhZ1xyXG4gICAgaWYgdGFncy5sZW5ndGggPiAwXHJcbiAgICAgIHRhZ1N0cmluZyA9IFwiIC0gPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiICsgdGFncy5qb2luKFwiPC9zcGFuPiwgPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiKSArIFwiPC9zcGFuPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHRhZ1N0cmluZyA9IFwiXCJcclxuICAgIGlmIChlLnN0YXJ0ICE9IC0xKSBvciAgKGUuZW5kICE9IC0xKVxyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7cHJldHR5RHVyYXRpb24oZSl9XCJcclxuICAgIGlmIGUub3BpbmlvbnM/XHJcbiAgICAgIGZvciBmZWVsaW5nLCBjb3VudCBvZiBlLm9waW5pb25zXHJcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2NvdW50fSAje2ZlZWxpbmd9I3tpZiBjb3VudCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgaWYgZmlyc3RUaXRsZT9cclxuICAgICAgaWYgKGVudHJ5SW5kZXggPT0gMClcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZpcnN0VGl0bGVcIj4je2ZpcnN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlld0NvbnRhaW5lclwiPjxpbWcgY2xhc3M9XCJwcmV2aWV3XCIgc3JjPVwiI3tlLnRodW1ifVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICBlbHNlIGlmIChlbnRyeUluZGV4ID09IDEpXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je3Jlc3RUaXRsZX08L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICBpZiBkaXNjb3JkVGFnXHJcbiAgICAgIGFjdGlvbnMgPSBcIlwiICMgXCIgWyBEbyBzdHVmZiBhcyAje2Rpc2NvcmRUYWd9IF1cIlxyXG4gICAgZWxzZVxyXG4gICAgICBhY3Rpb25zID0gXCJcIlxyXG5cclxuICAgIHN3aXRjaCByYXdNb2RlXHJcbiAgICAgIHdoZW4gXCJlZGl0XCJcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSBDT01NQU5ESEVSRTwvc3Bhbj4gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICB3aGVuIFwic29sb1wiXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXY+aWQgI3tlLmlkfSAjIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je2FydGlzdH0gLSAje3RpdGxlfTwvYT48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgd2hlbiBcInRhZ1wiXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXY+PHNwYW4gY2xhc3M9XFxcInNlbGVjdGFsbFxcXCI+I210diBlZGl0ICN7ZS5pZH0gdGFnICN7cmF3TW9kZVRhZ308L3NwYW4+IHwgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4je3RhZ1N0cmluZ308L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XHJcblxyXG4gICAgICAgIFwiXCJcIlxyXG4gIHJldHVybiBodG1sXHJcblxyXG5cclxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICBpZiBkb3dubG9hZENhY2hlW3VybF0/XHJcbiAgICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGU6ICN7dXJsfVwiXHJcbiAgICAgIHJlc29sdmUocmVuZGVyRW50cmllcyhmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGRvd25sb2FkQ2FjaGVbdXJsXSwgaXNNYXAsIHNvcnRNZXRob2QsIHRhZ0ZpbHRlcikpXHJcbiAgICAgIHJldHVyblxyXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZzogI3t1cmx9XCJcclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICBpZiBjYWNoZUVuYWJsZWRbdXJsXVxyXG4gICAgICAgICAgICAgICBkb3dubG9hZENhY2hlW3VybF0gPSBlbnRyaWVzXHJcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBvdGhlclxyXG4gICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lIGluIG90aGVyLm5hbWVzXHJcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiLCBcIlxyXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gbmFtZVxyXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcclxuICAgICAgICAgICAgaWYgcmVtYWluaW5nQ291bnQgPiAwXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiArICN7cmVtYWluaW5nQ291bnR9IGFub25cIlxyXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxyXG5cclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWluZ1wiKS5pbm5lckhUTUwgPSBcIiN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9XCJcclxuICAgICAgICAgIGxhc3RQbGF5ZWQgPSBvdGhlci5jdXJyZW50XHJcbiAgICAgICAgICBpZiBkaXNjb3JkVG9rZW4/XHJcbiAgICAgICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogbGFzdFBsYXllZC5pZCB9XHJcbiAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICMgbm90aGluZz9cclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dQbGF5aW5nID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXHJcblxyXG5zaG93UXVldWUgPSAtPlxyXG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxyXG5cclxuc2hvd0JvdGggPSAtPlxyXG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcclxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XHJcbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cclxuICBcIlwiXCJcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxyXG5cclxuZW5hYmxlU2VhcmNoID0gKGVuYWJsZWQpIC0+XHJcbiAgc2VhcmNoRW5hYmxlZCA9IGVuYWJsZWRcclxuICBpZiBlbmFibGVkXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXHJcbiAgZWxzZVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIHNlYXJjaFN1YnN0cmluZyA9IFwiXCJcclxuXHJcblxyXG5zZWFyY2hDaGFuZ2VkID0gLT5cclxuICBpZiBub3Qgc2VhcmNoRW5hYmxlZFxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGRvd25sb2FkQ2FjaGVbXCIvaW5mby9wbGF5bGlzdFwiXT9cclxuICAgIHJldHVyblxyXG4gIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBlbmFibGVTZWFyY2godHJ1ZSlcclxuICBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0gPSBudWxsICMgZG9uJ3QgY2FjaGUgaWYgdGhleSBjbGljayBvbiBBbGxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93UmVjZW50ID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQURERUQpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1JlY2VudFxyXG5cclxuc2hvd1RhZyA9IC0+XHJcbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSwgbGFzdFRhZylcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VGFnXHJcblxyXG5zaG93TGlzdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPCBiLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPiBiLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICBpZiBhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5QdWJsaWMgVXNlciBQbGF5bGlzdHM6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBsYXN0Tmlja25hbWUgPSBudWxsXHJcbiAgICAgICAgICBmb3IgZSBpbiBlbnRyaWVzXHJcbiAgICAgICAgICAgIGlmIGxhc3ROaWNrbmFtZT8gYW5kIChsYXN0Tmlja25hbWUgIT0gZS5uaWNrbmFtZSlcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIvcC8je2VuY29kZVVSSUNvbXBvbmVudChlLm5pY2tuYW1lKX0vI3tlbmNvZGVVUklDb21wb25lbnQoZS5uYW1lKX1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3tlLm5pY2tuYW1lfTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSBocmVmPVwiL3AvI3tlbmNvZGVVUklDb21wb25lbnQoZS5uaWNrbmFtZSl9LyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmFtZSl9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3tlLm5hbWV9PC9zcGFuPjwvYT48L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGxhc3ROaWNrbmFtZSA9IGUubmlja25hbWVcclxuXHJcbiAgICAgICBjYXRjaFxyXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vdXNlcnBsYXlsaXN0c1wiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93TGlzdHNcclxuXHJcbnNob3dDb252ZXJ0ZWRQbGF5bGlzdCA9IC0+XHJcbiAgaWYgbm90IGRpc2NvcmRUb2tlbj9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgICAgTm90IGF1dGhvcml6ZWQuXHJcbiAgICBcIlwiXCJcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBjb252ZXJ0UGxheWxpc3REYXRhP1xyXG4gICAgaWYgbm90IEFycmF5LmlzQXJyYXkoY29udmVydFBsYXlsaXN0RGF0YSlcclxuICAgICAgY29udmVydFBsYXlsaXN0RGF0YSA9IFtdXHJcblxyXG4gICAgcGxheWxpc3RPdXRwdXQgPSBcInVuXCJcclxuICAgIGZvciBpZCBpbiBjb252ZXJ0UGxheWxpc3REYXRhXHJcbiAgICAgIHBsYXlsaXN0T3V0cHV0ICs9IFwiICN7aWR9XCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgICAgQ29udmVydGVkIFlvdXR1YmUgUGxheWxpc3Q6ICN7Y29udmVydFBsYXlsaXN0TW9kZX08YnI+XHJcbiAgICAgIDxicj5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJjb252ZXJ0b3V0cHV0XCI+I3twbGF5bGlzdE91dHB1dH08L3NwYW4+XHJcbiAgICBcIlwiXCJcclxuICAgIHJldHVyblxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICBDb252ZXJ0aW5nIFlvdXR1YmUgUGxheWxpc3Q6ICN7Y29udmVydFBsYXlsaXN0TW9kZX1cclxuICBcIlwiXCJcclxuXHJcbnNob3dTdGF0cyA9IC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICB0cnlcclxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIG0gPSBlbnRyaWVzXHJcbiAgICAgICAgICBlbnRyaWVzID0gW11cclxuICAgICAgICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uID0gMFxyXG5cclxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxyXG4gICAgICAgICAgdGFnQ291bnRzID0ge31cclxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXHJcbiAgICAgICAgICAgIHVzZXJDb3VudHNbZS5uaWNrbmFtZV0gKz0gMVxyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgICAgICAgICAgICBzdGFydFRpbWUgPSAwXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSBlLmVuZFxyXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgICAgICAgICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXHJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxyXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXHJcblxyXG4gICAgICAgICAgICBmb3IgdGFnTmFtZSBvZiBlLnRhZ3NcclxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gPz0gMFxyXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSArPSAxXHJcblxyXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxyXG4gICAgICAgICAgdXNlckxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA8IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdID4gdXNlckNvdW50c1tiXVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG5cclxuICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2RheScsIGZhY3RvcjogMzYwMCAqIDI0IH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnaG91cicsIGZhY3RvcjogMzYwMCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWNvbmQnLCBmYWN0b3I6IDEgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXHJcbiAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb24gPj0gdW5pdC5mYWN0b3JcclxuICAgICAgICAgICAgICBhbXQgPSBNYXRoLmZsb29yKHRvdGFsRHVyYXRpb24gLyB1bml0LmZhY3RvcilcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvblN0cmluZy5sZW5ndGggIT0gMFxyXG4gICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiwgXCJcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBTb25nczogI3tlbnRyaWVzLmxlbmd0aH08L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBEdXJhdGlvbjogI3t0b3RhbER1cmF0aW9uU3RyaW5nfTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+U29uZ3MgYnkgVXNlcjo8L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgZm9yIHVzZXIgaW4gdXNlckxpc3RcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBUYWc6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIHRhZ05hbWVzID0gT2JqZWN0LmtleXModGFnQ291bnRzKS5zb3J0KClcclxuICAgICAgICAgIGZvciB0YWdOYW1lIGluIHRhZ05hbWVzXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3RhZy8je2VuY29kZVVSSUNvbXBvbmVudCh0YWdOYW1lKX1cIj4je3RhZ05hbWV9PC9hPjogI3t0YWdDb3VudHNbdGFnTmFtZV19PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICMgaHRtbCA9IFwiPHByZT5cIiArIEpTT04uc3RyaW5naWZ5KHVzZXJDb3VudHMsIG51bGwsIDIpICsgXCI8L3ByZT5cIlxyXG5cclxuICAgICAgIGNhdGNoXHJcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93U3RhdHNcclxuXHJcbnNob3dVc2VyID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHVzZXJJbmZvID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgIGNhdGNoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Vc2VyOiAje2xhc3RVc2VyfTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGxpc3RIVE1MID0gXCJcIlxyXG5cclxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cclxuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xyXG5cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPkFkZGVkOjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4oTm8gaW5mbyBvbiB0aGlzIHVzZXIpPC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBoYXNJbmNvbWluZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmcpLmxlbmd0aCA+IDBcclxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcclxuXHJcbiAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9ucyBvciBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBpbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XHJcbiAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgb3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuXHJcbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyI3tmZWVsaW5nfVwiKS5pbm5lckhUTUwgPSByZW5kZXJFbnRyaWVzKG51bGwsIG51bGwsIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddLCBmYWxzZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gICAgICAsIDBcclxuXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXHJcblxyXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cclxuICBpZiBub3QgZGlzY29yZFRhZz8gb3Igbm90IGxhc3RQbGF5ZWQ/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlJykuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XCJvcGluaW9ubmFtZVwiPlxyXG4gIFwiXCJcIlxyXG4gIGZvciBvIGluIG9waW5pb25CdXR0b25PcmRlciBieSAtMVxyXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXHJcbiAgICBjbGFzc2VzID0gXCJvYnV0dG9cIlxyXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxyXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGh0bWwgKz0gXCIgLSA8c3BhbiBjbGFzcz1cXFwiZW50cnlhcnRpc3RcXFwiPiN7bGFzdFBsYXllZC5hcnRpc3R9PC9zcGFuPiAtIDxzcGFuIGNsYXNzPVxcXCJlbnRyeXRpdGxlXFxcIj4je2xhc3RQbGF5ZWQudGl0bGV9PC9zcGFuPjwvZGl2PlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuc2V0T3BpbmlvbiA9IChvcGluaW9uKSAtPlxyXG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkPyBvciBub3QgbGFzdFBsYXllZC5pZD9cclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQsIHNldDogb3Bpbmlvbiwgc3JjOiBcImRhc2hib2FyZFwiIH1cclxuXHJcbnNob3dXYXRjaEZvcm0gPSAtPlxyXG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FzdGJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG5wcm9jZXNzSGFzaCA9IC0+XHJcbiAgaWYgY29udmVydFBsYXlsaXN0TW9kZT9cclxuICAgIHNob3dDb252ZXJ0ZWRQbGF5bGlzdCgpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgY3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXHJcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1VzZXIoKVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3RhZ1xcLyguKykvKVxyXG4gICAgbGFzdFRhZyA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1RhZygpXHJcbiAgICByZXR1cm5cclxuICBzd2l0Y2ggY3VycmVudEhhc2hcclxuICAgIHdoZW4gJyNxdWV1ZSdcclxuICAgICAgc2hvd1F1ZXVlKClcclxuICAgIHdoZW4gJyNhbGwnXHJcbiAgICAgIHNob3dQbGF5bGlzdCgpXHJcbiAgICB3aGVuICcjcmVjZW50J1xyXG4gICAgICBzaG93UmVjZW50KClcclxuICAgIHdoZW4gJyNib3RoJ1xyXG4gICAgICBzaG93Qm90aCgpXHJcbiAgICB3aGVuICcjbGlzdHMnXHJcbiAgICAgIHNob3dMaXN0cygpXHJcbiAgICB3aGVuICcjc3RhdHMnXHJcbiAgICAgIHNob3dTdGF0cygpXHJcbiAgICBlbHNlXHJcbiAgICAgIHNob3dQbGF5aW5nKClcclxuXHJcbmxvZ291dCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcclxuICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKVxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcclxuIyAgaWYgbGFzdENsaWNrZWQ/XHJcbiMgICAgbGFzdENsaWNrZWQoKVxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcImNhc3Q/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIGNvbnNvbGUubG9nIFwiV2UncmUgZ29pbmcgaGVyZTogI3ttdHZVUkx9XCJcclxuICBjaHJvbWUuY2FzdC5yZXF1ZXN0U2Vzc2lvbiAoZSkgLT5cclxuICAgIGNhc3RTZXNzaW9uID0gZVxyXG4gICAgY2FzdFNlc3Npb24uc2VuZE1lc3NhZ2UoREFTSENBU1RfTkFNRVNQQUNFLCB7IHVybDogbXR2VVJMLCBmb3JjZTogdHJ1ZSB9KVxyXG4gICwgb25FcnJvclxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxyXG4gIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBwcm9jZXNzSGFzaFxyXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXHJcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcclxuICB3aW5kb3cuc2hvd1BsYXlsaXN0ID0gc2hvd1BsYXlsaXN0XHJcbiAgd2luZG93LnNob3dRdWV1ZSA9IHNob3dRdWV1ZVxyXG4gIHdpbmRvdy5zaG93TGlzdHMgPSBzaG93TGlzdHNcclxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXHJcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XHJcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXHJcbiAgd2luZG93LnNlYXJjaENoYW5nZWQgPSBzZWFyY2hDaGFuZ2VkXHJcblxyXG4gIHJhd01vZGUgPSBxcygncmF3JylcclxuICBpZiByYXdNb2RlP1xyXG4gICAgaWYgbWF0Y2hlcyA9IHJhd01vZGUubWF0Y2goL150YWdfKC4rKS8pXHJcbiAgICAgIHJhd01vZGUgPSBcInRhZ1wiXHJcbiAgICAgIHJhd01vZGVUYWcgPSBtYXRjaGVzWzFdXHJcblxyXG4gIGNvbnZlcnRQbGF5bGlzdE1vZGUgPSBxcygnbGlzdCcpXHJcblxyXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcclxuICBpZiB0b2tlbj9cclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKVxyXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwcm9jZXNzSGFzaCgpXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuXHJcbiAgc29ja2V0Lm9uICdjb25uZWN0JywgLT5cclxuICAgICMgc3dpdGNoIHdoaWNoIGxpbmUgaXMgY29tbWVudGVkIGhlcmUgdG8gYWxsb3cgaWRlbnRpdHkgb24gdGhlIGRhc2hcclxuICAgIHNlbmRJZGVudGl0eSgpXHJcbiAgICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxuICAgIGlmIGNvbnZlcnRQbGF5bGlzdE1vZGU/XHJcbiAgICAgIGNvbnNvbGUubG9nIFwiZW1pdHRpbmcgY29udmVydHBsYXlsaXN0XCJcclxuICAgICAgc29ja2V0LmVtaXQgJ2NvbnZlcnRwbGF5bGlzdCcsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgbGlzdDogY29udmVydFBsYXlsaXN0TW9kZSB9XHJcblxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgc29ja2V0Lm9uICdpZGVudGlmeScsIChwa3QpIC0+XHJcbiAgICByZWNlaXZlSWRlbnRpdHkocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ29waW5pb24nLCAocGt0KSAtPlxyXG4gICAgdXBkYXRlT3Bpbmlvbihwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnY29udmVydHBsYXlsaXN0JywgKHBrdCkgLT5cclxuICAgIGNvbnZlcnRQbGF5bGlzdERhdGEgPSBwa3RcclxuICAgIHNob3dDb252ZXJ0ZWRQbGF5bGlzdCgpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBvcGluaW9uczpcclxuICAgIGxvdmU6IHRydWVcclxuICAgIGxpa2U6IHRydWVcclxuICAgIG1laDogdHJ1ZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG5cclxuICB3ZWFrT3BpbmlvbnM6ICMgc2tpcCB0aGVzZSBpZiB3ZSBhbGwgYWdyZWVcclxuICAgIG1laDogdHJ1ZVxyXG5cclxuICBiYWRPcGluaW9uczogIyBza2lwIHRoZXNlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIG9waW5pb25PcmRlcjogWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXHJcbmZpbHRlck9waW5pb25zID0ge31cclxuXHJcbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxyXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxyXG5pc284NjAxID0gcmVxdWlyZSAnaXNvODYwMS1kdXJhdGlvbidcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XHJcbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXHJcblxyXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxyXG4gIGZpbHRlckRhdGFiYXNlID0gZGJcclxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXHJcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cclxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxyXG4gICAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxyXG5cclxuZ2VuZXJhdGVMaXN0ID0gKGZpbHRlclN0cmluZywgc29ydEJ5QXJ0aXN0ID0gZmFsc2UpIC0+XHJcbiAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxyXG4gICAgc29sb0ZpbHRlcnMgPSBbXVxyXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXHJcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcclxuICAgICAgZmlsdGVyID0gZmlsdGVyLnRyaW0oKVxyXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxyXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXHJcbiAgICBpZiBzb2xvRmlsdGVycy5sZW5ndGggPT0gMFxyXG4gICAgICAjIE5vIGZpbHRlcnNcclxuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgY29uc29sZS5sb2cgXCJGaWx0ZXJzOlwiLCBzb2xvRmlsdGVyc1xyXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xyXG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcclxuICBlbHNlXHJcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcclxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gIHNvbG9Vbmxpc3RlZCA9IHt9XHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG4gIGlmIHNvbG9GaWx0ZXJzP1xyXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXHJcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXHJcblxyXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcclxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcclxuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC8gKy8pXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxyXG4gICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBuZWdhdGVkID0gZmFsc2VcclxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxyXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxyXG5cclxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXHJcbiAgICAgIGlkTG9va3VwID0gbnVsbFxyXG5cclxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXHJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXHJcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxyXG5cclxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdhZGRlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXHJcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcclxuICAgICAgICB3aGVuICd0YWcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcclxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cclxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXHJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXHJcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ25vbmUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ2Z1bGwnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxyXG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cclxuICAgICAgICB3aGVuICd1bicsICd1bCcsICd1bmxpc3RlZCdcclxuICAgICAgICAgIGlkTG9va3VwID0ge31cclxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcclxuICAgICAgICAgICAgaWYgaWQubWF0Y2goL14jLylcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBpZiBub3QgaWQubWF0Y2goL155b3V0dWJlXy8pIGFuZCBub3QgaWQubWF0Y2goL15tdHZfLylcclxuICAgICAgICAgICAgICBpZCA9IFwieW91dHViZV8je2lkfVwiXHJcbiAgICAgICAgICAgIHBpcGVTcGxpdCA9IGlkLnNwbGl0KC9cXHwvKVxyXG4gICAgICAgICAgICBpZCA9IHBpcGVTcGxpdC5zaGlmdCgpXHJcbiAgICAgICAgICAgIHN0YXJ0ID0gLTFcclxuICAgICAgICAgICAgZW5kID0gLTFcclxuICAgICAgICAgICAgaWYgcGlwZVNwbGl0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICBzdGFydCA9IHBhcnNlSW50KHBpcGVTcGxpdC5zaGlmdCgpKVxyXG4gICAgICAgICAgICBpZiBwaXBlU3BsaXQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgIGVuZCA9IHBhcnNlSW50KHBpcGVTcGxpdC5zaGlmdCgpKVxyXG4gICAgICAgICAgICB0aXRsZSA9IGlkXHJcbiAgICAgICAgICAgIGlmIG1hdGNoZXMgPSB0aXRsZS5tYXRjaCgvXnlvdXR1YmVfKC4rKS8pXHJcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXHJcbiAgICAgICAgICAgIGVsc2UgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9ebXR2XyguKykvKVxyXG4gICAgICAgICAgICAgIHRpdGxlID0gbWF0Y2hlc1sxXVxyXG4gICAgICAgICAgICBzb2xvVW5saXN0ZWRbaWRdID1cclxuICAgICAgICAgICAgICBpZDogaWRcclxuICAgICAgICAgICAgICBhcnRpc3Q6ICdVbmxpc3RlZCBWaWRlb3MnXHJcbiAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICAgICAgICAgICAgdGFnczoge31cclxuICAgICAgICAgICAgICBuaWNrbmFtZTogJ1VubGlzdGVkJ1xyXG4gICAgICAgICAgICAgIGNvbXBhbnk6ICdVbmxpc3RlZCdcclxuICAgICAgICAgICAgICB0aHVtYjogJ3VubGlzdGVkLnBuZydcclxuICAgICAgICAgICAgICBzdGFydDogc3RhcnRcclxuICAgICAgICAgICAgICBlbmQ6IGVuZFxyXG4gICAgICAgICAgICAgIHVubGlzdGVkOiB0cnVlXHJcblxyXG4gICAgICAgICAgICAjIGZvcmNlLXNraXAgYW55IHByZS1leGlzdGluZyBEQiB2ZXJzaW9ucyBvZiB0aGlzIElEXHJcbiAgICAgICAgICAgIGlmIGZpbHRlckRhdGFiYXNlW2lkXT9cclxuICAgICAgICAgICAgICBmaWx0ZXJEYXRhYmFzZVtpZF0uc2tpcHBlZCA9IHRydWVcclxuICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBpZiBpZExvb2t1cD9cclxuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcclxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cclxuICAgICAgICAgIGlmIG5vdCBlP1xyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgICAgICBpc01hdGNoID0gZmlsdGVyRnVuYyhlLCBzdWJzdHJpbmcpXHJcbiAgICAgICAgICBpZiBuZWdhdGVkXHJcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxyXG4gICAgICAgICAgaWYgaXNNYXRjaFxyXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcclxuXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxyXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxyXG4gIGVsc2VcclxuICAgICMgUXVldWUgaXQgYWxsIHVwXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcblxyXG4gIGZvciBrLCB1bmxpc3RlZCBvZiBzb2xvVW5saXN0ZWRcclxuICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggdW5saXN0ZWRcclxuXHJcbiAgaWYgc29ydEJ5QXJ0aXN0XHJcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICByZXR1cm4gMFxyXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxyXG5cclxuY2FsY0lkSW5mbyA9IChpZCkgLT5cclxuICBpZiBub3QgbWF0Y2hlcyA9IGlkLm1hdGNoKC9eKFthLXpdKylfKFxcUyspLylcclxuICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIElEOiAje2lkfVwiXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHByb3ZpZGVyID0gbWF0Y2hlc1sxXVxyXG4gIHJlYWwgPSBtYXRjaGVzWzJdXHJcblxyXG4gIHN3aXRjaCBwcm92aWRlclxyXG4gICAgd2hlbiAneW91dHViZSdcclxuICAgICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7cmVhbH1cIlxyXG4gICAgd2hlbiAnbXR2J1xyXG4gICAgICB1cmwgPSBcIi92aWRlb3MvI3tyZWFsfS5tcDRcIlxyXG4gICAgZWxzZVxyXG4gICAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBQcm92aWRlcjogI3twcm92aWRlcn1cIlxyXG4gICAgICByZXR1cm4gbnVsbFxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgaWQ6IGlkXHJcbiAgICBwcm92aWRlcjogcHJvdmlkZXJcclxuICAgIHJlYWw6IHJlYWxcclxuICAgIHVybDogdXJsXHJcbiAgfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIHNldFNlcnZlckRhdGFiYXNlczogc2V0U2VydmVyRGF0YWJhc2VzXHJcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcclxuICBjYWxjSWRJbmZvOiBjYWxjSWRJbmZvXHJcbiJdfQ==
