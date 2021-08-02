(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, cacheEnabled, castAvailable, castSession, constants, discordNickname, discordTag, discordToken, downloadCache, enableSearch, i, init, lastClicked, lastPlayed, lastTag, lastUser, len, logout, now, o, onError, onInitSuccess, opinionButtonOrder, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, rawMode, rawModeTag, receiveIdentity, ref, renderEntries, searchChanged, searchEnabled, searchSubstring, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, showBoth, showList, showPlaying, showPlaylist, showQueue, showRecent, showStats, showTag, showUser, showWatchForm, showWatchLink, socket, startCast, updateOpinion, updateOther;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLGVBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsa0JBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLGVBQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztBQUVaLE1BQUEsR0FBUzs7QUFFVCxrQkFBQSxHQUFxQjs7QUFFckIsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVzs7QUFDWCxPQUFBLEdBQVU7O0FBQ1YsVUFBQSxHQUFhOztBQUNiLGVBQUEsR0FBa0I7O0FB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QTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsSUFBQSxFQUFNO0VBRE4sQ0FmRjtFQWtCQSxZQUFBLEVBQWM7SUFBQyxNQUFEO0lBQVMsTUFBVDtJQUFpQixLQUFqQjtJQUF3QixNQUF4QjtJQUFnQyxNQUFoQzs7QUFsQmQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXG5cbnNvY2tldCA9IG51bGxcblxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcblxubGFzdENsaWNrZWQgPSBudWxsXG5sYXN0VXNlciA9IG51bGxcbmxhc3RUYWcgPSBudWxsXG5kaXNjb3JkVGFnID0gbnVsbFxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuZGlzY29yZFRva2VuID0gbnVsbFxubGFzdFBsYXllZCA9IG51bGxcblxuc2VhcmNoRW5hYmxlZCA9IGZhbHNlXG5zZWFyY2hTdWJzdHJpbmcgPSBcIlwiXG5cbmRvd25sb2FkQ2FjaGUgPSB7fVxuY2FjaGVFbmFibGVkID0ge1xuICBcIi9pbmZvL3BsYXlsaXN0XCI6IHRydWVcbn1cblxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXG5jYXN0U2Vzc2lvbiA9IG51bGxcblxucmF3TW9kZSA9IGZhbHNlXG5yYXdNb2RlVGFnID0gXCJcIlxuXG5vcGluaW9uT3JkZXIgPSBjb25zdGFudHMub3Bpbmlvbk9yZGVyXG5vcGluaW9uQnV0dG9uT3JkZXIgPSBbXVxuZm9yIG8gaW4gY29uc3RhbnRzLm9waW5pb25PcmRlclxuICBvcGluaW9uQnV0dG9uT3JkZXIucHVzaCBvXG5vcGluaW9uQnV0dG9uT3JkZXIucHVzaCgnbm9uZScpXG5cbm5vdyA9IC0+XG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuXG5wYWdlRXBvY2ggPSBub3coKVxuXG5xcyA9IChuYW1lKSAtPlxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxuICAgIHJldHVybiBudWxsXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcblxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxuICB1bml0cyA9IFtcbiAgICB7IHN1ZmZpeDogXCJoXCIsIGZhY3RvcjogMzYwMCwgc2tpcDogdHJ1ZSB9XG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XG4gICAgeyBzdWZmaXg6IFwic1wiLCBmYWN0b3I6IDEsIHNraXA6IGZhbHNlIH1cbiAgXVxuXG4gIHN0ciA9IFwiXCJcbiAgZm9yIHVuaXQgaW4gdW5pdHNcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXG4gICAgaWYgKHUgPiAwKSBvciBub3QgdW5pdC5za2lwXG4gICAgICB0IC09IHUgKiB1bml0LmZhY3RvclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcbiAgICAgICAgc3RyICs9IFwiOlwiXG4gICAgICAgIGlmIHUgPCAxMFxuICAgICAgICAgIHN0ciArPSBcIjBcIlxuICAgICAgc3RyICs9IFN0cmluZyh1KVxuICByZXR1cm4gc3RyXG5cbnByZXR0eUR1cmF0aW9uID0gKGUpIC0+XG4gIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgaWYgc3RhcnRUaW1lIDwgMFxuICAgIHN0YXJ0VGltZSA9IDBcbiAgZW5kVGltZSA9IGUuZW5kXG4gIGlmIGVuZFRpbWUgPCAwXG4gICAgZW5kVGltZSA9IGUuZHVyYXRpb25cbiAgcmV0dXJuIFwiI3tzZWNvbmRzVG9UaW1lKHN0YXJ0VGltZSl9LSN7c2Vjb25kc1RvVGltZShlbmRUaW1lKX1cIlxuXG5TT1JUX05PTkUgPSAwXG5TT1JUX0FSVElTVF9USVRMRSA9IDFcblNPUlRfQURERUQgPSAyXG5cbnJlbmRlckVudHJpZXMgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cbiAgaHRtbCA9IFwiXCJcblxuICBpZiBpc01hcFxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xuICAgIG0gPSBlbnRyaWVzXG4gICAgZW50cmllcyA9IFtdXG4gICAgZm9yIGssIHYgb2YgbVxuICAgICAgZW50cmllcy5wdXNoIHZcblxuICBzd2l0Y2ggc29ydE1ldGhvZFxuICAgIHdoZW4gU09SVF9BUlRJU1RfVElUTEVcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcbiAgICB3aGVuIFNPUlRfQURERURcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgICAgaWYgYS5hZGRlZCA+IGIuYWRkZWRcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hZGRlZCA8IGIuYWRkZWRcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuXG4gIGlmIG5vdCBmaXJzdFRpdGxlPyBhbmQgbm90IHJlc3RUaXRsZT8gYW5kIHRhZ0ZpbHRlcj9cbiAgICBodG1sICs9IFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPlRhZzogI3t0YWdGaWx0ZXJ9PC9kaXY+XG4gICAgXCJcIlwiXG5cbiAgbG93ZXJjYXNlU2VhcmNoID0gc2VhcmNoU3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBmb3IgZSwgZW50cnlJbmRleCBpbiBlbnRyaWVzXG4gICAgaWYgdGFnRmlsdGVyPyBhbmQgbm90IGUudGFnc1t0YWdGaWx0ZXJdP1xuICAgICAgY29udGludWVcblxuICAgIGFydGlzdCA9IGUuYXJ0aXN0XG4gICAgaWYgbm90IGFydGlzdD9cbiAgICAgIGFydGlzdCA9IFwiVW5rbm93blwiXG4gICAgdGl0bGUgPSBlLnRpdGxlXG4gICAgaWYgbm90IHRpdGxlP1xuICAgICAgdGl0bGUgPSBlLmlkXG5cbiAgICBpZiBzZWFyY2hFbmFibGVkIGFuZCAobG93ZXJjYXNlU2VhcmNoLmxlbmd0aCA+IDApXG4gICAgICBpZiAoYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKSBhbmQgKHRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsb3dlcmNhc2VTZWFyY2gpID09IC0xKVxuICAgICAgICBjb250aW51ZVxuXG4gICAgcGFyYW1zID0gXCJcIlxuICAgIGlmIGUuc3RhcnQgPj0gMFxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcbiAgICAgIHBhcmFtcyArPSBcInN0YXJ0PSN7ZS5zdGFydH1cIlxuICAgIGlmIGUuZW5kID49IDBcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXG4gICAgICBwYXJhbXMgKz0gXCJlbmQ9I3tlLmVuZH1cIlxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcblxuICAgIGV4dHJhSW5mbyA9IFwiXCJcbiAgICB0YWdzID0gW11cbiAgICBmb3IgdGFnIG9mIGUudGFnc1xuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3RhZ31cIlxuICAgICAgdGFncy5wdXNoIHRhZ1xuICAgIGlmIHRhZ3MubGVuZ3RoID4gMFxuICAgICAgdGFnU3RyaW5nID0gXCIgLSA8c3BhbiBjbGFzcz1cXFwicmF3dGFnc1xcXCI+XCIgKyB0YWdzLmpvaW4oXCI8L3NwYW4+LCA8c3BhbiBjbGFzcz1cXFwicmF3dGFnc1xcXCI+XCIpICsgXCI8L3NwYW4+XCJcbiAgICBlbHNlXG4gICAgICB0YWdTdHJpbmcgPSBcIlwiXG4gICAgaWYgKGUuc3RhcnQgIT0gLTEpIG9yICAoZS5lbmQgIT0gLTEpXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7cHJldHR5RHVyYXRpb24oZSl9XCJcbiAgICBpZiBlLm9waW5pb25zP1xuICAgICAgZm9yIGZlZWxpbmcsIGNvdW50IG9mIGUub3BpbmlvbnNcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2NvdW50fSAje2ZlZWxpbmd9I3tpZiBjb3VudCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXG5cbiAgICBpZiBmaXJzdFRpdGxlP1xuICAgICAgaWYgKGVudHJ5SW5kZXggPT0gMClcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmlyc3RUaXRsZVwiPiN7Zmlyc3RUaXRsZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlld0NvbnRhaW5lclwiPjxpbWcgY2xhc3M9XCJwcmV2aWV3XCIgc3JjPVwiI3tlLnRodW1ifVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2UgaWYgKGVudHJ5SW5kZXggPT0gMSlcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaWYgZGlzY29yZFRhZ1xuICAgICAgYWN0aW9ucyA9IFwiXCIgIyBcIiBbIERvIHN0dWZmIGFzICN7ZGlzY29yZFRhZ30gXVwiXG4gICAgZWxzZVxuICAgICAgYWN0aW9ucyA9IFwiXCJcblxuICAgIHN3aXRjaCByYXdNb2RlXG4gICAgICB3aGVuIFwiZWRpdFwiXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSBDT01NQU5ESEVSRTwvc3Bhbj4gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIHdoZW4gXCJzb2xvXCJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PmlkICN7ZS5pZH0gIyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3thcnRpc3R9IC0gI3t0aXRsZX08L2E+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgd2hlbiBcInRhZ1wiXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdj48c3BhbiBjbGFzcz1cXFwic2VsZWN0YWxsXFxcIj4jbXR2IGVkaXQgI3tlLmlkfSB0YWcgI3tyYXdNb2RlVGFnfTwvc3Bhbj4gfCA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeWFydGlzdFwiPiN7YXJ0aXN0fTwvc3Bhbj48L2E+PHNwYW4gY2xhc3M9XCJlbnRyeW1pZGRsZVwiPiAtIDwvc3Bhbj48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+PHNwYW4gY2xhc3M9XCJlbnRyeXRpdGxlXCI+I3t0aXRsZX08L3NwYW4+PC9hPiN7dGFnU3RyaW5nfTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XG5cbiAgICAgICAgXCJcIlwiXG4gIHJldHVybiBodG1sXG5cblxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGlmIGRvd25sb2FkQ2FjaGVbdXJsXT9cbiAgICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGU6ICN7dXJsfVwiXG4gICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBkb3dubG9hZENhY2hlW3VybF0sIGlzTWFwLCBzb3J0TWV0aG9kLCB0YWdGaWx0ZXIpKVxuICAgICAgcmV0dXJuXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZzogI3t1cmx9XCJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgaWYgY2FjaGVFbmFibGVkW3VybF1cbiAgICAgICAgICAgICAgIGRvd25sb2FkQ2FjaGVbdXJsXSA9IGVudHJpZXNcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKFwiRXJyb3JcIilcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxudXBkYXRlT3RoZXIgPSAtPlxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgIHRyeVxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgY29uc29sZS5sb2cgb3RoZXJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiwgXCJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcbiAgICAgICAgICAgIGlmIHJlbWFpbmluZ0NvdW50ID4gMFxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxuXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiI3tvdGhlci5wbGF5aW5nfSBXYXRjaGluZyN7bmFtZVN0cmluZ31cIlxuICAgICAgICAgIGxhc3RQbGF5ZWQgPSBvdGhlci5jdXJyZW50XG4gICAgICAgICAgaWYgZGlzY29yZFRva2VuP1xuICAgICAgICAgICAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBsYXN0UGxheWVkLmlkIH1cbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAjIG5vdGhpbmc/XG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9vdGhlclwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuc2hvd1BsYXlpbmcgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXG5cbnNob3dRdWV1ZSA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxuXG5zaG93Qm90aCA9IC0+XG4gIGVuYWJsZVNlYXJjaChmYWxzZSlcbiAgbGVmdFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxuICByaWdodFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj4je2xlZnRTaWRlfTwvZGl2PlxuICAgIDxkaXYgaWQ9XCJtYWluclwiPiN7cmlnaHRTaWRlfTwvZGl2PlxuICBcIlwiXCJcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dCb3RoXG5cbmVuYWJsZVNlYXJjaCA9IChlbmFibGVkKSAtPlxuICBzZWFyY2hFbmFibGVkID0gZW5hYmxlZFxuICBpZiBlbmFibGVkXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgc2VhcmNoU3Vic3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaGlucHV0JykudmFsdWVcbiAgZWxzZVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgc2VhcmNoU3Vic3RyaW5nID0gXCJcIlxuXG5cbnNlYXJjaENoYW5nZWQgPSAtPlxuICBpZiBub3Qgc2VhcmNoRW5hYmxlZFxuICAgIHJldHVyblxuICBpZiBub3QgZG93bmxvYWRDYWNoZVtcIi9pbmZvL3BsYXlsaXN0XCJdP1xuICAgIHJldHVyblxuICBzZWFyY2hTdWJzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoaW5wdXQnKS52YWx1ZVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXG5cbnNob3dQbGF5bGlzdCA9IC0+XG4gIGVuYWJsZVNlYXJjaCh0cnVlKVxuICBkb3dubG9hZENhY2hlW1wiL2luZm8vcGxheWxpc3RcIl0gPSBudWxsICMgZG9uJ3QgY2FjaGUgaWYgdGhleSBjbGljayBvbiBBbGxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XG5cbnNob3dSZWNlbnQgPSAtPlxuICBlbmFibGVTZWFyY2goZmFsc2UpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlLCBTT1JUX0FEREVEKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1JlY2VudFxuXG5zaG93VGFnID0gLT5cbiAgZW5hYmxlU2VhcmNoKGZhbHNlKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUsIGxhc3RUYWcpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93VGFnXG5cbnNob3dTdGF0cyA9IC0+XG4gIGh0bWwgPSBcIlwiXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICB0cnlcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgbSA9IGVudHJpZXNcbiAgICAgICAgICBlbnRyaWVzID0gW11cbiAgICAgICAgICBmb3IgaywgdiBvZiBtXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcblxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxuICAgICAgICAgIHRhZ0NvdW50cyA9IHt9XG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdICs9IDFcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXG5cbiAgICAgICAgICAgIGZvciB0YWdOYW1lIG9mIGUudGFnc1xuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gPz0gMFxuICAgICAgICAgICAgICB0YWdDb3VudHNbdGFnTmFtZV0gKz0gMVxuXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICByZXR1cm4gMFxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cbiAgICAgICAgICBdXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFRhZzo8L2Rpdj5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ0NvdW50cykuc29ydCgpXG4gICAgICAgICAgZm9yIHRhZ05hbWUgaW4gdGFnTmFtZXNcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN0YWcvI3tlbmNvZGVVUklDb21wb25lbnQodGFnTmFtZSl9XCI+I3t0YWdOYW1lfTwvYT46ICN7dGFnQ291bnRzW3RhZ05hbWVdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcblxuICAgICAgIGNhdGNoXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXG5cbnNob3dVc2VyID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICB0cnlcbiAgICAgICAgdXNlckluZm8gPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgIGNhdGNoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XG4gICAgICBcIlwiXCJcblxuICAgICAgbGlzdEhUTUwgPSBcIlwiXG5cbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cbiAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcblxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+QWRkZWQ6PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPihObyBpbmZvIG9uIHRoaXMgdXNlcik8L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIGhhc0luY29taW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZykubGVuZ3RoID4gMFxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcblxuICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zIG9yIGhhc091dGdvaW5nT3BpbmlvbnNcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIGluY29taW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XG4gICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgICBpZiBvdXRnb2luZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIFwiXCJcIlxuXG5cbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXIje2ZlZWxpbmd9XCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10sIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcbiAgICAgICwgMFxuXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1VzZXJcblxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XG4gIGlmIG5vdCBkaXNjb3JkVGFnPyBvciBub3QgbGFzdFBsYXllZD9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVtb3RlJykuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGh0bWwgPSBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwib3Bpbmlvbm5hbWVcIj5cbiAgXCJcIlwiXG4gIGZvciBvIGluIG9waW5pb25CdXR0b25PcmRlciBieSAtMVxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxuICAgIGNsYXNzZXMgPSBcIm9idXR0b1wiXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxuICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cbiAgICBcIlwiXCJcbiAgaHRtbCArPSBcIiAtIDxzcGFuIGNsYXNzPVxcXCJlbnRyeWFydGlzdFxcXCI+I3tsYXN0UGxheWVkLmFydGlzdH08L3NwYW4+IC0gPHNwYW4gY2xhc3M9XFxcImVudHJ5dGl0bGVcXFwiPiN7bGFzdFBsYXllZC50aXRsZX08L3NwYW4+PC9kaXY+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxuXG5zZXRPcGluaW9uID0gKG9waW5pb24pIC0+XG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkPyBvciBub3QgbGFzdFBsYXllZC5pZD9cbiAgICByZXR1cm5cblxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWQuaWQsIHNldDogb3Bpbmlvbiwgc3JjOiBcImRhc2hib2FyZFwiIH1cblxuc2hvd1dhdGNoRm9ybSA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcblxuc2hvd1dhdGNoTGluayA9IC0+XG4gICMgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG5wcm9jZXNzSGFzaCA9IC0+XG4gIGN1cnJlbnRIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxuICAgIHNob3dVc2VyKClcbiAgICByZXR1cm5cbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3RhZ1xcLyguKykvKVxuICAgIGxhc3RUYWcgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcbiAgICBzaG93VGFnKClcbiAgICByZXR1cm5cbiAgc3dpdGNoIGN1cnJlbnRIYXNoXG4gICAgd2hlbiAnI3F1ZXVlJ1xuICAgICAgc2hvd1F1ZXVlKClcbiAgICB3aGVuICcjYWxsJ1xuICAgICAgc2hvd1BsYXlsaXN0KClcbiAgICB3aGVuICcjcmVjZW50J1xuICAgICAgc2hvd1JlY2VudCgpXG4gICAgd2hlbiAnI2JvdGgnXG4gICAgICBzaG93Qm90aCgpXG4gICAgd2hlbiAnI3N0YXRzJ1xuICAgICAgc2hvd1N0YXRzKClcbiAgICBlbHNlXG4gICAgICBzaG93UGxheWluZygpXG5cbmxvZ291dCA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXG4gIHNlbmRJZGVudGl0eSgpXG5cbnNlbmRJZGVudGl0eSA9IC0+XG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXG4gIGlkZW50aXR5UGF5bG9hZCA9IHtcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXG4gIH1cbiAgY29uc29sZS5sb2cgXCJTZW5kaW5nIGlkZW50aWZ5OiBcIiwgaWRlbnRpdHlQYXlsb2FkXG4gIHNvY2tldC5lbWl0ICdpZGVudGlmeScsIGlkZW50aXR5UGF5bG9hZFxuXG5yZWNlaXZlSWRlbnRpdHkgPSAocGt0KSAtPlxuICBjb25zb2xlLmxvZyBcImlkZW50aWZ5IHJlc3BvbnNlOlwiLCBwa3RcbiAgaWYgcGt0LmRpc2FibGVkXG4gICAgY29uc29sZS5sb2cgXCJEaXNjb3JkIGF1dGggZGlzYWJsZWQuXCJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcbiAgICByZXR1cm5cblxuICBpZiBwa3QudGFnPyBhbmQgKHBrdC50YWcubGVuZ3RoID4gMClcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xuICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiXCJcbiAgICBpZiBwa3Qubmlja25hbWU/XG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcbiAgICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiICgje2Rpc2NvcmROaWNrbmFtZX0pXCJcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcbiAgICBkaXNjb3JkVG9rZW4gPSBudWxsXG5cbiAgICByZWRpcmVjdFVSTCA9IFN0cmluZyh3aW5kb3cubG9jYXRpb24pLnJlcGxhY2UoLyMuKiQvLCBcIlwiKSArIFwib2F1dGhcIlxuICAgIGxvZ2luTGluayA9IFwiaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL2F1dGhvcml6ZT9jbGllbnRfaWQ9I3t3aW5kb3cuQ0xJRU5UX0lEfSZyZWRpcmVjdF91cmk9I3tlbmNvZGVVUklDb21wb25lbnQocmVkaXJlY3RVUkwpfSZyZXNwb25zZV90eXBlPWNvZGUmc2NvcGU9aWRlbnRpZnlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgIFs8YSBocmVmPVwiI3tsb2dpbkxpbmt9XCI+TG9naW48L2E+XVxuICAgIFwiXCJcIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcbiAgaWYgbGFzdENsaWNrZWQ/XG4gICAgbGFzdENsaWNrZWQoKVxuXG5vbkluaXRTdWNjZXNzID0gLT5cbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxuICBjYXN0QXZhaWxhYmxlID0gdHJ1ZVxuXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XG5cbnNlc3Npb25MaXN0ZW5lciA9IChlKSAtPlxuICBjYXN0U2Vzc2lvbiA9IGVcblxuc2Vzc2lvblVwZGF0ZUxpc3RlbmVyID0gKGlzQWxpdmUpIC0+XG4gIGlmIG5vdCBpc0FsaXZlXG4gICAgY2FzdFNlc3Npb24gPSBudWxsXG5cbnByZXBhcmVDYXN0ID0gLT5cbiAgaWYgbm90IGNocm9tZS5jYXN0IG9yIG5vdCBjaHJvbWUuY2FzdC5pc0F2YWlsYWJsZVxuICAgIGlmIG5vdygpIDwgKHBhZ2VFcG9jaCArIDEwKSAjIGdpdmUgdXAgYWZ0ZXIgMTAgc2Vjb25kc1xuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcbiAgICByZXR1cm5cblxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XG4gIGFwaUNvbmZpZyA9IG5ldyBjaHJvbWUuY2FzdC5BcGlDb25maWcgc2Vzc2lvblJlcXVlc3QsIHNlc3Npb25MaXN0ZW5lciwgLT5cbiAgY2hyb21lLmNhc3QuaW5pdGlhbGl6ZShhcGlDb25maWcsIG9uSW5pdFN1Y2Nlc3MsIG9uRXJyb3IpXG5cbnN0YXJ0Q2FzdCA9IC0+XG4gIGNvbnNvbGUubG9nIFwic3RhcnQgY2FzdCFcIlxuXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIndhdGNoP1wiICsgcXVlcnlzdHJpbmdcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxuICBjaHJvbWUuY2FzdC5yZXF1ZXN0U2Vzc2lvbiAoZSkgLT5cbiAgICBjYXN0U2Vzc2lvbiA9IGVcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXG4gICwgb25FcnJvclxuXG5pbml0ID0gLT5cbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXG4gIHdpbmRvdy5zaG93U3RhdHMgPSBzaG93U3RhdHNcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXG4gIHdpbmRvdy5zaG93V2F0Y2hMaW5rID0gc2hvd1dhdGNoTGlua1xuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxuICB3aW5kb3cuc2VhcmNoQ2hhbmdlZCA9IHNlYXJjaENoYW5nZWRcblxuICByYXdNb2RlID0gcXMoJ3JhdycpXG4gIGlmIHJhd01vZGU/XG4gICAgaWYgbWF0Y2hlcyA9IHJhd01vZGUubWF0Y2goL150YWdfKC4rKS8pXG4gICAgICByYXdNb2RlID0gXCJ0YWdcIlxuICAgICAgcmF3TW9kZVRhZyA9IG1hdGNoZXNbMV1cblxuICB0b2tlbiA9IHFzKCd0b2tlbicpXG4gIGlmIHRva2VuP1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKVxuICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvJ1xuICAgIHJldHVyblxuXG4gIHByb2Nlc3NIYXNoKClcblxuICBzb2NrZXQgPSBpbygpXG5cbiAgc29ja2V0Lm9uICdjb25uZWN0JywgLT5cbiAgICAjIHN3aXRjaCB3aGljaCBsaW5lIGlzIGNvbW1lbnRlZCBoZXJlIHRvIGFsbG93IGlkZW50aXR5IG9uIHRoZSBkYXNoXG4gICAgc2VuZElkZW50aXR5KClcbiAgICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxuXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XG4gICAgaWYgbGFzdENsaWNrZWQ/XG4gICAgICBsYXN0Q2xpY2tlZCgpXG5cbiAgc29ja2V0Lm9uICdyZWZyZXNoJywgKHBrdCkgLT5cbiAgICBpZiBsYXN0Q2xpY2tlZD9cbiAgICAgIGxhc3RDbGlja2VkKClcblxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cbiAgICByZWNlaXZlSWRlbnRpdHkocGt0KVxuXG4gIHNvY2tldC5vbiAnb3BpbmlvbicsIChwa3QpIC0+XG4gICAgdXBkYXRlT3Bpbmlvbihwa3QpXG5cbiAgcHJlcGFyZUNhc3QoKVxuXG53aW5kb3cub25sb2FkID0gaW5pdFxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBvcGluaW9uczpcbiAgICBsb3ZlOiB0cnVlXG4gICAgbGlrZTogdHJ1ZVxuICAgIG1laDogdHJ1ZVxuICAgIGJsZWg6IHRydWVcbiAgICBoYXRlOiB0cnVlXG5cbiAgZ29vZE9waW5pb25zOiAjIGRvbid0IHNraXAgdGhlc2VcbiAgICBsb3ZlOiB0cnVlXG4gICAgbGlrZTogdHJ1ZVxuXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxuICAgIG1laDogdHJ1ZVxuXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcbiAgICBibGVoOiB0cnVlXG4gICAgaGF0ZTogdHJ1ZVxuXG4gIG9waW5pb25PcmRlcjogWydsb3ZlJywgJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcbiJdfQ==
