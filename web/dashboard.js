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
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, cacheEnabled, castAvailable, castSession, constants, discordNickname, discordTag, discordToken, downloadCache, enableSearch, filters, i, init, lastClicked, lastPlayed, lastTag, lastUser, len, logout, now, o, onError, onInitSuccess, opinionButtonOrder, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, rawMode, rawModeTag, receiveIdentity, ref, renderEntries, searchChanged, searchEnabled, searchSubstring, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, showBoth, showList, showLists, showPlaying, showPlaylist, showQueue, showRecent, showStats, showTag, showUser, showWatchForm, showWatchLink, socket, startCast, updateOpinion, updateOther;

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
  token = qs('token');
  if (token != null) {
    localStorage.setItem('token', token);
    window.location = '/';
    return;
  }
  processHash();
  socket = io();
  socket.on('connect', function() {
    // switch which line is commented here to allow identity on the dash
    return sendIdentity();
  });
  // document.getElementById("identity").innerHTML = ""
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvODYwMS1kdXJhdGlvbi9saWIvaW5kZXguanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSIsInNyYy9maWx0ZXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkEsSUFBQSxrQkFBQSxFQUFBLFVBQUEsRUFBQSxpQkFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLFVBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFB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RUFBQSxJQUFBLEVBQUE7RUFBRSxJQUFHLENBQUksQ0FBQSxPQUFBLEdBQVUsRUFBRSxDQUFDLEtBQUgsQ0FBUyxpQkFBVCxDQUFWLENBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsb0JBQUEsQ0FBQSxDQUF1QixFQUF2QixDQUFBLENBQVo7QUFDQSxXQUFPLEtBRlQ7O0VBR0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxDQUFEO0VBQ2xCLElBQUEsR0FBTyxPQUFPLENBQUMsQ0FBRDtBQUVkLFVBQU8sUUFBUDtBQUFBLFNBQ08sU0FEUDtNQUVJLEdBQUEsR0FBTSxDQUFBLGlCQUFBLENBQUEsQ0FBb0IsSUFBcEIsQ0FBQTtBQURIO0FBRFAsU0FHTyxLQUhQO01BSUksR0FBQSxHQUFNLENBQUEsUUFBQSxDQUFBLENBQVcsSUFBWCxDQUFBLElBQUE7QUFESDtBQUhQO01BTUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLDBCQUFBLENBQUEsQ0FBNkIsUUFBN0IsQ0FBQSxDQUFaO0FBQ0EsYUFBTztBQVBYO0FBU0EsU0FBTztJQUNMLEVBQUEsRUFBSSxFQURDO0lBRUwsUUFBQSxFQUFVLFFBRkw7SUFHTCxJQUFBLEVBQU0sSUFIRDtJQUlMLEdBQUEsRUFBSztFQUpBO0FBaEJJOztBQXVCYixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsa0JBQUEsRUFBb0Isa0JBQXBCO0VBQ0EsWUFBQSxFQUFjLFlBRGQ7RUFFQSxVQUFBLEVBQVk7QUFGWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbnNvY2tldCA9IG51bGxcblxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcblxubGFzdENsaWNrZWQgPSBudWxsXG5sYXN0VXNlciA9IG51bGxcbmxhc3RUYWcgPSBudWxsXG5kaXNjb3JkVGFnID0gbnVsbFxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuZGlzY29yZFRva2VuID0gbnVsbFxubGFzdFBsYXllZCA9IG51bGxcblxuc2VhcmNoRW5hYmxlZCA9IGZhbHNlXG5zZWFyY2hTdWJzdHJpbmcgPSBcIlwiXG5cbmRvd25sb2FkQ2FjaGUgPSB7fVxuY2FjaGVFbmFibGVkID0ge1xuICBcIi9pbmZvL3BsYXlsaXN0XCI6IHRydWVcbn1cblxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXG5jYXN0U2Vzc2lvbiA9IG51bGxcblxucmF3TW9kZSA9IGZhbHNlXG5yYXdNb2RlVGFnID0gXCJcIlxuXG5vcGluaW9uT3JkZXIgPSBjb25zdGFudHMub3Bpbmlvbk9yZGVyXG5vcGluaW9uQnV0dG9uT3JkZXIgPSBbXVxuZm9yIG8gaW4gY29uc3RhbnRzLm9waW5pb25PcmRlclxuICBvcGluaW9uQnV0dG9uT3JkZXIucHVzaCBvXG5vcGluaW9uQnV0dG9uT3JkZXIucHVzaCgnbm9uZScpXG5cbm5vdyA9IC0+XG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuXG5wYWdlRXBvY2ggPSBub3coKVxuXG5xcyA9IChuYW1lKSAtPlxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxuICAgIHJldHVybiBudWxsXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcblxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxuICB1bml0cyA9IFtcbiAgICB7IHN1ZmZpeDogXCJoXCIsIGZhY3RvcjogMzYwMCwgc2tpcDogdHJ1ZSB9XG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XG4gICAgeyBzdWZmaXg6IFwic1wiLCBmYWN0b3I6IDEsIHNraXA6IGZhbHNlIH1cbiAgXVxuXG4gIHN0ciA9IFwiXCJcbiAgZm9yIHVuaXQgaW4gdW5pdHNcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXG4gICAgaWYgKHUgPiAwKSBvciBub3QgdW5pdC5za2lwXG4gICAgICB0IC09IHUgKiB1bml0LmZhY3RvclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcbiAgICAgICAgc3RyICs9IFwiOlwiXG4gICAgICAgIGlmIHUgPCAxMFxuICAgICAgICAgIHN0ciArPSBcIjBcIlxuICAgICAgc3RyICs9IFN0cmluZyh1KVxuICByZXR1cm4gc3RyXG5cbnByZXR0eUR1cmF0aW9uID0gKGUpIC0+XG4gIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgaWYgc3RhcnRUaW1lIDwgMFxuICAgIHN0YXJ0VGltZSA9IDBcbiAgZW5kVGltZSA9IGUuZW5kXG4gIGlmIGVuZFRpbWUgPCAwXG4gICAgZW5kVGltZSA9IGUuZHVyYXRpb25cbiAgcmV0dXJuIFwiI3tzZWNvbmRzVG9UaW1lKHN0YXJ0VGltZSl9LSN7c2Vjb25kc1RvVGltZShlbmRUaW1lKX1cIlxuXG5TT1JUX05PTkUgPSAwXG5TT1JUX0FSVElTVF9USVRMRSA9IDFcblNPUlRfQURERUQgPSAyXG5cbnJlbmRlckVudHJpZXMgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cbiAgaHRtbCA9IFwiXCJcblxuICBpZiBpc01hcFxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xuICAgIG0gPSBlbnRyaWVzXG4gICAgZW50cmllcyA9IFtdXG4gICAgZm9yIGssIHYgb2YgbVxuICAgICAgZW50cmllcy5wdXNoIHZcblxuICBzd2l0Y2ggc29ydE1ldGhvZFxuICAgIHdoZW4gU09SVF9BUlRJU1RfVElUTEVcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcbiAgICB3aGVuIFNPUlRfQURERURcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgaWYgYS5hZGRlZCA+IGIuYWRkZWRcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hZGRlZCA8IGIuYWRkZWRcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuXG4gIGlmIG5vdCBmaXJzdFRpdGxlPyBhbmQgbm90IHJlc3RUaXRsZT8gYW5kIHRhZ0ZpbHRlcj9cbiAgICBodG1sICs9IFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPlRhZzogI3t0YWdGaWx0ZXJ9PC9kaXY+XG4gICAgXCJcIlwiXG5cbiAgbG93ZXJjYXNlU2VhcmNoID0gc2VhcmNoU3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBmb3IgZSwgZW50cnlJbmRleCBpbiBlbnRyaWVzXG4gICAgaWYgdGFnRmlsdGVyPyBhbmQgbm90IGUudGFnc1t0YWdGaWx0ZXJdP1xuICAgICAgY29udGludWVcblxuICAgIGFydGlzdCA9IGUuYXJ0aXN0XG4gICAgaWYgbm90IGFydGlzdD9cbiAgICAgIGFydGlzdCA9IFwiVW5rbm93blwiXG4gICAgdGl0bGUgPSBlLnRpdGxlXG4gICAgaWYgbm90IHRpdGxlP1xuICAgICAgdGl0bGUgPSBlLmlkXG5cbiAgICBpZiBzZWFyY2hFbmFibGVkIGFuZCAobG93ZXJjYXNlU2VhcmNoLmxlbmd0aCA+IDApXG4gICAgICBpZiAoYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKSBhbmQgKHRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKVxuICAgICAgICBjb250aW51ZVxuXG4gICAgcGFyYW1zID0gXCJcIlxuICAgIGlmIGUuc3RhcnQgPj0gMFxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcbiAgICAgIHBhcmFtcyArPSBcInN0YXJ0PSN7ZS5zdGFydH1cIlxuICAgIGlmIGUuZW5kID49IDBcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXG4gICAgICBwYXJhbXMgKz0gXCJlbmQ9I3tlLmVuZH1cIlxuXG4gICAgaWRJbmZvID0gZmlsdGVycy5jYWxjSWRJbmZvKGUuaWQpXG4gICAgaWYgbm90IGlkSW5mbz9cbiAgICAgIGNvbnRpbnVlXG4gICAgdXJsID0gaWRJbmZvLnVybCArIHBhcmFtc1xuXG4gICAgZXh0cmFJbmZvID0gXCJcIlxuICAgIHRhZ3MgPSBbXVxuICAgIGZvciB0YWcgb2YgZS50YWdzXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7dGFnfVwiXG4gICAgICB0YWdzLnB1c2ggdGFnXG4gICAgaWYgdGFncy5sZW5ndGggPiAwXG4gICAgICB0YWdTdHJpbmcgPSBcIiAtIDxzcGFuIGNsYXNzPVxcXCJyYXd0YWdzXFxcIj5cIiArIHRhZ3Muam9pbihcIjwvc3Bhbj4sIDxzcGFuIGNsYXNzPVxcXCJyYXd0YWdzXFxcIj5cIikgKyBcIjwvc3Bhbj5cIlxuICAgIGVsc2VcbiAgICAgIHRhZ1N0cmluZyA9IFwiXCJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3twcmV0dHlEdXJhdGlvbihlKX1cIlxuICAgIGlmIGUub3BpbmlvbnM/XG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7Y291bnR9ICN7ZmVlbGluZ30je2lmIGNvdW50ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgIGlmIGZpcnN0VGl0bGU/XG4gICAgICBpZiAoZW50cnlJbmRleCA9PSAwKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3Q29udGFpbmVyXCI+PGltZyBjbGFzcz1cInByZXZpZXdcIiBzcmM9XCIje2UudGh1bWJ9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je3Jlc3RUaXRsZX08L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBpZiBkaXNjb3JkVGFnXG4gICAgICBhY3Rpb25zID0gXCJcIiAjIFwiIFsgRG8gc3R1ZmYgYXMgI3tkaXNjb3JkVGFnfSBdXCJcbiAgICBlbHNlXG4gICAgICBhY3Rpb25zID0gXCJcIlxuXG4gICAgc3dpdGNoIHJhd01vZGVcbiAgICAgIHdoZW4gXCJlZGl0XCJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PjxzcGFuIGNsYXNzPVxcXCJzZWxlY3RhbGxcXFwiPiNtdHYgZWRpdCAje2UuaWR9IENPTU1BTkRIRVJFPC9zcGFuPiAjIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+I3t0YWdTdHJpbmd9PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgd2hlbiBcInNvbG9cIlxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXY+aWQgI3tlLmlkfSAjIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je2FydGlzdH0gLSAje3RpdGxlfTwvYT48L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICB3aGVuIFwidGFnXCJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PjxzcGFuIGNsYXNzPVxcXCJzZWxlY3RhbGxcXFwiPiNtdHYgZWRpdCAje2UuaWR9IHRhZyAje3Jhd01vZGVUYWd9PC9zcGFuPiB8IDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+I3t0YWdTdHJpbmd9PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgZWxzZVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXY+ICogPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS5uaWNrbmFtZX0je2V4dHJhSW5mb30pPC9zcGFuPiN7YWN0aW9uc308L2Rpdj5cblxuICAgICAgICBcIlwiXCJcbiAgcmV0dXJuIGh0bWxcblxuXG5zaG93TGlzdCA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIHVybCwgaXNNYXAgPSBmYWxzZSwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgaWYgZG93bmxvYWRDYWNoZVt1cmxdP1xuICAgICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZTogI3t1cmx9XCJcbiAgICAgIHJlc29sdmUocmVuZGVyRW50cmllcyhmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGRvd25sb2FkQ2FjaGVbdXJsXSwgaXNNYXAsIHNvcnRNZXRob2QsIHRhZ0ZpbHRlcikpXG4gICAgICByZXR1cm5cbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nOiAje3VybH1cIlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICBpZiBjYWNoZUVuYWJsZWRbdXJsXVxuICAgICAgICAgICAgICAgZG93bmxvYWRDYWNoZVt1cmxdID0gZW50cmllc1xuICAgICAgICAgICAgIHJlc29sdmUocmVuZGVyRW50cmllcyhmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGVudHJpZXMsIGlzTWFwLCBzb3J0TWV0aG9kLCB0YWdGaWx0ZXIpKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUoXCJFcnJvclwiKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG51cGRhdGVPdGhlciA9IC0+XG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgdHJ5XG4gICAgICAgICAgb3RoZXIgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICBjb25zb2xlLmxvZyBvdGhlclxuICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXG4gICAgICAgICAgaWYgb3RoZXIubmFtZXM/IGFuZCAob3RoZXIubmFtZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSBpbiBvdGhlci5uYW1lc1xuICAgICAgICAgICAgICBpZiBuYW1lU3RyaW5nLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiLCBcIlxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IG5hbWVcbiAgICAgICAgICAgIHJlbWFpbmluZ0NvdW50ID0gb3RoZXIucGxheWluZyAtIG90aGVyLm5hbWVzLmxlbmd0aFxuICAgICAgICAgICAgaWYgcmVtYWluaW5nQ291bnQgPiAwXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIgKyAje3JlbWFpbmluZ0NvdW50fSBhbm9uXCJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIjogI3tuYW1lU3RyaW5nfVwiXG5cbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXlpbmdcIikuaW5uZXJIVE1MID0gXCIje290aGVyLnBsYXlpbmd9IFdhdGNoaW5nI3tuYW1lU3RyaW5nfVwiXG4gICAgICAgICAgbGFzdFBsYXllZCA9IG90aGVyLmN1cnJlbnRcbiAgICAgICAgICBpZiBkaXNjb3JkVG9rZW4/XG4gICAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQgfVxuICAgICAgICBjYXRjaFxuICAgICAgICAgICMgbm90aGluZz9cbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL290aGVyXCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG5zaG93UGxheWluZyA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlpbmdcblxuc2hvd1F1ZXVlID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1F1ZXVlXG5cbnNob3dCb3RoID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXG4gIHJpZ2h0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XG4gICAgPGRpdiBpZD1cIm1haW5yXCI+I3tyaWdodFNpZGV9PC9kaXY+XG4gIFwiXCJcIlxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcblxuZW5hYmxlU2VhcmNoID0gKGVuYWJsZWQpIC0+XG4gIHNlYXJjaEVuYWJsZWQgPSBlbmFibGVkXG4gIGlmIGVuYWJsZWRcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBzZWFyY2hTdWJzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoaW5wdXQnKS52YWx1ZVxuICBlbHNlXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBzZWFyY2hTdWJzdHJpbmcgPSBcIlwiXG5cblxuc2VhcmNoQ2hhbmdlZCA9IC0+XG4gIGlmIG5vdCBzZWFyY2hFbmFibGVkXG4gICAgcmV0dXJuXG4gIGlmIG5vdCBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0/XG4gICAgcmV0dXJuXG4gIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSlcblxuc2hvd1BsYXlsaXN0ID0gLT5cbiAgZW5hYmxlU2VhcmNoKHRydWUpXG4gIGRvd25sb2FkQ2FjaGVbXCIvaW5mby9wbGF5bGlzdFwiXSA9IG51bGwgIyBkb24ndCBjYWNoZSBpZiB0aGV5IGNsaWNrIG9uIEFsbFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWxpc3Rcblxuc2hvd1JlY2VudCA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQURERUQpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UmVjZW50XG5cbnNob3dUYWcgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSwgbGFzdFRhZylcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dUYWdcblxuc2hvd0xpc3RzID0gLT5cbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgIHRyeVxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICBpZiBhLm5pY2tuYW1lIDwgYi5uaWNrbmFtZVxuICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPiBiLm5pY2tuYW1lXG4gICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8IGIubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgcmV0dXJuIDBcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+UHVibGljIFVzZXIgUGxheWxpc3RzOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgbGFzdE5pY2tuYW1lID0gbnVsbFxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcbiAgICAgICAgICAgIGlmIGxhc3ROaWNrbmFtZT8gYW5kIChsYXN0Tmlja25hbWUgIT0gZS5uaWNrbmFtZSlcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIi9wLyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChlLm5hbWUpfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2Uubmlja25hbWV9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIGhyZWY9XCIvcC8je2VuY29kZVVSSUNvbXBvbmVudChlLm5pY2tuYW1lKX0vI3tlbmNvZGVVUklDb21wb25lbnQoZS5uYW1lKX1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je2UubmFtZX08L3NwYW4+PC9hPjwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBsYXN0Tmlja25hbWUgPSBlLm5pY2tuYW1lXG5cbiAgICAgICBjYXRjaFxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vdXNlcnBsYXlsaXN0c1wiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd0xpc3RzXG5cbnNob3dTdGF0cyA9IC0+XG4gIGh0bWwgPSBcIlwiXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICB0cnlcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgbSA9IGVudHJpZXNcbiAgICAgICAgICBlbnRyaWVzID0gW11cbiAgICAgICAgICBmb3IgaywgdiBvZiBtXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcblxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxuICAgICAgICAgIHRhZ0NvdW50cyA9IHt9XG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdICs9IDFcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXG5cbiAgICAgICAgICAgIGZvciB0YWdOYW1lIG9mIGUudGFnc1xuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gPz0gMFxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gKz0gMVxuXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICByZXR1cm4gMFxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cbiAgICAgICAgICBdXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFRhZzo8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ0NvdW50cykuc29ydCgpXG4gICAgICAgICAgZm9yIHRhZ05hbWUgaW4gdGFnTmFtZXNcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN0YWcvI3tlbmNvZGVVUklDb21wb25lbnQodGFnTmFtZSl9XCI+I3t0YWdOYW1lfTwvYT46ICN7dGFnQ291bnRzW3RhZ05hbWVdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcblxuICAgICAgIGNhdGNoXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXG5cbnNob3dVc2VyID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICB0cnlcbiAgICAgICAgdXNlckluZm8gPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgIGNhdGNoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XG4gICAgICBcIlwiXCJcblxuICAgICAgbGlzdEhUTUwgPSBcIlwiXG5cbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cbiAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcblxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+QWRkZWQ6PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPihObyBpbmZvIG9uIHRoaXMgdXNlcik8L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIGhhc0luY29taW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZykubGVuZ3RoID4gMFxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcblxuICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zIG9yIGhhc091dGdvaW5nT3BpbmlvbnNcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIGluY29taW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XG4gICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgICBpZiBvdXRnb2luZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIFwiXCJcIlxuXG5cbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXIje2ZlZWxpbmd9XCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10sIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICwgMFxuXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1VzZXJcblxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XG4gIGlmIG5vdCBkaXNjb3JkVGFnPyBvciBub3QgbGFzdFBsYXllZD9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlJykuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGh0bWwgPSBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwib3Bpbmlvbm5hbWVcIj5cbiAgXCJcIlwiXG4gIGZvciBvIGluIG9waW5pb25CdXR0b25PcmRlciBieSAtMVxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxuICAgIGNsYXNzZXMgPSBcIm9idXR0b1wiXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxuICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cbiAgICBcIlwiXCJcbiAgaHRtbCArPSBcIiAtIDxzcGFuIGNsYXNzPVxcXCJlbnRyeWFydGlzdFxcXCI+I3tsYXN0UGxheWVkLmFydGlzdH08L3NwYW4+IC0gPHNwYW4gY2xhc3M9XFxcImVudHJ5dGl0bGVcXFwiPiN7bGFzdFBsYXllZC50aXRsZX08L3NwYW4+PC9kaXY+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxuXG5zZXRPcGluaW9uID0gKG9waW5pb24pIC0+XG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkPyBvciBub3QgbGFzdFBsYXllZC5pZD9cbiAgICByZXR1cm5cblxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQsIHNldDogb3Bpbmlvbiwgc3JjOiBcImRhc2hib2FyZFwiIH1cblxuc2hvd1dhdGNoRm9ybSA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcblxuc2hvd1dhdGNoTGluayA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG5wcm9jZXNzSGFzaCA9IC0+XG4gIGN1cnJlbnRIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxuICAgIHNob3dVc2VyKClcbiAgICByZXR1cm5cbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3RhZ1xcLyguKykvKVxuICAgIGxhc3RUYWcgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcbiAgICBzaG93VGFnKClcbiAgICByZXR1cm5cbiAgc3dpdGNoIGN1cnJlbnRIYXNoXG4gICAgd2hlbiAnI3F1ZXVlJ1xuICAgICAgc2hvd1F1ZXVlKClcbiAgICB3aGVuICcjYWxsJ1xuICAgICAgc2hvd1BsYXlsaXN0KClcbiAgICB3aGVuICcjcmVjZW50J1xuICAgICAgc2hvd1JlY2VudCgpXG4gICAgd2hlbiAnI2JvdGgnXG4gICAgICBzaG93Qm90aCgpXG4gICAgd2hlbiAnI2xpc3RzJ1xuICAgICAgc2hvd0xpc3RzKClcbiAgICB3aGVuICcjc3RhdHMnXG4gICAgICBzaG93U3RhdHMoKVxuICAgIGVsc2VcbiAgICAgIHNob3dQbGF5aW5nKClcblxubG9nb3V0ID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcbiAgc2VuZElkZW50aXR5KClcblxuc2VuZElkZW50aXR5ID0gLT5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgfVxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXG5cbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxuICBpZiBwa3QuZGlzYWJsZWRcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxuICAgIGlmIHBrdC5uaWNrbmFtZT9cbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cbiAgICBcIlwiXCJcbiAgZWxzZVxuICAgIGRpc2NvcmRUYWcgPSBudWxsXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuICAgIGRpc2NvcmRUb2tlbiA9IG51bGxcblxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXG4gICAgXCJcIlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxuIyAgaWYgbGFzdENsaWNrZWQ/XG4jICAgIGxhc3RDbGlja2VkKClcblxub25Jbml0U3VjY2VzcyA9IC0+XG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcbiAgY2FzdEF2YWlsYWJsZSA9IHRydWVcblxub25FcnJvciA9IChtZXNzYWdlKSAtPlxuXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cbiAgY2FzdFNlc3Npb24gPSBlXG5cbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxuICBpZiBub3QgaXNBbGl2ZVxuICAgIGNhc3RTZXNzaW9uID0gbnVsbFxuXG5wcmVwYXJlQ2FzdCA9IC0+XG4gIGlmIG5vdCBjaHJvbWUuY2FzdCBvciBub3QgY2hyb21lLmNhc3QuaXNBdmFpbGFibGVcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXG4gICAgcmV0dXJuXG5cbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxuICBhcGlDb25maWcgPSBuZXcgY2hyb21lLmNhc3QuQXBpQ29uZmlnIHNlc3Npb25SZXF1ZXN0LCBzZXNzaW9uTGlzdGVuZXIsIC0+XG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxuXG5zdGFydENhc3QgPSAtPlxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcblxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJjYXN0P1wiICsgcXVlcnlzdHJpbmdcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxuICBjaHJvbWUuY2FzdC5yZXF1ZXN0U2Vzc2lvbiAoZSkgLT5cbiAgICBjYXN0U2Vzc2lvbiA9IGVcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXG4gICwgb25FcnJvclxuXG5pbml0ID0gLT5cbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXG4gIHdpbmRvdy5zaG93TGlzdHMgPSBzaG93TGlzdHNcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xuICB3aW5kb3cuc2hvd1VzZXIgPSBzaG93VXNlclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXG4gIHdpbmRvdy5zdGFydENhc3QgPSBzdGFydENhc3RcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXG4gIHdpbmRvdy5zZWFyY2hDaGFuZ2VkID0gc2VhcmNoQ2hhbmdlZFxuXG4gIHJhd01vZGUgPSBxcygncmF3JylcbiAgaWYgcmF3TW9kZT9cbiAgICBpZiBtYXRjaGVzID0gcmF3TW9kZS5tYXRjaCgvXnRhZ18oLispLylcbiAgICAgIHJhd01vZGUgPSBcInRhZ1wiXG4gICAgICByYXdNb2RlVGFnID0gbWF0Y2hlc1sxXVxuXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcbiAgaWYgdG9rZW4/XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgdG9rZW4pXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXG4gICAgcmV0dXJuXG5cbiAgcHJvY2Vzc0hhc2goKVxuXG4gIHNvY2tldCA9IGlvKClcblxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxuICAgICMgc3dpdGNoIHdoaWNoIGxpbmUgaXMgY29tbWVudGVkIGhlcmUgdG8gYWxsb3cgaWRlbnRpdHkgb24gdGhlIGRhc2hcbiAgICBzZW5kSWRlbnRpdHkoKVxuICAgICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXG5cbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICBpZiBsYXN0Q2xpY2tlZD9cbiAgICAgIGxhc3RDbGlja2VkKClcblxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxuICAgIGlmIGxhc3RDbGlja2VkP1xuICAgICAgbGFzdENsaWNrZWQoKVxuXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXG5cbiAgc29ja2V0Lm9uICdvcGluaW9uJywgKHBrdCkgLT5cbiAgICB1cGRhdGVPcGluaW9uKHBrdClcblxuICBwcmVwYXJlQ2FzdCgpXG5cbndpbmRvdy5vbmxvYWQgPSBpbml0XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIG9waW5pb25zOlxuICAgIGxvdmU6IHRydWVcbiAgICBsaWtlOiB0cnVlXG4gICAgbWVoOiB0cnVlXG4gICAgYmxlaDogdHJ1ZVxuICAgIGhhdGU6IHRydWVcblxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxuICAgIGxvdmU6IHRydWVcbiAgICBsaWtlOiB0cnVlXG5cbiAgd2Vha09waW5pb25zOiAjIHNraXAgdGhlc2UgaWYgd2UgYWxsIGFncmVlXG4gICAgbWVoOiB0cnVlXG5cbiAgYmFkT3BpbmlvbnM6ICMgc2tpcCB0aGVzZVxuICAgIGJsZWg6IHRydWVcbiAgICBoYXRlOiB0cnVlXG5cbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxuIiwiZmlsdGVyRGF0YWJhc2UgPSBudWxsXG5maWx0ZXJPcGluaW9ucyA9IHt9XG5cbmZpbHRlclNlcnZlck9waW5pb25zID0gbnVsbFxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcblxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxuICBmaWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG9waW5pb25zXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxuICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XG4gICAgICBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBnZXQgdXNlciBvcGluaW9ucyBmb3IgI3tmaWx0ZXJVc2VyfVwiKVxuXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cbiAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcbiAgICBzb2xvRmlsdGVycyA9IFtdXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXG4gICAgICAjIE5vIGZpbHRlcnNcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cbiAgICAgIHJldHVybiBudWxsXG5cbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxuICBpZiBzb2xvRmlsdGVycz9cbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxuXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBuZWdhdGVkID0gZmFsc2VcbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxuXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcbiAgICAgIGlkTG9va3VwID0gbnVsbFxuXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cblxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ25vbmUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ2Z1bGwnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgaWYgaWRMb29rdXA/XG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cbiAgICAgICAgICBpZiBub3QgZT9cbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxuICAgICAgICAgIGlmIG5lZ2F0ZWRcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxuICAgICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxuXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuICBlbHNlXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxuXG4gIGlmIHNvcnRCeUFydGlzdFxuICAgIHNvbG9VbnNodWZmbGVkLnNvcnQgKGEsIGIpIC0+XG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIHJldHVybiAwXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxuXG5jYWxjSWRJbmZvID0gKGlkKSAtPlxuICBpZiBub3QgbWF0Y2hlcyA9IGlkLm1hdGNoKC9eKFthLXpdKylfKFxcUyspLylcbiAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBJRDogI3tpZH1cIlxuICAgIHJldHVybiBudWxsXG4gIHByb3ZpZGVyID0gbWF0Y2hlc1sxXVxuICByZWFsID0gbWF0Y2hlc1syXVxuXG4gIHN3aXRjaCBwcm92aWRlclxuICAgIHdoZW4gJ3lvdXR1YmUnXG4gICAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tyZWFsfVwiXG4gICAgd2hlbiAnbXR2J1xuICAgICAgdXJsID0gXCIvdmlkZW9zLyN7cmVhbH0ubXA0XCJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBQcm92aWRlcjogI3twcm92aWRlcn1cIlxuICAgICAgcmV0dXJuIG51bGxcblxuICByZXR1cm4ge1xuICAgIGlkOiBpZFxuICAgIHByb3ZpZGVyOiBwcm92aWRlclxuICAgIHJlYWw6IHJlYWxcbiAgICB1cmw6IHVybFxuICB9XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2V0U2VydmVyRGF0YWJhc2VzOiBzZXRTZXJ2ZXJEYXRhYmFzZXNcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcbiAgY2FsY0lkSW5mbzogY2FsY0lkSW5mb1xuIl19
