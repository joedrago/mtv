(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, cacheEnabled, castAvailable, castSession, constants, discordNickname, discordTag, discordToken, downloadCache, enableSearch, i, init, lastClicked, lastPlayed, lastTag, lastUser, len, logout, now, o, onError, onInitSuccess, opinionButtonOrder, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, rawMode, rawModeTag, receiveIdentity, ref, renderEntries, searchChanged, searchEnabled, searchSubstring, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, showBoth, showList, showLists, showPlaying, showPlaylist, showQueue, showRecent, showStats, showTag, showUser, showWatchForm, showWatchLink, socket, startCast, updateOpinion, updateOther;

constants = require('../constants');

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
  var actions, artist, count, e, entryIndex, extraInfo, feeling, html, j, k, len1, lowercaseSearch, m, params, ref1, tag, tagString, tags, title, url, v;
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
    url = `https://youtu.be/${e.id}${params}`;
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
  document.getElementById("identity").innerHTML = html;
  if (lastClicked != null) {
    return lastClicked();
  }
};

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
  mtvURL = baseURL + "watch?" + querystring;
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


},{"../constants":2}],2:[function(require,module,exports){
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLGVBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsa0JBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLGVBQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7QUFFWixNQUFBLEdBQVM7O0FBRVQsa0JBQUEsR0FBcUI7O0FBRXJCLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBQ1gsT0FBQSxHQUFVOztBQUNWLFVBQUEsR0FBYTs7QUFDYixlQUFB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QkFBSDthQUNFLFdBQUEsQ0FBQSxFQURGOztFQURnQixDQUFsQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixRQUFBLENBQUMsR0FBRCxDQUFBO0lBQ25CLElBQUcsbUJBQUg7YUFDRSxXQUFBLENBQUEsRUFERjs7RUFEbUIsQ0FBckI7RUFJQSxNQUFNLENBQUMsRUFBUCxDQUFVLFVBQVYsRUFBc0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtXQUNwQixlQUFBLENBQWdCLEdBQWhCO0VBRG9CLENBQXRCO0VBR0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFFBQUEsQ0FBQyxHQUFELENBQUE7V0FDbkIsYUFBQSxDQUFjLEdBQWQ7RUFEbUIsQ0FBckI7U0FHQSxXQUFBLENBQUE7QUFuREs7O0FBcURQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCOzs7O0FDeHdCaEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLFFBQUEsRUFDRTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsSUFBQSxFQUFNLElBRE47SUFFQSxHQUFBLEVBQUssSUFGTDtJQUdBLElBQUEsRUFBTSxJQUhOO0lBSUEsSUFBQSxFQUFNO0VBSk4sQ0FERjtFQU9BLFlBQUEsRUFDRSxDQUFBO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxJQUFBLEVBQU07RUFETixDQVJGO0VBV0EsWUFBQSxFQUNFLENBQUE7SUFBQSxHQUFBLEVBQUs7RUFBTCxDQVpGO0VBY0EsV0FBQSxFQUNFLENBQUE7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLElBQUEsRUFBTTtFQUROLENBZkY7RUFrQkEsWUFBQSxFQUFjO0lBQUMsTUFBRDtJQUFTLE1BQVQ7SUFBaUIsS0FBakI7SUFBd0IsTUFBeEI7SUFBZ0MsTUFBaEM7O0FBbEJkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbmxhc3RDbGlja2VkID0gbnVsbFxyXG5sYXN0VXNlciA9IG51bGxcclxubGFzdFRhZyA9IG51bGxcclxuZGlzY29yZFRhZyA9IG51bGxcclxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG5kaXNjb3JkVG9rZW4gPSBudWxsXHJcbmxhc3RQbGF5ZWQgPSBudWxsXHJcblxyXG5zZWFyY2hFbmFibGVkID0gZmFsc2Vcclxuc2VhcmNoU3Vic3RyaW5nID0gXCJcIlxyXG5cclxuZG93bmxvYWRDYWNoZSA9IHt9XHJcbmNhY2hlRW5hYmxlZCA9IHtcclxuICBcIi9pbmZvL3BsYXlsaXN0XCI6IHRydWVcclxufVxyXG5cclxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXHJcbmNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxucmF3TW9kZSA9IGZhbHNlXHJcbnJhd01vZGVUYWcgPSBcIlwiXHJcblxyXG5vcGluaW9uT3JkZXIgPSBjb25zdGFudHMub3Bpbmlvbk9yZGVyXHJcbm9waW5pb25CdXR0b25PcmRlciA9IFtdXHJcbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxuICBvcGluaW9uQnV0dG9uT3JkZXIucHVzaCBvXHJcbm9waW5pb25CdXR0b25PcmRlci5wdXNoKCdub25lJylcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYWdlRXBvY2ggPSBub3coKVxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cclxuICB1bml0cyA9IFtcclxuICAgIHsgc3VmZml4OiBcImhcIiwgZmFjdG9yOiAzNjAwLCBza2lwOiB0cnVlIH1cclxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxyXG4gICAgeyBzdWZmaXg6IFwic1wiLCBmYWN0b3I6IDEsIHNraXA6IGZhbHNlIH1cclxuICBdXHJcblxyXG4gIHN0ciA9IFwiXCJcclxuICBmb3IgdW5pdCBpbiB1bml0c1xyXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxyXG4gICAgaWYgKHUgPiAwKSBvciBub3QgdW5pdC5za2lwXHJcbiAgICAgIHQgLT0gdSAqIHVuaXQuZmFjdG9yXHJcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXHJcbiAgICAgICAgc3RyICs9IFwiOlwiXHJcbiAgICAgICAgaWYgdSA8IDEwXHJcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcclxuICAgICAgc3RyICs9IFN0cmluZyh1KVxyXG4gIHJldHVybiBzdHJcclxuXHJcbnByZXR0eUR1cmF0aW9uID0gKGUpIC0+XHJcbiAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgIHN0YXJ0VGltZSA9IDBcclxuICBlbmRUaW1lID0gZS5lbmRcclxuICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgZW5kVGltZSA9IGUuZHVyYXRpb25cclxuICByZXR1cm4gXCIje3NlY29uZHNUb1RpbWUoc3RhcnRUaW1lKX0tI3tzZWNvbmRzVG9UaW1lKGVuZFRpbWUpfVwiXHJcblxyXG5TT1JUX05PTkUgPSAwXHJcblNPUlRfQVJUSVNUX1RJVExFID0gMVxyXG5TT1JUX0FEREVEID0gMlxyXG5cclxucmVuZGVyRW50cmllcyA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGVudHJpZXMsIGlzTWFwLCBzb3J0TWV0aG9kID0gU09SVF9OT05FLCB0YWdGaWx0ZXIgPSBudWxsKSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcblxyXG4gIGlmIGlzTWFwXHJcbiAgICAjIGNvbnNvbGUubG9nIGVudHJpZXNcclxuICAgIG0gPSBlbnRyaWVzXHJcbiAgICBlbnRyaWVzID0gW11cclxuICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgc3dpdGNoIHNvcnRNZXRob2RcclxuICAgIHdoZW4gU09SVF9BUlRJU1RfVElUTEVcclxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICByZXR1cm4gMFxyXG4gICAgd2hlbiBTT1JUX0FEREVEXHJcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgICBpZiBhLmFkZGVkID4gYi5hZGRlZFxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS5hZGRlZCA8IGIuYWRkZWRcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIHJldHVybiAwXHJcblxyXG4gIGlmIG5vdCBmaXJzdFRpdGxlPyBhbmQgbm90IHJlc3RUaXRsZT8gYW5kIHRhZ0ZpbHRlcj9cclxuICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5UYWc6ICN7dGFnRmlsdGVyfTwvZGl2PlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGxvd2VyY2FzZVNlYXJjaCA9IHNlYXJjaFN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcblxyXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcclxuICAgIGlmIHRhZ0ZpbHRlcj8gYW5kIG5vdCBlLnRhZ3NbdGFnRmlsdGVyXT9cclxuICAgICAgY29udGludWVcclxuXHJcbiAgICBhcnRpc3QgPSBlLmFydGlzdFxyXG4gICAgaWYgbm90IGFydGlzdD9cclxuICAgICAgYXJ0aXN0ID0gXCJVbmtub3duXCJcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuXHJcbiAgICBpZiBzZWFyY2hFbmFibGVkIGFuZCAobG93ZXJjYXNlU2VhcmNoLmxlbmd0aCA+IDApXHJcbiAgICAgIGlmIChhcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKGxvd2VyY2FzZVNlYXJjaCkgPT0gLTEpIGFuZCAodGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGxvd2VyY2FzZVNlYXJjaCkgPT0gLTEpXHJcbiAgICAgICAgY29udGludWVcclxuXHJcbiAgICBwYXJhbXMgPSBcIlwiXHJcbiAgICBpZiBlLnN0YXJ0ID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwic3RhcnQ9I3tlLnN0YXJ0fVwiXHJcbiAgICBpZiBlLmVuZCA+PSAwXHJcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXHJcbiAgICAgIHBhcmFtcyArPSBcImVuZD0je2UuZW5kfVwiXHJcbiAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tlLmlkfSN7cGFyYW1zfVwiXHJcblxyXG4gICAgZXh0cmFJbmZvID0gXCJcIlxyXG4gICAgdGFncyA9IFtdXHJcbiAgICBmb3IgdGFnIG9mIGUudGFnc1xyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7dGFnfVwiXHJcbiAgICAgIHRhZ3MucHVzaCB0YWdcclxuICAgIGlmIHRhZ3MubGVuZ3RoID4gMFxyXG4gICAgICB0YWdTdHJpbmcgPSBcIiAtIDxzcGFuIGNsYXNzPVxcXCJyYXd0YWdzXFxcIj5cIiArIHRhZ3Muam9pbihcIjwvc3Bhbj4sIDxzcGFuIGNsYXNzPVxcXCJyYXd0YWdzXFxcIj5cIikgKyBcIjwvc3Bhbj5cIlxyXG4gICAgZWxzZVxyXG4gICAgICB0YWdTdHJpbmcgPSBcIlwiXHJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgaWYgZGlzY29yZFRhZ1xyXG4gICAgICBhY3Rpb25zID0gXCJcIiAjIFwiIFsgRG8gc3R1ZmYgYXMgI3tkaXNjb3JkVGFnfSBdXCJcclxuICAgIGVsc2VcclxuICAgICAgYWN0aW9ucyA9IFwiXCJcclxuXHJcbiAgICBzd2l0Y2ggcmF3TW9kZVxyXG4gICAgICB3aGVuIFwiZWRpdFwiXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXY+PHNwYW4gY2xhc3M9XFxcInNlbGVjdGFsbFxcXCI+I210diBlZGl0ICN7ZS5pZH0gQ09NTUFOREhFUkU8L3NwYW4+ICMgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4je3RhZ1N0cmluZ308L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgd2hlbiBcInNvbG9cIlxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2PmlkICN7ZS5pZH0gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3thcnRpc3R9IC0gI3t0aXRsZX08L2E+PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIHdoZW4gXCJ0YWdcIlxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2PjxzcGFuIGNsYXNzPVxcXCJzZWxlY3RhbGxcXFwiPiNtdHYgZWRpdCAje2UuaWR9IHRhZyAje3Jhd01vZGVUYWd9PC9zcGFuPiB8IDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+I3t0YWdTdHJpbmd9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdj4gKiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiA8c3BhbiBjbGFzcz1cInVzZXJcIj4oI3tlLm5pY2tuYW1lfSN7ZXh0cmFJbmZvfSk8L3NwYW4+I3thY3Rpb25zfTwvZGl2PlxyXG5cclxuICAgICAgICBcIlwiXCJcclxuICByZXR1cm4gaHRtbFxyXG5cclxuXHJcbnNob3dMaXN0ID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgdXJsLCBpc01hcCA9IGZhbHNlLCBzb3J0TWV0aG9kID0gU09SVF9OT05FLCB0YWdGaWx0ZXIgPSBudWxsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgaWYgZG93bmxvYWRDYWNoZVt1cmxdP1xyXG4gICAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlOiAje3VybH1cIlxyXG4gICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBkb3dubG9hZENhY2hlW3VybF0sIGlzTWFwLCBzb3J0TWV0aG9kLCB0YWdGaWx0ZXIpKVxyXG4gICAgICByZXR1cm5cclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmc6ICN7dXJsfVwiXHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgaWYgY2FjaGVFbmFibGVkW3VybF1cclxuICAgICAgICAgICAgICAgZG93bmxvYWRDYWNoZVt1cmxdID0gZW50cmllc1xyXG4gICAgICAgICAgICAgcmVzb2x2ZShyZW5kZXJFbnRyaWVzKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QsIHRhZ0ZpbHRlcikpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUoXCJFcnJvclwiKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbnVwZGF0ZU90aGVyID0gLT5cclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBvdGhlciA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgY29uc29sZS5sb2cgb3RoZXJcclxuICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICBpZiBvdGhlci5uYW1lcz8gYW5kIChvdGhlci5uYW1lcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSBpbiBvdGhlci5uYW1lc1xyXG4gICAgICAgICAgICAgIGlmIG5hbWVTdHJpbmcubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiwgXCJcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IG5hbWVcclxuICAgICAgICAgICAgcmVtYWluaW5nQ291bnQgPSBvdGhlci5wbGF5aW5nIC0gb3RoZXIubmFtZXMubGVuZ3RoXHJcbiAgICAgICAgICAgIGlmIHJlbWFpbmluZ0NvdW50ID4gMFxyXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIgKyAje3JlbWFpbmluZ0NvdW50fSBhbm9uXCJcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiOiAje25hbWVTdHJpbmd9XCJcclxuXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXlpbmdcIikuaW5uZXJIVE1MID0gXCIje290aGVyLnBsYXlpbmd9IFdhdGNoaW5nI3tuYW1lU3RyaW5nfVwiXHJcbiAgICAgICAgICBsYXN0UGxheWVkID0gb3RoZXIuY3VycmVudFxyXG4gICAgICAgICAgaWYgZGlzY29yZFRva2VuP1xyXG4gICAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQgfVxyXG4gICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAjIG5vdGhpbmc/XHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL290aGVyXCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG5zaG93UGxheWluZyA9IC0+XHJcbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWluZ1xyXG5cclxuc2hvd1F1ZXVlID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcclxuXHJcbnNob3dCb3RoID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgbGVmdFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxyXG4gIHJpZ2h0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj4je2xlZnRTaWRlfTwvZGl2PlxyXG4gICAgPGRpdiBpZD1cIm1haW5yXCI+I3tyaWdodFNpZGV9PC9kaXY+XHJcbiAgXCJcIlwiXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcclxuXHJcbmVuYWJsZVNlYXJjaCA9IChlbmFibGVkKSAtPlxyXG4gIHNlYXJjaEVuYWJsZWQgPSBlbmFibGVkXHJcbiAgaWYgZW5hYmxlZFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBzZWFyY2hTdWJzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoaW5wdXQnKS52YWx1ZVxyXG4gIGVsc2VcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBzZWFyY2hTdWJzdHJpbmcgPSBcIlwiXHJcblxyXG5cclxuc2VhcmNoQ2hhbmdlZCA9IC0+XHJcbiAgaWYgbm90IHNlYXJjaEVuYWJsZWRcclxuICAgIHJldHVyblxyXG4gIGlmIG5vdCBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0/XHJcbiAgICByZXR1cm5cclxuICBzZWFyY2hTdWJzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoaW5wdXQnKS52YWx1ZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSlcclxuXHJcbnNob3dQbGF5bGlzdCA9IC0+XHJcbiAgZW5hYmxlU2VhcmNoKHRydWUpXHJcbiAgZG93bmxvYWRDYWNoZVtcIi9pbmZvL3BsYXlsaXN0XCJdID0gbnVsbCAjIGRvbid0IGNhY2hlIGlmIHRoZXkgY2xpY2sgb24gQWxsXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5bGlzdFxyXG5cclxuc2hvd1JlY2VudCA9IC0+XHJcbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FEREVEKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dSZWNlbnRcclxuXHJcbnNob3dUYWcgPSAtPlxyXG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUsIGxhc3RUYWcpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1RhZ1xyXG5cclxuc2hvd0xpc3RzID0gLT5cclxuICBodG1sID0gXCJcIlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgIHRyeVxyXG4gICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgICAgICBpZiBhLm5pY2tuYW1lIDwgYi5uaWNrbmFtZVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICBpZiBhLm5pY2tuYW1lID4gYi5uaWNrbmFtZVxyXG4gICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIGlmIGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICAgICAgaWYgYS5uYW1lLnRvTG93ZXJDYXNlKCkgPiBiLm5hbWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+UHVibGljIFVzZXIgUGxheWxpc3RzOjwvZGl2PlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgbGFzdE5pY2tuYW1lID0gbnVsbFxyXG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xyXG4gICAgICAgICAgICBpZiBsYXN0Tmlja25hbWU/IGFuZCAobGFzdE5pY2tuYW1lICE9IGUubmlja25hbWUpXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiL3AvI3tlbmNvZGVVUklDb21wb25lbnQoZS5uaWNrbmFtZSl9LyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmFtZSl9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7ZS5uaWNrbmFtZX08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgaHJlZj1cIi9wLyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChlLm5hbWUpfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7ZS5uYW1lfTwvc3Bhbj48L2E+PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBsYXN0Tmlja25hbWUgPSBlLm5pY2tuYW1lXHJcblxyXG4gICAgICAgY2F0Y2hcclxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXJwbGF5bGlzdHNcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd0xpc3RzXHJcblxyXG5zaG93U3RhdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBtID0gZW50cmllc1xyXG4gICAgICAgICAgZW50cmllcyA9IFtdXHJcbiAgICAgICAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcclxuXHJcbiAgICAgICAgICB1c2VyQ291bnRzID0ge31cclxuICAgICAgICAgIHRhZ0NvdW50cyA9IHt9XHJcbiAgICAgICAgICBmb3IgZSBpbiBlbnRyaWVzXHJcbiAgICAgICAgICAgIHVzZXJDb3VudHNbZS5uaWNrbmFtZV0gPz0gMFxyXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdICs9IDFcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gICAgICAgICAgICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxyXG4gICAgICAgICAgICBlbmRUaW1lID0gZS5lbmRcclxuICAgICAgICAgICAgaWYgZW5kVGltZSA8IDBcclxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBkdXJhdGlvblxyXG5cclxuICAgICAgICAgICAgZm9yIHRhZ05hbWUgb2YgZS50YWdzXHJcbiAgICAgICAgICAgICAgdGFnQ291bnRzW3RhZ05hbWVdID89IDBcclxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gKz0gMVxyXG5cclxuICAgICAgICAgIHVzZXJMaXN0ID0gT2JqZWN0LmtleXModXNlckNvdW50cylcclxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgdGltZVVuaXRzID0gW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdtaW4nLCBmYWN0b3I6IDYwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICAgIGZvciB1bml0IGluIHRpbWVVbml0c1xyXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiAtPSBhbXQgKiB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcclxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiN7YW10fSAje3VuaXQubmFtZX0je2lmIGFtdCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+QmFzaWMgU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQodXNlcil9XCI+I3t1c2VyfTwvYT46ICN7dXNlckNvdW50c1t1c2VyXX08L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+U29uZ3MgYnkgVGFnOjwvZGl2PlxyXG4gICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ0NvdW50cykuc29ydCgpXHJcbiAgICAgICAgICBmb3IgdGFnTmFtZSBpbiB0YWdOYW1lc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN0YWcvI3tlbmNvZGVVUklDb21wb25lbnQodGFnTmFtZSl9XCI+I3t0YWdOYW1lfTwvYT46ICN7dGFnQ291bnRzW3RhZ05hbWVdfTwvZGl2PlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcclxuXHJcbiAgICAgICBjYXRjaFxyXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXHJcblxyXG5zaG93VXNlciA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBodG1sID0gXCJcIlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICB0cnlcclxuICAgICAgICB1c2VySW5mbyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICBjYXRjaFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+VXNlcjogI3tsYXN0VXNlcn08L2Rpdj5cclxuICAgICAgXCJcIlwiXHJcblxyXG4gICAgICBsaXN0SFRNTCA9IFwiXCJcclxuXHJcbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgaWYgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10/XHJcbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcclxuXHJcbiAgICAgIGZvciBmZWVsaW5nIGluIHNvcnRlZEZlZWxpbmdzXHJcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwidXNlciN7ZmVlbGluZ31cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGlmIHVzZXJJbmZvLmFkZGVkLmxlbmd0aCA+IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5BZGRlZDo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyYWRkZWRcIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGlmIGxpc3RIVE1MLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+KE5vIGluZm8gb24gdGhpcyB1c2VyKTwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaGFzSW5jb21pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nKS5sZW5ndGggPiAwXHJcbiAgICAgICAgaGFzT3V0Z29pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nKS5sZW5ndGggPiAwXHJcblxyXG4gICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnMgb3IgaGFzT3V0Z29pbmdPcGluaW9uc1xyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDx1bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnNcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIGluY29taW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMuaW5jb21pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgaW5jb21pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZzo8L2xpPlxyXG4gICAgICAgICAgICAgIDx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7dXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lLCBvdXRnb2luZyBvZiB1c2VySW5mby5vdGhlck9waW5pb25zLm91dGdvaW5nXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIG91dGdvaW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICBcIlwiXCJcclxuXHJcblxyXG4gICAgICBodG1sICs9IGxpc3RIVE1MXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG4gICAgICBzZXRUaW1lb3V0IC0+XHJcbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlciN7ZmVlbGluZ31cIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXSwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gICAgICAgIGlmIHVzZXJJbmZvLmFkZGVkLmxlbmd0aCA+IDBcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcclxuICAgICAgLCAwXHJcblxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxyXG5cclxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XHJcbiAgaWYgbm90IGRpc2NvcmRUYWc/IG9yIG5vdCBsYXN0UGxheWVkP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbW90ZScpLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVwib3Bpbmlvbm5hbWVcIj5cclxuICBcIlwiXCJcclxuICBmb3IgbyBpbiBvcGluaW9uQnV0dG9uT3JkZXIgYnkgLTFcclxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxyXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcclxuICAgIGlmIG8gPT0gcGt0Lm9waW5pb25cclxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XCIje2NsYXNzZXN9XCIgb25jbGljaz1cInNldE9waW5pb24oJyN7b30nKTsgcmV0dXJuIGZhbHNlO1wiPiN7Y2Fwb308L2E+XHJcbiAgICBcIlwiXCJcclxuICBodG1sICs9IFwiIC0gPHNwYW4gY2xhc3M9XFxcImVudHJ5YXJ0aXN0XFxcIj4je2xhc3RQbGF5ZWQuYXJ0aXN0fTwvc3Bhbj4gLSA8c3BhbiBjbGFzcz1cXFwiZW50cnl0aXRsZVxcXCI+I3tsYXN0UGxheWVkLnRpdGxlfTwvc3Bhbj48L2Rpdj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cclxuICBpZiBub3QgZGlzY29yZFRva2VuPyBvciBub3QgbGFzdFBsYXllZD8gb3Igbm90IGxhc3RQbGF5ZWQuaWQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBsYXN0UGxheWVkLmlkLCBzZXQ6IG9waW5pb24sIHNyYzogXCJkYXNoYm9hcmRcIiB9XHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJpbnB1dFwiKS5mb2N1cygpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxucHJvY2Vzc0hhc2ggPSAtPlxyXG4gIGN1cnJlbnRIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcclxuICBpZiBtYXRjaGVzID0gY3VycmVudEhhc2gubWF0Y2goL14jdXNlclxcLyguKykvKVxyXG4gICAgbGFzdFVzZXIgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcclxuICAgIHNob3dVc2VyKClcclxuICAgIHJldHVyblxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN0YWdcXC8oLispLylcclxuICAgIGxhc3RUYWcgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcclxuICAgIHNob3dUYWcoKVxyXG4gICAgcmV0dXJuXHJcbiAgc3dpdGNoIGN1cnJlbnRIYXNoXHJcbiAgICB3aGVuICcjcXVldWUnXHJcbiAgICAgIHNob3dRdWV1ZSgpXHJcbiAgICB3aGVuICcjYWxsJ1xyXG4gICAgICBzaG93UGxheWxpc3QoKVxyXG4gICAgd2hlbiAnI3JlY2VudCdcclxuICAgICAgc2hvd1JlY2VudCgpXHJcbiAgICB3aGVuICcjYm90aCdcclxuICAgICAgc2hvd0JvdGgoKVxyXG4gICAgd2hlbiAnI2xpc3RzJ1xyXG4gICAgICBzaG93TGlzdHMoKVxyXG4gICAgd2hlbiAnI3N0YXRzJ1xyXG4gICAgICBzaG93U3RhdHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBzaG93UGxheWluZygpXHJcblxyXG5sb2dvdXQgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXHJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcclxuICBzZW5kSWRlbnRpdHkoKVxyXG5cclxuc2VuZElkZW50aXR5ID0gLT5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIGlkZW50aXR5UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICB9XHJcbiAgY29uc29sZS5sb2cgXCJTZW5kaW5nIGlkZW50aWZ5OiBcIiwgaWRlbnRpdHlQYXlsb2FkXHJcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXHJcblxyXG5yZWNlaXZlSWRlbnRpdHkgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxyXG4gIGlmIHBrdC5kaXNhYmxlZFxyXG4gICAgY29uc29sZS5sb2cgXCJEaXNjb3JkIGF1dGggZGlzYWJsZWQuXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxyXG4gICAgZGlzY29yZFRhZyA9IHBrdC50YWdcclxuICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiXCJcclxuICAgIGlmIHBrdC5uaWNrbmFtZT9cclxuICAgICAgZGlzY29yZE5pY2tuYW1lID0gcGt0Lm5pY2tuYW1lXHJcbiAgICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiICgje2Rpc2NvcmROaWNrbmFtZX0pXCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgI3tkaXNjb3JkVGFnfSN7ZGlzY29yZE5pY2tuYW1lU3RyaW5nfSAtIFs8YSBvbmNsaWNrPVwibG9nb3V0KClcIj5Mb2dvdXQ8L2E+XVxyXG4gICAgXCJcIlwiXHJcbiAgZWxzZVxyXG4gICAgZGlzY29yZFRhZyA9IG51bGxcclxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcclxuICAgIGRpc2NvcmRUb2tlbiA9IG51bGxcclxuXHJcbiAgICByZWRpcmVjdFVSTCA9IFN0cmluZyh3aW5kb3cubG9jYXRpb24pLnJlcGxhY2UoLyMuKiQvLCBcIlwiKSArIFwib2F1dGhcIlxyXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXHJcbiAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgIFs8YSBocmVmPVwiI3tsb2dpbkxpbmt9XCI+TG9naW48L2E+XVxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG5vbkluaXRTdWNjZXNzID0gLT5cclxuICBjb25zb2xlLmxvZyBcIkNhc3QgYXZhaWxhYmxlIVwiXHJcbiAgY2FzdEF2YWlsYWJsZSA9IHRydWVcclxuXHJcbm9uRXJyb3IgPSAobWVzc2FnZSkgLT5cclxuXHJcbnNlc3Npb25MaXN0ZW5lciA9IChlKSAtPlxyXG4gIGNhc3RTZXNzaW9uID0gZVxyXG5cclxuc2Vzc2lvblVwZGF0ZUxpc3RlbmVyID0gKGlzQWxpdmUpIC0+XHJcbiAgaWYgbm90IGlzQWxpdmVcclxuICAgIGNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxucHJlcGFyZUNhc3QgPSAtPlxyXG4gIGlmIG5vdCBjaHJvbWUuY2FzdCBvciBub3QgY2hyb21lLmNhc3QuaXNBdmFpbGFibGVcclxuICAgIGlmIG5vdygpIDwgKHBhZ2VFcG9jaCArIDEwKSAjIGdpdmUgdXAgYWZ0ZXIgMTAgc2Vjb25kc1xyXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChwcmVwYXJlQ2FzdCwgMTAwKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNlc3Npb25SZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0LlNlc3Npb25SZXF1ZXN0KCc1QzNGMEEzQycpICMgRGFzaGNhc3RcclxuICBhcGlDb25maWcgPSBuZXcgY2hyb21lLmNhc3QuQXBpQ29uZmlnIHNlc3Npb25SZXF1ZXN0LCBzZXNzaW9uTGlzdGVuZXIsIC0+XHJcbiAgY2hyb21lLmNhc3QuaW5pdGlhbGl6ZShhcGlDb25maWcsIG9uSW5pdFN1Y2Nlc3MsIG9uRXJyb3IpXHJcblxyXG5zdGFydENhc3QgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwic3RhcnQgY2FzdCFcIlxyXG5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwid2F0Y2g/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIGNvbnNvbGUubG9nIFwiV2UncmUgZ29pbmcgaGVyZTogI3ttdHZVUkx9XCJcclxuICBjaHJvbWUuY2FzdC5yZXF1ZXN0U2Vzc2lvbiAoZSkgLT5cclxuICAgIGNhc3RTZXNzaW9uID0gZVxyXG4gICAgY2FzdFNlc3Npb24uc2VuZE1lc3NhZ2UoREFTSENBU1RfTkFNRVNQQUNFLCB7IHVybDogbXR2VVJMLCBmb3JjZTogdHJ1ZSB9KVxyXG4gICwgb25FcnJvclxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxyXG4gIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBwcm9jZXNzSGFzaFxyXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXHJcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcclxuICB3aW5kb3cuc2hvd1BsYXlsaXN0ID0gc2hvd1BsYXlsaXN0XHJcbiAgd2luZG93LnNob3dRdWV1ZSA9IHNob3dRdWV1ZVxyXG4gIHdpbmRvdy5zaG93TGlzdHMgPSBzaG93TGlzdHNcclxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXHJcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XHJcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXHJcbiAgd2luZG93LnNlYXJjaENoYW5nZWQgPSBzZWFyY2hDaGFuZ2VkXHJcblxyXG4gIHJhd01vZGUgPSBxcygncmF3JylcclxuICBpZiByYXdNb2RlP1xyXG4gICAgaWYgbWF0Y2hlcyA9IHJhd01vZGUubWF0Y2goL150YWdfKC4rKS8pXHJcbiAgICAgIHJhd01vZGUgPSBcInRhZ1wiXHJcbiAgICAgIHJhd01vZGVUYWcgPSBtYXRjaGVzWzFdXHJcblxyXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcclxuICBpZiB0b2tlbj9cclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKVxyXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcHJvY2Vzc0hhc2goKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICAjIHN3aXRjaCB3aGljaCBsaW5lIGlzIGNvbW1lbnRlZCBoZXJlIHRvIGFsbG93IGlkZW50aXR5IG9uIHRoZSBkYXNoXHJcbiAgICBzZW5kSWRlbnRpdHkoKVxyXG4gICAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG4gIHNvY2tldC5vbiAncmVmcmVzaCcsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnb3BpbmlvbicsIChwa3QpIC0+XHJcbiAgICB1cGRhdGVPcGluaW9uKHBrdClcclxuXHJcbiAgcHJlcGFyZUNhc3QoKVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIG9waW5pb25zOlxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcblxyXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG4iXX0=
