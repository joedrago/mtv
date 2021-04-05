(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, castAvailable, castSession, constants, discordNickname, discordTag, init, lastClicked, lastTag, lastUser, logout, now, onError, onInitSuccess, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, receiveIdentity, renderEntries, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, showBoth, showList, showPlaying, showPlaylist, showQueue, showRecent, showStats, showTag, showUser, showWatchForm, showWatchLink, socket, startCast, updateOther;

constants = require('../constants');

socket = null;

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast';

lastClicked = null;

lastUser = null;

lastTag = null;

discordTag = null;

discordNickname = null;

castAvailable = false;

castSession = null;

opinionOrder = constants.opinionOrder;

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
  var i, len, str, u, unit, units;
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
  for (i = 0, len = units.length; i < len; i++) {
    unit = units[i];
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
  var actions, artist, count, e, entryIndex, extraInfo, feeling, html, i, k, len, m, params, ref, tag, title, url, v;
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
  for (entryIndex = i = 0, len = entries.length; i < len; entryIndex = ++i) {
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
    for (tag in e.tags) {
      extraInfo += `, ${tag}`;
    }
    if ((e.start !== -1) || (e.end !== -1)) {
      extraInfo += `, ${prettyDuration(e)}`;
    }
    if (e.opinions != null) {
      ref = e.opinions;
      for (feeling in ref) {
        count = ref[feeling];
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
    html += `<div> * <a target="_blank" href="${url}"><span class="entryartist">${artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="${url}"><span class="entrytitle">${title}</span></a> <span class="user">(${e.nickname}${extraInfo})</span>${actions}</div>
`;
  }
  return html;
};

showList = function(firstTitle, restTitle, url, isMap = false, sortMethod = SORT_NONE, tagFilter = null) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
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
    var i, len, name, nameString, other, ref, remainingCount;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        other = JSON.parse(xhttp.responseText);
        console.log(other);
        nameString = "";
        if ((other.names != null) && (other.names.length > 0)) {
          nameString = "";
          ref = other.names;
          for (i = 0, len = ref.length; i < len; i++) {
            name = ref[i];
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
        return document.getElementById("playing").innerHTML = `${other.playing} Watching${nameString}`;
      } catch (error) {

      }
    }
  };
  // nothing?
  xhttp.open("GET", "/info/other", true);
  return xhttp.send();
};

showPlaying = async function() {
  document.getElementById('main').innerHTML = (await showList("Now Playing:", "History:", "/info/history"));
  updateOther();
  return lastClicked = showPlaying;
};

showQueue = async function() {
  document.getElementById('main').innerHTML = (await showList("Up Next:", "Queue:", "/info/queue"));
  updateOther();
  return lastClicked = showQueue;
};

showBoth = async function() {
  var leftSide, rightSide;
  leftSide = (await showList("Now Playing:", "History:", "/info/history"));
  rightSide = (await showList("Up Next:", "Queue:", "/info/queue"));
  document.getElementById('main').innerHTML = `<div id="mainl">${leftSide}</div>
<div id="mainr">${rightSide}</div>`;
  updateOther();
  return lastClicked = showBoth;
};

showPlaylist = async function() {
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE));
  updateOther();
  return lastClicked = showPlaylist;
};

showRecent = async function() {
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ADDED));
  updateOther();
  return lastClicked = showRecent;
};

showTag = async function() {
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE, lastTag));
  updateOther();
  return lastClicked = showTag;
};

showStats = function() {
  var html, xhttp;
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var amt, duration, e, endTime, entries, i, j, k, l, len, len1, len2, len3, m, n, name1, startTime, tagCounts, tagName, tagNames, timeUnits, totalDuration, totalDurationString, unit, user, userCounts, userList, v;
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
        for (i = 0, len = entries.length; i < len; i++) {
          e = entries[i];
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
        for (j = 0, len1 = timeUnits.length; j < len1; j++) {
          unit = timeUnits[j];
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
        for (l = 0, len2 = userList.length; l < len2; l++) {
          user = userList[l];
          html += `<div> * <a href="#user/${encodeURIComponent(user)}">${user}</a>: ${userCounts[user]}</div>`;
        }
        html += `<div>&nbsp;</div>
<div class="statsheader">Songs by Tag:</div>`;
        tagNames = Object.keys(tagCounts).sort();
        for (n = 0, len3 = tagNames.length; n < len3; n++) {
          tagName = tagNames[n];
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
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var feeling, hasIncomingOpinions, hasOutgoingOpinions, i, incoming, j, l, len, len1, len2, len3, len4, len5, listHTML, n, name, o, outgoing, p, ref, ref1, sortedFeelings, userInfo;
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
      for (i = 0, len = opinionOrder.length; i < len; i++) {
        feeling = opinionOrder[i];
        if (userInfo.opinions[feeling] != null) {
          sortedFeelings.push(feeling);
        }
      }
      for (j = 0, len1 = sortedFeelings.length; j < len1; j++) {
        feeling = sortedFeelings[j];
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
            for (l = 0, len2 = opinionOrder.length; l < len2; l++) {
              feeling = opinionOrder[l];
              if (userInfo.otherTotals.incoming[feeling] != null) {
                html += `<li>${feeling}: ${userInfo.otherTotals.incoming[feeling]}</li>`;
              }
            }
            html += `</ul>`;
            html += `<li>Incoming by user:</li><ul>`;
            ref = userInfo.otherOpinions.incoming;
            for (name in ref) {
              incoming = ref[name];
              html += `<li><a href="#user/${encodeURIComponent(name)}">${name}</a></li><ul>`;
              for (n = 0, len3 = opinionOrder.length; n < len3; n++) {
                feeling = opinionOrder[n];
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
            for (o = 0, len4 = opinionOrder.length; o < len4; o++) {
              feeling = opinionOrder[o];
              if (userInfo.otherTotals.outgoing[feeling] != null) {
                html += `<li>${feeling}: ${userInfo.otherTotals.outgoing[feeling]}</li>`;
              }
            }
            html += `</ul>`;
            html += `<li>Outgoing by user:</li><ul>`;
            ref1 = userInfo.otherOpinions.outgoing;
            for (name in ref1) {
              outgoing = ref1[name];
              html += `<li><a href="#user/${encodeURIComponent(name)}">${name}</a></li><ul>`;
              for (p = 0, len5 = opinionOrder.length; p < len5; p++) {
                feeling = opinionOrder[p];
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
        var list, ref2;
        ref2 = userInfo.opinions;
        for (feeling in ref2) {
          list = ref2[feeling];
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
  var identityPayload, token;
  token = localStorage.getItem('token');
  identityPayload = {
    token: token
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
  var token;
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
  return prepareCast();
};

window.onload = init;


},{"../constants":2}],2:[function(require,module,exports){
module.exports = {
  opinions: {
    like: true,
    meh: true,
    bleh: true,
    hate: true
  },
  goodOpinions: { // don't skip these
    like: true,
    meh: true
  },
  opinionOrder: [
    'like',
    'meh',
    'bleh',
    'hate' // always in this specific order
  ]
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBLGVBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztBQUVaLE1BQUEsR0FBUzs7QUFFVCxrQkFBQSxHQUFxQjs7QUFFckIsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVzs7QUFDWCxPQUFBLEdBQVU7O0FBQ1YsVUFBQSxHQUFhOztBQUNiLGVBQUEsR0FBa0I7O0FBRWxCLGFBQUEsR0FBZ0I7O0FBQ2hCLFdBQUEsR0FBYzs7QUFFZCxZQUFBLEdBQWUsU0FBUyxDQUFDOztBQUV6QixHQUFBLEdBQU0sUUFBQSxDQUFBLENBQUE7QUFDSixTQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBeEI7QUFESDs7QUFHTixTQUFB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LFVBQVYsRUFBc0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtXQUNwQixlQUFBLENBQWdCLEdBQWhCO0VBRG9CLENBQXRCO1NBR0EsV0FBQSxDQUFBO0FBdkNLOztBQXlDUCxNQUFNLENBQUMsTUFBUCxHQUFnQjs7OztBQ3BtQmhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxRQUFBLEVBQ0U7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLEdBQUEsRUFBSyxJQURMO0lBRUEsSUFBQSxFQUFNLElBRk47SUFHQSxJQUFBLEVBQU07RUFITixDQURGO0VBTUEsWUFBQSxFQUNFLENBQUE7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLEdBQUEsRUFBSztFQURMLENBUEY7RUFVQSxZQUFBLEVBQWM7SUFBQyxNQUFEO0lBQVMsS0FBVDtJQUFnQixNQUFoQjtJQUF3QixNQUF4Qjs7QUFWZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0YW50cyA9IHJlcXVpcmUgJy4uL2NvbnN0YW50cydcclxuXHJcbnNvY2tldCA9IG51bGxcclxuXHJcbkRBU0hDQVNUX05BTUVTUEFDRSA9ICd1cm46eC1jYXN0OmVzLm9mZmQuZGFzaGNhc3QnXHJcblxyXG5sYXN0Q2xpY2tlZCA9IG51bGxcclxubGFzdFVzZXIgPSBudWxsXHJcbmxhc3RUYWcgPSBudWxsXHJcbmRpc2NvcmRUYWcgPSBudWxsXHJcbmRpc2NvcmROaWNrbmFtZSA9IG51bGxcclxuXHJcbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxyXG5jYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbm9waW5pb25PcmRlciA9IGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYWdlRXBvY2ggPSBub3coKVxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cclxuICB1bml0cyA9IFtcclxuICAgIHsgc3VmZml4OiBcImhcIiwgZmFjdG9yOiAzNjAwLCBza2lwOiB0cnVlIH1cclxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxyXG4gICAgeyBzdWZmaXg6IFwic1wiLCBmYWN0b3I6IDEsIHNraXA6IGZhbHNlIH1cclxuICBdXHJcblxyXG4gIHN0ciA9IFwiXCJcclxuICBmb3IgdW5pdCBpbiB1bml0c1xyXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxyXG4gICAgaWYgKHUgPiAwKSBvciBub3QgdW5pdC5za2lwXHJcbiAgICAgIHQgLT0gdSAqIHVuaXQuZmFjdG9yXHJcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXHJcbiAgICAgICAgc3RyICs9IFwiOlwiXHJcbiAgICAgICAgaWYgdSA8IDEwXHJcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcclxuICAgICAgc3RyICs9IFN0cmluZyh1KVxyXG4gIHJldHVybiBzdHJcclxuXHJcbnByZXR0eUR1cmF0aW9uID0gKGUpIC0+XHJcbiAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgIHN0YXJ0VGltZSA9IDBcclxuICBlbmRUaW1lID0gZS5lbmRcclxuICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgZW5kVGltZSA9IGUuZHVyYXRpb25cclxuICByZXR1cm4gXCIje3NlY29uZHNUb1RpbWUoc3RhcnRUaW1lKX0tI3tzZWNvbmRzVG9UaW1lKGVuZFRpbWUpfVwiXHJcblxyXG5TT1JUX05PTkUgPSAwXHJcblNPUlRfQVJUSVNUX1RJVExFID0gMVxyXG5TT1JUX0FEREVEID0gMlxyXG5cclxucmVuZGVyRW50cmllcyA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGVudHJpZXMsIGlzTWFwLCBzb3J0TWV0aG9kID0gU09SVF9OT05FLCB0YWdGaWx0ZXIgPSBudWxsKSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcblxyXG4gIGlmIGlzTWFwXHJcbiAgICAjIGNvbnNvbGUubG9nIGVudHJpZXNcclxuICAgIG0gPSBlbnRyaWVzXHJcbiAgICBlbnRyaWVzID0gW11cclxuICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgc3dpdGNoIHNvcnRNZXRob2RcclxuICAgIHdoZW4gU09SVF9BUlRJU1RfVElUTEVcclxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICByZXR1cm4gMFxyXG4gICAgd2hlbiBTT1JUX0FEREVEXHJcbiAgICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgICBpZiBhLmFkZGVkID4gYi5hZGRlZFxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS5hZGRlZCA8IGIuYWRkZWRcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIHJldHVybiAwXHJcblxyXG4gIGlmIG5vdCBmaXJzdFRpdGxlPyBhbmQgbm90IHJlc3RUaXRsZT8gYW5kIHRhZ0ZpbHRlcj9cclxuICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5UYWc6ICN7dGFnRmlsdGVyfTwvZGl2PlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcclxuICAgIGlmIHRhZ0ZpbHRlcj8gYW5kIG5vdCBlLnRhZ3NbdGFnRmlsdGVyXT9cclxuICAgICAgY29udGludWVcclxuXHJcbiAgICBhcnRpc3QgPSBlLmFydGlzdFxyXG4gICAgaWYgbm90IGFydGlzdD9cclxuICAgICAgYXJ0aXN0ID0gXCJVbmtub3duXCJcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICBmb3IgdGFnIG9mIGUudGFnc1xyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7dGFnfVwiXHJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgaWYgZGlzY29yZFRhZ1xyXG4gICAgICBhY3Rpb25zID0gXCJcIiAjIFwiIFsgRG8gc3R1ZmYgYXMgI3tkaXNjb3JkVGFnfSBdXCJcclxuICAgIGVsc2VcclxuICAgICAgYWN0aW9ucyA9IFwiXCJcclxuXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgcmV0dXJuIGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIHVybCwgaXNNYXAgPSBmYWxzZSwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgIHRyeVxyXG4gICAgICAgICAgb3RoZXIgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXHJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgaWYgb3RoZXIubmFtZXM/IGFuZCAob3RoZXIubmFtZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcclxuICAgICAgICAgICAgICBpZiBuYW1lU3RyaW5nLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NvdW50ID0gb3RoZXIucGxheWluZyAtIG90aGVyLm5hbWVzLmxlbmd0aFxyXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIjogI3tuYW1lU3RyaW5nfVwiXHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiI3tvdGhlci5wbGF5aW5nfSBXYXRjaGluZyN7bmFtZVN0cmluZ31cIlxyXG4gICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICMgbm90aGluZz9cclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dQbGF5aW5nID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlpbmdcclxuXHJcbnNob3dRdWV1ZSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcclxuXHJcbnNob3dCb3RoID0gLT5cclxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XHJcbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cclxuICBcIlwiXCJcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93UmVjZW50ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BRERFRClcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UmVjZW50XHJcblxyXG5zaG93VGFnID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUsIGxhc3RUYWcpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1RhZ1xyXG5cclxuc2hvd1N0YXRzID0gLT5cclxuICBodG1sID0gXCJcIlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgIHRyeVxyXG4gICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgbSA9IGVudHJpZXNcclxuICAgICAgICAgIGVudHJpZXMgPSBbXVxyXG4gICAgICAgICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICAgICAgICAgIHRvdGFsRHVyYXRpb24gPSAwXHJcblxyXG4gICAgICAgICAgdXNlckNvdW50cyA9IHt9XHJcbiAgICAgICAgICB0YWdDb3VudHMgPSB7fVxyXG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xyXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdID89IDBcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSArPSAxXHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcclxuICAgICAgICAgICAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgICAgICAgICAgIHN0YXJ0VGltZSA9IDBcclxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXHJcbiAgICAgICAgICAgIGlmIGVuZFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgZW5kVGltZSA9IGUuZHVyYXRpb25cclxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXHJcbiAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gKz0gZHVyYXRpb25cclxuXHJcbiAgICAgICAgICAgIGZvciB0YWdOYW1lIG9mIGUudGFnc1xyXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSA/PSAwXHJcbiAgICAgICAgICAgICAgdGFnQ291bnRzW3RhZ05hbWVdICs9IDFcclxuXHJcbiAgICAgICAgICB1c2VyTGlzdCA9IE9iamVjdC5rZXlzKHVzZXJDb3VudHMpXHJcbiAgICAgICAgICB1c2VyTGlzdC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxyXG4gICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPiB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcclxuICAgICAgICAgIHRpbWVVbml0cyA9IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnZGF5JywgZmFjdG9yOiAzNjAwICogMjQgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnbWluJywgZmFjdG9yOiA2MCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3NlY29uZCcsIGZhY3RvcjogMSB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgICBmb3IgdW5pdCBpbiB0aW1lVW5pdHNcclxuICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvbiA+PSB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxyXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gLT0gYW10ICogdW5pdC5mYWN0b3JcclxuICAgICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uU3RyaW5nLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxyXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIje2FtdH0gI3t1bml0Lm5hbWV9I3tpZiBhbXQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPkJhc2ljIFN0YXRzOjwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlRvdGFsIFNvbmdzOiAje2VudHJpZXMubGVuZ3RofTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxyXG4gICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICBmb3IgdXNlciBpbiB1c2VyTGlzdFxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHVzZXIpfVwiPiN7dXNlcn08L2E+OiAje3VzZXJDb3VudHNbdXNlcl19PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFRhZzo8L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdDb3VudHMpLnNvcnQoKVxyXG4gICAgICAgICAgZm9yIHRhZ05hbWUgaW4gdGFnTmFtZXNcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdGFnLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpfVwiPiN7dGFnTmFtZX08L2E+OiAje3RhZ0NvdW50c1t0YWdOYW1lXX08L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgIyBodG1sID0gXCI8cHJlPlwiICsgSlNPTi5zdHJpbmdpZnkodXNlckNvdW50cywgbnVsbCwgMikgKyBcIjwvcHJlPlwiXHJcblxyXG4gICAgICAgY2F0Y2hcclxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dTdGF0c1xyXG5cclxuc2hvd1VzZXIgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHVzZXJJbmZvID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgIGNhdGNoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Vc2VyOiAje2xhc3RVc2VyfTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGxpc3RIVE1MID0gXCJcIlxyXG5cclxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cclxuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xyXG5cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPkFkZGVkOjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4oTm8gaW5mbyBvbiB0aGlzIHVzZXIpPC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBoYXNJbmNvbWluZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmcpLmxlbmd0aCA+IDBcclxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcclxuXHJcbiAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9ucyBvciBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBpbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XHJcbiAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgb3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuXHJcbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyI3tmZWVsaW5nfVwiKS5pbm5lckhUTUwgPSByZW5kZXJFbnRyaWVzKG51bGwsIG51bGwsIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddLCBmYWxzZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gICAgICAsIDBcclxuXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJpbnB1dFwiKS5mb2N1cygpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICAjIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxucHJvY2Vzc0hhc2ggPSAtPlxyXG4gIGN1cnJlbnRIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcclxuICBpZiBtYXRjaGVzID0gY3VycmVudEhhc2gubWF0Y2goL14jdXNlclxcLyguKykvKVxyXG4gICAgbGFzdFVzZXIgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcclxuICAgIHNob3dVc2VyKClcclxuICAgIHJldHVyblxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN0YWdcXC8oLispLylcclxuICAgIGxhc3RUYWcgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcclxuICAgIHNob3dUYWcoKVxyXG4gICAgcmV0dXJuXHJcbiAgc3dpdGNoIGN1cnJlbnRIYXNoXHJcbiAgICB3aGVuICcjcXVldWUnXHJcbiAgICAgIHNob3dRdWV1ZSgpXHJcbiAgICB3aGVuICcjYWxsJ1xyXG4gICAgICBzaG93UGxheWxpc3QoKVxyXG4gICAgd2hlbiAnI3JlY2VudCdcclxuICAgICAgc2hvd1JlY2VudCgpXHJcbiAgICB3aGVuICcjYm90aCdcclxuICAgICAgc2hvd0JvdGgoKVxyXG4gICAgd2hlbiAnI3N0YXRzJ1xyXG4gICAgICBzaG93U3RhdHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBzaG93UGxheWluZygpXHJcblxyXG5sb2dvdXQgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXHJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcclxuICBzZW5kSWRlbnRpdHkoKVxyXG5cclxuc2VuZElkZW50aXR5ID0gLT5cclxuICB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IHRva2VuXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nIFwiU2VuZGluZyBpZGVudGlmeTogXCIsIGlkZW50aXR5UGF5bG9hZFxyXG4gIHNvY2tldC5lbWl0ICdpZGVudGlmeScsIGlkZW50aXR5UGF5bG9hZFxyXG5cclxucmVjZWl2ZUlkZW50aXR5ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcImlkZW50aWZ5IHJlc3BvbnNlOlwiLCBwa3RcclxuICBpZiBwa3QuZGlzYWJsZWRcclxuICAgIGNvbnNvbGUubG9nIFwiRGlzY29yZCBhdXRoIGRpc2FibGVkLlwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBwa3QudGFnPyBhbmQgKHBrdC50YWcubGVuZ3RoID4gMClcclxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXHJcbiAgICBkaXNjb3JkTmlja25hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICBpZiBwa3Qubmlja25hbWU/XHJcbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxyXG4gICAgICBkaXNjb3JkTmlja25hbWVTdHJpbmcgPSBcIiAoI3tkaXNjb3JkTmlja25hbWV9KVwiXHJcbiAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cclxuICAgIFwiXCJcIlxyXG4gIGVsc2VcclxuICAgIGRpc2NvcmRUYWcgPSBudWxsXHJcbiAgICBkaXNjb3JkTmlja25hbWUgPSBudWxsXHJcblxyXG4gICAgcmVkaXJlY3RVUkwgPSBTdHJpbmcod2luZG93LmxvY2F0aW9uKS5yZXBsYWNlKC8jLiokLywgXCJcIikgKyBcIm9hdXRoXCJcclxuICAgIGxvZ2luTGluayA9IFwiaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL2F1dGhvcml6ZT9jbGllbnRfaWQ9I3t3aW5kb3cuQ0xJRU5UX0lEfSZyZWRpcmVjdF91cmk9I3tlbmNvZGVVUklDb21wb25lbnQocmVkaXJlY3RVUkwpfSZyZXNwb25zZV90eXBlPWNvZGUmc2NvcGU9aWRlbnRpZnlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICBbPGEgaHJlZj1cIiN7bG9naW5MaW5rfVwiPkxvZ2luPC9hPl1cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxyXG4gIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgbGFzdENsaWNrZWQoKVxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIndhdGNoP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXHJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XHJcbiAgICBjYXN0U2Vzc2lvbiA9IGVcclxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCwgZm9yY2U6IHRydWUgfSlcclxuICAsIG9uRXJyb3JcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcclxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcclxuICB3aW5kb3cuc2hvd0JvdGggPSBzaG93Qm90aFxyXG4gIHdpbmRvdy5zaG93UGxheWluZyA9IHNob3dQbGF5aW5nXHJcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxyXG4gIHdpbmRvdy5zaG93UXVldWUgPSBzaG93UXVldWVcclxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXHJcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XHJcblxyXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcclxuICBpZiB0b2tlbj9cclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIHRva2VuKVxyXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcHJvY2Vzc0hhc2goKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICAjIHN3aXRjaCB3aGljaCBsaW5lIGlzIGNvbW1lbnRlZCBoZXJlIHRvIGFsbG93IGlkZW50aXR5IG9uIHRoZSBkYXNoXHJcbiAgICBzZW5kSWRlbnRpdHkoKVxyXG4gICAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG4gIHNvY2tldC5vbiAncmVmcmVzaCcsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBvcGluaW9uczpcclxuICAgIGxpa2U6IHRydWVcclxuICAgIG1laDogdHJ1ZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIG9waW5pb25PcmRlcjogWydsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcbiJdfQ==
