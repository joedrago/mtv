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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLGVBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsa0JBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLGVBQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7QUFFWixNQUFBLEdBQVM7O0FBRVQsa0JBQUEsR0FBcUI7O0FBRXJCLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBQ1gsT0FBQSxHQUFVOztBQUNWLFVBQUEsR0FBYTs7QUFDYixlQUFB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RGdCLENBQWxCO0VBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFFBQUEsQ0FBQyxHQUFELENBQUE7SUFDbkIsSUFBRyxtQkFBSDthQUNFLFdBQUEsQ0FBQSxFQURGOztFQURtQixDQUFyQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsVUFBVixFQUFzQixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQ3BCLGVBQUEsQ0FBZ0IsR0FBaEI7RUFEb0IsQ0FBdEI7RUFHQSxNQUFNLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsUUFBQSxDQUFDLEdBQUQsQ0FBQTtXQUNuQixhQUFBLENBQWMsR0FBZDtFQURtQixDQUFyQjtTQUdBLFdBQUEsQ0FBQTtBQW5ESzs7QUFxRFAsTUFBTSxDQUFDLE1BQVAsR0FBZ0I7Ozs7QUN4d0JoQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsUUFBQSxFQUNFO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxJQUFBLEVBQU0sSUFETjtJQUVBLEdBQUEsRUFBSyxJQUZMO0lBR0EsSUFBQSxFQUFNLElBSE47SUFJQSxJQUFBLEVBQU07RUFKTixDQURGO0VBT0EsWUFBQSxFQUNFLENBQUE7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLElBQUEsRUFBTTtFQUROLENBUkY7RUFXQSxZQUFBLEVBQ0UsQ0FBQTtJQUFBLEdBQUEsRUFBSztFQUFMLENBWkY7RUFjQSxXQUFBLEVBQ0UsQ0FBQTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsSUFBQSxFQUFNO0VBRE4sQ0FmRjtFQWtCQSxZQUFBLEVBQWM7SUFBQyxNQUFEO0lBQVMsTUFBVDtJQUFpQixLQUFqQjtJQUF3QixNQUF4QjtJQUFnQyxNQUFoQzs7QUFsQmQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXHJcblxyXG5zb2NrZXQgPSBudWxsXHJcblxyXG5EQVNIQ0FTVF9OQU1FU1BBQ0UgPSAndXJuOngtY2FzdDplcy5vZmZkLmRhc2hjYXN0J1xyXG5cclxubGFzdENsaWNrZWQgPSBudWxsXHJcbmxhc3RVc2VyID0gbnVsbFxyXG5sYXN0VGFnID0gbnVsbFxyXG5kaXNjb3JkVGFnID0gbnVsbFxyXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXHJcbmRpc2NvcmRUb2tlbiA9IG51bGxcclxubGFzdFBsYXllZCA9IG51bGxcclxuXHJcbnNlYXJjaEVuYWJsZWQgPSBmYWxzZVxyXG5zZWFyY2hTdWJzdHJpbmcgPSBcIlwiXHJcblxyXG5kb3dubG9hZENhY2hlID0ge31cclxuY2FjaGVFbmFibGVkID0ge1xyXG4gIFwiL2luZm8vcGxheWxpc3RcIjogdHJ1ZVxyXG59XHJcblxyXG5jYXN0QXZhaWxhYmxlID0gZmFsc2VcclxuY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5yYXdNb2RlID0gZmFsc2VcclxucmF3TW9kZVRhZyA9IFwiXCJcclxuXHJcbm9waW5pb25PcmRlciA9IGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxub3BpbmlvbkJ1dHRvbk9yZGVyID0gW11cclxuZm9yIG8gaW4gY29uc3RhbnRzLm9waW5pb25PcmRlclxyXG4gIG9waW5pb25CdXR0b25PcmRlci5wdXNoIG9cclxub3BpbmlvbkJ1dHRvbk9yZGVyLnB1c2goJ25vbmUnKVxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhZ2VFcG9jaCA9IG5vdygpXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxyXG4gIHVuaXRzID0gW1xyXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxyXG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XHJcbiAgICB7IHN1ZmZpeDogXCJzXCIsIGZhY3RvcjogMSwgc2tpcDogZmFsc2UgfVxyXG4gIF1cclxuXHJcbiAgc3RyID0gXCJcIlxyXG4gIGZvciB1bml0IGluIHVuaXRzXHJcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXHJcbiAgICBpZiAodSA+IDApIG9yIG5vdCB1bml0LnNraXBcclxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcclxuICAgICAgICBzdHIgKz0gXCI6XCJcclxuICAgICAgICBpZiB1IDwgMTBcclxuICAgICAgICAgIHN0ciArPSBcIjBcIlxyXG4gICAgICBzdHIgKz0gU3RyaW5nKHUpXHJcbiAgcmV0dXJuIHN0clxyXG5cclxucHJldHR5RHVyYXRpb24gPSAoZSkgLT5cclxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBlLmVuZFxyXG4gIGlmIGVuZFRpbWUgPCAwXHJcbiAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcclxuXHJcblNPUlRfTk9ORSA9IDBcclxuU09SVF9BUlRJU1RfVElUTEUgPSAxXHJcblNPUlRfQURERUQgPSAyXHJcblxyXG5yZW5kZXJFbnRyaWVzID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuXHJcbiAgaWYgaXNNYXBcclxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xyXG4gICAgbSA9IGVudHJpZXNcclxuICAgIGVudHJpZXMgPSBbXVxyXG4gICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICBzd2l0Y2ggc29ydE1ldGhvZFxyXG4gICAgd2hlbiBTT1JUX0FSVElTVF9USVRMRVxyXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIHJldHVybiAwXHJcbiAgICB3aGVuIFNPUlRfQURERURcclxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgIGlmIGEuYWRkZWQgPiBiLmFkZGVkXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLmFkZGVkIDwgYi5hZGRlZFxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgaWYgbm90IGZpcnN0VGl0bGU/IGFuZCBub3QgcmVzdFRpdGxlPyBhbmQgdGFnRmlsdGVyP1xyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPlRhZzogI3t0YWdGaWx0ZXJ9PC9kaXY+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgbG93ZXJjYXNlU2VhcmNoID0gc2VhcmNoU3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgZm9yIGUsIGVudHJ5SW5kZXggaW4gZW50cmllc1xyXG4gICAgaWYgdGFnRmlsdGVyPyBhbmQgbm90IGUudGFnc1t0YWdGaWx0ZXJdP1xyXG4gICAgICBjb250aW51ZVxyXG5cclxuICAgIGFydGlzdCA9IGUuYXJ0aXN0XHJcbiAgICBpZiBub3QgYXJ0aXN0P1xyXG4gICAgICBhcnRpc3QgPSBcIlVua25vd25cIlxyXG4gICAgdGl0bGUgPSBlLnRpdGxlXHJcbiAgICBpZiBub3QgdGl0bGU/XHJcbiAgICAgIHRpdGxlID0gZS5pZFxyXG5cclxuICAgIGlmIHNlYXJjaEVuYWJsZWQgYW5kIChsb3dlcmNhc2VTZWFyY2gubGVuZ3RoID4gMClcclxuICAgICAgaWYgKGFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YobG93ZXJjYXNlU2VhcmNoKSA9PSAtMSkgYW5kICh0aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobG93ZXJjYXNlU2VhcmNoKSA9PSAtMSlcclxuICAgICAgICBjb250aW51ZVxyXG5cclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICB0YWdzID0gW11cclxuICAgIGZvciB0YWcgb2YgZS50YWdzXHJcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3t0YWd9XCJcclxuICAgICAgdGFncy5wdXNoIHRhZ1xyXG4gICAgaWYgdGFncy5sZW5ndGggPiAwXHJcbiAgICAgIHRhZ1N0cmluZyA9IFwiIC0gPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiICsgdGFncy5qb2luKFwiPC9zcGFuPiwgPHNwYW4gY2xhc3M9XFxcInJhd3RhZ3NcXFwiPlwiKSArIFwiPC9zcGFuPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHRhZ1N0cmluZyA9IFwiXCJcclxuICAgIGlmIChlLnN0YXJ0ICE9IC0xKSBvciAgKGUuZW5kICE9IC0xKVxyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7cHJldHR5RHVyYXRpb24oZSl9XCJcclxuICAgIGlmIGUub3BpbmlvbnM/XHJcbiAgICAgIGZvciBmZWVsaW5nLCBjb3VudCBvZiBlLm9waW5pb25zXHJcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2NvdW50fSAje2ZlZWxpbmd9I3tpZiBjb3VudCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgaWYgZmlyc3RUaXRsZT9cclxuICAgICAgaWYgKGVudHJ5SW5kZXggPT0gMClcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZpcnN0VGl0bGVcIj4je2ZpcnN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlld0NvbnRhaW5lclwiPjxpbWcgY2xhc3M9XCJwcmV2aWV3XCIgc3JjPVwiI3tlLnRodW1ifVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICBlbHNlIGlmIChlbnRyeUluZGV4ID09IDEpXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je3Jlc3RUaXRsZX08L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICBpZiBkaXNjb3JkVGFnXHJcbiAgICAgIGFjdGlvbnMgPSBcIlwiICMgXCIgWyBEbyBzdHVmZiBhcyAje2Rpc2NvcmRUYWd9IF1cIlxyXG4gICAgZWxzZVxyXG4gICAgICBhY3Rpb25zID0gXCJcIlxyXG5cclxuICAgIHN3aXRjaCByYXdNb2RlXHJcbiAgICAgIHdoZW4gXCJlZGl0XCJcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSBDT01NQU5ESEVSRTwvc3Bhbj4gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICB3aGVuIFwic29sb1wiXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXY+aWQgI3tlLmlkfSAjIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je2FydGlzdH0gLSAje3RpdGxlfTwvYT48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgd2hlbiBcInRhZ1wiXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXY+PHNwYW4gY2xhc3M9XFxcInNlbGVjdGFsbFxcXCI+I210diBlZGl0ICN7ZS5pZH0gdGFnICN7cmF3TW9kZVRhZ308L3NwYW4+IHwgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4je3RhZ1N0cmluZ308L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XHJcblxyXG4gICAgICAgIFwiXCJcIlxyXG4gIHJldHVybiBodG1sXHJcblxyXG5cclxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICBpZiBkb3dubG9hZENhY2hlW3VybF0/XHJcbiAgICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGU6ICN7dXJsfVwiXHJcbiAgICAgIHJlc29sdmUocmVuZGVyRW50cmllcyhmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGRvd25sb2FkQ2FjaGVbdXJsXSwgaXNNYXAsIHNvcnRNZXRob2QsIHRhZ0ZpbHRlcikpXHJcbiAgICAgIHJldHVyblxyXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZzogI3t1cmx9XCJcclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICBpZiBjYWNoZUVuYWJsZWRbdXJsXVxyXG4gICAgICAgICAgICAgICBkb3dubG9hZENhY2hlW3VybF0gPSBlbnRyaWVzXHJcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBvdGhlclxyXG4gICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lIGluIG90aGVyLm5hbWVzXHJcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiLCBcIlxyXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gbmFtZVxyXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcclxuICAgICAgICAgICAgaWYgcmVtYWluaW5nQ291bnQgPiAwXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiArICN7cmVtYWluaW5nQ291bnR9IGFub25cIlxyXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxyXG5cclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWluZ1wiKS5pbm5lckhUTUwgPSBcIiN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9XCJcclxuICAgICAgICAgIGxhc3RQbGF5ZWQgPSBvdGhlci5jdXJyZW50XHJcbiAgICAgICAgICBpZiBkaXNjb3JkVG9rZW4/XHJcbiAgICAgICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogbGFzdFBsYXllZC5pZCB9XHJcbiAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICMgbm90aGluZz9cclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dQbGF5aW5nID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXHJcblxyXG5zaG93UXVldWUgPSAtPlxyXG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxyXG5cclxuc2hvd0JvdGggPSAtPlxyXG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcclxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XHJcbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cclxuICBcIlwiXCJcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxyXG5cclxuZW5hYmxlU2VhcmNoID0gKGVuYWJsZWQpIC0+XHJcbiAgc2VhcmNoRW5hYmxlZCA9IGVuYWJsZWRcclxuICBpZiBlbmFibGVkXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXHJcbiAgZWxzZVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIHNlYXJjaFN1YnN0cmluZyA9IFwiXCJcclxuXHJcblxyXG5zZWFyY2hDaGFuZ2VkID0gLT5cclxuICBpZiBub3Qgc2VhcmNoRW5hYmxlZFxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGRvd25sb2FkQ2FjaGVbXCIvaW5mby9wbGF5bGlzdFwiXT9cclxuICAgIHJldHVyblxyXG4gIHNlYXJjaFN1YnN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hpbnB1dCcpLnZhbHVlXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBlbmFibGVTZWFyY2godHJ1ZSlcclxuICBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0gPSBudWxsICMgZG9uJ3QgY2FjaGUgaWYgdGhleSBjbGljayBvbiBBbGxcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93UmVjZW50ID0gLT5cclxuICBlbmFibGVTZWFyY2goZmFsc2UpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQURERUQpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1JlY2VudFxyXG5cclxuc2hvd1RhZyA9IC0+XHJcbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FSVElTVF9USVRMRSwgbGFzdFRhZylcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VGFnXHJcblxyXG5zaG93TGlzdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPCBiLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgICAgIGlmIGEubmlja25hbWUgPiBiLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICBpZiBhLm5hbWUudG9Mb3dlckNhc2UoKSA+IGIubmFtZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5QdWJsaWMgVXNlciBQbGF5bGlzdHM6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBsYXN0Tmlja25hbWUgPSBudWxsXHJcbiAgICAgICAgICBmb3IgZSBpbiBlbnRyaWVzXHJcbiAgICAgICAgICAgIGlmIGxhc3ROaWNrbmFtZT8gYW5kIChsYXN0Tmlja25hbWUgIT0gZS5uaWNrbmFtZSlcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIvcC8je2VuY29kZVVSSUNvbXBvbmVudChlLm5pY2tuYW1lKX0vI3tlbmNvZGVVUklDb21wb25lbnQoZS5uYW1lKX1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3tlLm5pY2tuYW1lfTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSBocmVmPVwiL3AvI3tlbmNvZGVVUklDb21wb25lbnQoZS5uaWNrbmFtZSl9LyN7ZW5jb2RlVVJJQ29tcG9uZW50KGUubmFtZSl9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3tlLm5hbWV9PC9zcGFuPjwvYT48L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGxhc3ROaWNrbmFtZSA9IGUubmlja25hbWVcclxuXHJcbiAgICAgICBjYXRjaFxyXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vdXNlcnBsYXlsaXN0c1wiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93TGlzdHNcclxuXHJcbnNob3dTdGF0cyA9IC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICB0cnlcclxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIG0gPSBlbnRyaWVzXHJcbiAgICAgICAgICBlbnRyaWVzID0gW11cclxuICAgICAgICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uID0gMFxyXG5cclxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxyXG4gICAgICAgICAgdGFnQ291bnRzID0ge31cclxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXHJcbiAgICAgICAgICAgIHVzZXJDb3VudHNbZS5uaWNrbmFtZV0gKz0gMVxyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgICAgICAgICAgICBzdGFydFRpbWUgPSAwXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSBlLmVuZFxyXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgICAgICAgICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXHJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxyXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXHJcblxyXG4gICAgICAgICAgICBmb3IgdGFnTmFtZSBvZiBlLnRhZ3NcclxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gPz0gMFxyXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSArPSAxXHJcblxyXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxyXG4gICAgICAgICAgdXNlckxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA8IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdID4gdXNlckNvdW50c1tiXVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG5cclxuICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2RheScsIGZhY3RvcjogMzYwMCAqIDI0IH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnaG91cicsIGZhY3RvcjogMzYwMCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWNvbmQnLCBmYWN0b3I6IDEgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXHJcbiAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb24gPj0gdW5pdC5mYWN0b3JcclxuICAgICAgICAgICAgICBhbXQgPSBNYXRoLmZsb29yKHRvdGFsRHVyYXRpb24gLyB1bml0LmZhY3RvcilcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvblN0cmluZy5sZW5ndGggIT0gMFxyXG4gICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiwgXCJcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBTb25nczogI3tlbnRyaWVzLmxlbmd0aH08L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBEdXJhdGlvbjogI3t0b3RhbER1cmF0aW9uU3RyaW5nfTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+U29uZ3MgYnkgVXNlcjo8L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgZm9yIHVzZXIgaW4gdXNlckxpc3RcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBUYWc6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIHRhZ05hbWVzID0gT2JqZWN0LmtleXModGFnQ291bnRzKS5zb3J0KClcclxuICAgICAgICAgIGZvciB0YWdOYW1lIGluIHRhZ05hbWVzXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3RhZy8je2VuY29kZVVSSUNvbXBvbmVudCh0YWdOYW1lKX1cIj4je3RhZ05hbWV9PC9hPjogI3t0YWdDb3VudHNbdGFnTmFtZV19PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICMgaHRtbCA9IFwiPHByZT5cIiArIEpTT04uc3RyaW5naWZ5KHVzZXJDb3VudHMsIG51bGwsIDIpICsgXCI8L3ByZT5cIlxyXG5cclxuICAgICAgIGNhdGNoXHJcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93U3RhdHNcclxuXHJcbnNob3dVc2VyID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHVzZXJJbmZvID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgIGNhdGNoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Vc2VyOiAje2xhc3RVc2VyfTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGxpc3RIVE1MID0gXCJcIlxyXG5cclxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cclxuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xyXG5cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPkFkZGVkOjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4oTm8gaW5mbyBvbiB0aGlzIHVzZXIpPC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBoYXNJbmNvbWluZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmcpLmxlbmd0aCA+IDBcclxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcclxuXHJcbiAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9ucyBvciBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBpbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XHJcbiAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgb3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuXHJcbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyI3tmZWVsaW5nfVwiKS5pbm5lckhUTUwgPSByZW5kZXJFbnRyaWVzKG51bGwsIG51bGwsIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddLCBmYWxzZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gICAgICAsIDBcclxuXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXHJcblxyXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cclxuICBpZiBub3QgZGlzY29yZFRhZz8gb3Igbm90IGxhc3RQbGF5ZWQ/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlJykuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XCJvcGluaW9ubmFtZVwiPlxyXG4gIFwiXCJcIlxyXG4gIGZvciBvIGluIG9waW5pb25CdXR0b25PcmRlciBieSAtMVxyXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXHJcbiAgICBjbGFzc2VzID0gXCJvYnV0dG9cIlxyXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxyXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGh0bWwgKz0gXCIgLSA8c3BhbiBjbGFzcz1cXFwiZW50cnlhcnRpc3RcXFwiPiN7bGFzdFBsYXllZC5hcnRpc3R9PC9zcGFuPiAtIDxzcGFuIGNsYXNzPVxcXCJlbnRyeXRpdGxlXFxcIj4je2xhc3RQbGF5ZWQudGl0bGV9PC9zcGFuPjwvZGl2PlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuc2V0T3BpbmlvbiA9IChvcGluaW9uKSAtPlxyXG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkPyBvciBub3QgbGFzdFBsYXllZC5pZD9cclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQsIHNldDogb3Bpbmlvbiwgc3JjOiBcImRhc2hib2FyZFwiIH1cclxuXHJcbnNob3dXYXRjaEZvcm0gPSAtPlxyXG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FzdGJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG5wcm9jZXNzSGFzaCA9IC0+XHJcbiAgY3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXHJcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1VzZXIoKVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3RhZ1xcLyguKykvKVxyXG4gICAgbGFzdFRhZyA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1RhZygpXHJcbiAgICByZXR1cm5cclxuICBzd2l0Y2ggY3VycmVudEhhc2hcclxuICAgIHdoZW4gJyNxdWV1ZSdcclxuICAgICAgc2hvd1F1ZXVlKClcclxuICAgIHdoZW4gJyNhbGwnXHJcbiAgICAgIHNob3dQbGF5bGlzdCgpXHJcbiAgICB3aGVuICcjcmVjZW50J1xyXG4gICAgICBzaG93UmVjZW50KClcclxuICAgIHdoZW4gJyNib3RoJ1xyXG4gICAgICBzaG93Qm90aCgpXHJcbiAgICB3aGVuICcjbGlzdHMnXHJcbiAgICAgIHNob3dMaXN0cygpXHJcbiAgICB3aGVuICcjc3RhdHMnXHJcbiAgICAgIHNob3dTdGF0cygpXHJcbiAgICBlbHNlXHJcbiAgICAgIHNob3dQbGF5aW5nKClcclxuXHJcbmxvZ291dCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcclxuICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKVxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcclxuIyAgaWYgbGFzdENsaWNrZWQ/XHJcbiMgICAgbGFzdENsaWNrZWQoKVxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIndhdGNoP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXHJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XHJcbiAgICBjYXN0U2Vzc2lvbiA9IGVcclxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCwgZm9yY2U6IHRydWUgfSlcclxuICAsIG9uRXJyb3JcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcclxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcclxuICB3aW5kb3cuc2hvd0JvdGggPSBzaG93Qm90aFxyXG4gIHdpbmRvdy5zaG93UGxheWluZyA9IHNob3dQbGF5aW5nXHJcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxyXG4gIHdpbmRvdy5zaG93UXVldWUgPSBzaG93UXVldWVcclxuICB3aW5kb3cuc2hvd0xpc3RzID0gc2hvd0xpc3RzXHJcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xyXG4gIHdpbmRvdy5zaG93VXNlciA9IHNob3dVc2VyXHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxyXG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxyXG4gIHdpbmRvdy5zZWFyY2hDaGFuZ2VkID0gc2VhcmNoQ2hhbmdlZFxyXG5cclxuICByYXdNb2RlID0gcXMoJ3JhdycpXHJcbiAgaWYgcmF3TW9kZT9cclxuICAgIGlmIG1hdGNoZXMgPSByYXdNb2RlLm1hdGNoKC9edGFnXyguKykvKVxyXG4gICAgICByYXdNb2RlID0gXCJ0YWdcIlxyXG4gICAgICByYXdNb2RlVGFnID0gbWF0Y2hlc1sxXVxyXG5cclxuICB0b2tlbiA9IHFzKCd0b2tlbicpXHJcbiAgaWYgdG9rZW4/XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbilcclxuICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvJ1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHByb2Nlc3NIYXNoKClcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgIyBzd2l0Y2ggd2hpY2ggbGluZSBpcyBjb21tZW50ZWQgaGVyZSB0byBhbGxvdyBpZGVudGl0eSBvbiB0aGUgZGFzaFxyXG4gICAgc2VuZElkZW50aXR5KClcclxuICAgICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcblxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgc29ja2V0Lm9uICdpZGVudGlmeScsIChwa3QpIC0+XHJcbiAgICByZWNlaXZlSWRlbnRpdHkocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ29waW5pb24nLCAocGt0KSAtPlxyXG4gICAgdXBkYXRlT3Bpbmlvbihwa3QpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBvcGluaW9uczpcclxuICAgIGxvdmU6IHRydWVcclxuICAgIGxpa2U6IHRydWVcclxuICAgIG1laDogdHJ1ZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG5cclxuICB3ZWFrT3BpbmlvbnM6ICMgc2tpcCB0aGVzZSBpZiB3ZSBhbGwgYWdyZWVcclxuICAgIG1laDogdHJ1ZVxyXG5cclxuICBiYWRPcGluaW9uczogIyBza2lwIHRoZXNlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIG9waW5pb25PcmRlcjogWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuIl19
