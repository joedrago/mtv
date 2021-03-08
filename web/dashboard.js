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
      extraInfo += `, ${constants.tags[tag]}`;
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
          html += `<div> * <a href="#tag/${encodeURIComponent(tagName)}">${constants.tags[tagName]}</a>: ${tagCounts[tagName]}</div>`;
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
    return sendIdentity();
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
  ],
  tags: {
    nsfw: "NSFW",
    bass: "Bass",
    dance: "Dance",
    bet: "BET",
    cmt: "CMT",
    vh1: "VH1"
  }
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsa0JBQUEsRUFBQSxVQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBLGVBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztBQUVaLE1BQUEsR0FBUzs7QUFFVCxrQkFBQSxHQUFxQjs7QUFFckIsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVzs7QUFDWCxPQUFBLEdBQVU7O0FBQ1YsVUFBQSxHQUFhOztBQUNiLGVBQUEsR0FBa0I7O0FBRWxCLGFBQUEsR0FBZ0I7O0FBQ2hCLFdBQUEsR0FBYzs7QUFFZCxZQUFBLEdBQWUsU0FBUyxDQUFDOztBQUV6QixHQUFBLEdBQU0sUUFBQSxDQUFBLENBQUE7QUFDSixTQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBeEI7QUFESDs7QUFHTixTQUFB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O0VBRG1CLENBQXJCO0VBSUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLFFBQUEsQ0FBQyxHQUFELENBQUE7V0FDcEIsZUFBQSxDQUFnQixHQUFoQjtFQURvQixDQUF0QjtTQUdBLFdBQUEsQ0FBQTtBQXJDSzs7QUF1Q1AsTUFBTSxDQUFDLE1BQVAsR0FBZ0I7Ozs7QUNsbUJoQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsUUFBQSxFQUNFO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxHQUFBLEVBQUssSUFETDtJQUVBLElBQUEsRUFBTSxJQUZOO0lBR0EsSUFBQSxFQUFNO0VBSE4sQ0FERjtFQU1BLFlBQUEsRUFDRSxDQUFBO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxHQUFBLEVBQUs7RUFETCxDQVBGO0VBVUEsWUFBQSxFQUFjO0lBQUMsTUFBRDtJQUFTLEtBQVQ7SUFBZ0IsTUFBaEI7SUFBd0IsTUFBeEI7R0FWZDtFQVlBLElBQUEsRUFDRTtJQUFBLElBQUEsRUFBTSxNQUFOO0lBRUEsSUFBQSxFQUFNLE1BRk47SUFHQSxLQUFBLEVBQU8sT0FIUDtJQUtBLEdBQUEsRUFBSyxLQUxMO0lBTUEsR0FBQSxFQUFLLEtBTkw7SUFPQSxHQUFBLEVBQUs7RUFQTDtBQWJGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbmxhc3RDbGlja2VkID0gbnVsbFxyXG5sYXN0VXNlciA9IG51bGxcclxubGFzdFRhZyA9IG51bGxcclxuZGlzY29yZFRhZyA9IG51bGxcclxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG5cclxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXHJcbmNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxub3Bpbmlvbk9yZGVyID0gY29uc3RhbnRzLm9waW5pb25PcmRlclxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhZ2VFcG9jaCA9IG5vdygpXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxyXG4gIHVuaXRzID0gW1xyXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxyXG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XHJcbiAgICB7IHN1ZmZpeDogXCJzXCIsIGZhY3RvcjogMSwgc2tpcDogZmFsc2UgfVxyXG4gIF1cclxuXHJcbiAgc3RyID0gXCJcIlxyXG4gIGZvciB1bml0IGluIHVuaXRzXHJcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXHJcbiAgICBpZiAodSA+IDApIG9yIG5vdCB1bml0LnNraXBcclxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcclxuICAgICAgICBzdHIgKz0gXCI6XCJcclxuICAgICAgICBpZiB1IDwgMTBcclxuICAgICAgICAgIHN0ciArPSBcIjBcIlxyXG4gICAgICBzdHIgKz0gU3RyaW5nKHUpXHJcbiAgcmV0dXJuIHN0clxyXG5cclxucHJldHR5RHVyYXRpb24gPSAoZSkgLT5cclxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBlLmVuZFxyXG4gIGlmIGVuZFRpbWUgPCAwXHJcbiAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcclxuXHJcblNPUlRfTk9ORSA9IDBcclxuU09SVF9BUlRJU1RfVElUTEUgPSAxXHJcblNPUlRfQURERUQgPSAyXHJcblxyXG5yZW5kZXJFbnRyaWVzID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUsIHRhZ0ZpbHRlciA9IG51bGwpIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuXHJcbiAgaWYgaXNNYXBcclxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xyXG4gICAgbSA9IGVudHJpZXNcclxuICAgIGVudHJpZXMgPSBbXVxyXG4gICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICBzd2l0Y2ggc29ydE1ldGhvZFxyXG4gICAgd2hlbiBTT1JUX0FSVElTVF9USVRMRVxyXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgIHJldHVybiAwXHJcbiAgICB3aGVuIFNPUlRfQURERURcclxuICAgICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgIGlmIGEuYWRkZWQgPiBiLmFkZGVkXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLmFkZGVkIDwgYi5hZGRlZFxyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgaWYgbm90IGZpcnN0VGl0bGU/IGFuZCBub3QgcmVzdFRpdGxlPyBhbmQgdGFnRmlsdGVyP1xyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPlRhZzogI3t0YWdGaWx0ZXJ9PC9kaXY+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgZm9yIGUsIGVudHJ5SW5kZXggaW4gZW50cmllc1xyXG4gICAgaWYgdGFnRmlsdGVyPyBhbmQgbm90IGUudGFnc1t0YWdGaWx0ZXJdP1xyXG4gICAgICBjb250aW51ZVxyXG5cclxuICAgIGFydGlzdCA9IGUuYXJ0aXN0XHJcbiAgICBpZiBub3QgYXJ0aXN0P1xyXG4gICAgICBhcnRpc3QgPSBcIlVua25vd25cIlxyXG4gICAgdGl0bGUgPSBlLnRpdGxlXHJcbiAgICBpZiBub3QgdGl0bGU/XHJcbiAgICAgIHRpdGxlID0gZS5pZFxyXG4gICAgcGFyYW1zID0gXCJcIlxyXG4gICAgaWYgZS5zdGFydCA+PSAwXHJcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXHJcbiAgICAgIHBhcmFtcyArPSBcInN0YXJ0PSN7ZS5zdGFydH1cIlxyXG4gICAgaWYgZS5lbmQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJlbmQ9I3tlLmVuZH1cIlxyXG4gICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7ZS5pZH0je3BhcmFtc31cIlxyXG5cclxuICAgIGV4dHJhSW5mbyA9IFwiXCJcclxuICAgIGZvciB0YWcgb2YgZS50YWdzXHJcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb25zdGFudHMudGFnc1t0YWddfVwiXHJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgaWYgZGlzY29yZFRhZ1xyXG4gICAgICBhY3Rpb25zID0gXCJcIiAjIFwiIFsgRG8gc3R1ZmYgYXMgI3tkaXNjb3JkVGFnfSBdXCJcclxuICAgIGVsc2VcclxuICAgICAgYWN0aW9ucyA9IFwiXCJcclxuXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5YXJ0aXN0XCI+I3thcnRpc3R9PC9zcGFuPjwvYT48c3BhbiBjbGFzcz1cImVudHJ5bWlkZGxlXCI+IC0gPC9zcGFuPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj48c3BhbiBjbGFzcz1cImVudHJ5dGl0bGVcIj4je3RpdGxlfTwvc3Bhbj48L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2Uubmlja25hbWV9I3tleHRyYUluZm99KTwvc3Bhbj4je2FjdGlvbnN9PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgcmV0dXJuIGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIHVybCwgaXNNYXAgPSBmYWxzZSwgc29ydE1ldGhvZCA9IFNPUlRfTk9ORSwgdGFnRmlsdGVyID0gbnVsbCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydE1ldGhvZCwgdGFnRmlsdGVyKSlcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgIHRyeVxyXG4gICAgICAgICAgb3RoZXIgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXHJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgaWYgb3RoZXIubmFtZXM/IGFuZCAob3RoZXIubmFtZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcclxuICAgICAgICAgICAgICBpZiBuYW1lU3RyaW5nLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NvdW50ID0gb3RoZXIucGxheWluZyAtIG90aGVyLm5hbWVzLmxlbmd0aFxyXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIjogI3tuYW1lU3RyaW5nfVwiXHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiI3tvdGhlci5wbGF5aW5nfSBXYXRjaGluZyN7bmFtZVN0cmluZ31cIlxyXG4gICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICMgbm90aGluZz9cclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dQbGF5aW5nID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlpbmdcclxuXHJcbnNob3dRdWV1ZSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcclxuXHJcbnNob3dCb3RoID0gLT5cclxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XHJcbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cclxuICBcIlwiXCJcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93UmVjZW50ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BRERFRClcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UmVjZW50XHJcblxyXG5zaG93VGFnID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BUlRJU1RfVElUTEUsIGxhc3RUYWcpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1RhZ1xyXG5cclxuc2hvd1N0YXRzID0gLT5cclxuICBodG1sID0gXCJcIlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgIHRyeVxyXG4gICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgbSA9IGVudHJpZXNcclxuICAgICAgICAgIGVudHJpZXMgPSBbXVxyXG4gICAgICAgICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICAgICAgICAgIHRvdGFsRHVyYXRpb24gPSAwXHJcblxyXG4gICAgICAgICAgdXNlckNvdW50cyA9IHt9XHJcbiAgICAgICAgICB0YWdDb3VudHMgPSB7fVxyXG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xyXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdID89IDBcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSArPSAxXHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcclxuICAgICAgICAgICAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgICAgICAgICAgIHN0YXJ0VGltZSA9IDBcclxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXHJcbiAgICAgICAgICAgIGlmIGVuZFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgZW5kVGltZSA9IGUuZHVyYXRpb25cclxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXHJcbiAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gKz0gZHVyYXRpb25cclxuXHJcbiAgICAgICAgICAgIGZvciB0YWdOYW1lIG9mIGUudGFnc1xyXG4gICAgICAgICAgICAgIHRhZ0NvdW50c1t0YWdOYW1lXSA/PSAwXHJcbiAgICAgICAgICAgICAgdGFnQ291bnRzW3RhZ05hbWVdICs9IDFcclxuXHJcbiAgICAgICAgICB1c2VyTGlzdCA9IE9iamVjdC5rZXlzKHVzZXJDb3VudHMpXHJcbiAgICAgICAgICB1c2VyTGlzdC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxyXG4gICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPiB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcclxuICAgICAgICAgIHRpbWVVbml0cyA9IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnZGF5JywgZmFjdG9yOiAzNjAwICogMjQgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnbWluJywgZmFjdG9yOiA2MCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3NlY29uZCcsIGZhY3RvcjogMSB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgICBmb3IgdW5pdCBpbiB0aW1lVW5pdHNcclxuICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvbiA+PSB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxyXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gLT0gYW10ICogdW5pdC5mYWN0b3JcclxuICAgICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uU3RyaW5nLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxyXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIje2FtdH0gI3t1bml0Lm5hbWV9I3tpZiBhbXQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPkJhc2ljIFN0YXRzOjwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlRvdGFsIFNvbmdzOiAje2VudHJpZXMubGVuZ3RofTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2PiZuYnNwOzwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxyXG4gICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICBmb3IgdXNlciBpbiB1c2VyTGlzdFxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHVzZXIpfVwiPiN7dXNlcn08L2E+OiAje3VzZXJDb3VudHNbdXNlcl19PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFRhZzo8L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdDb3VudHMpLnNvcnQoKVxyXG4gICAgICAgICAgZm9yIHRhZ05hbWUgaW4gdGFnTmFtZXNcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdGFnLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHRhZ05hbWUpfVwiPiN7Y29uc3RhbnRzLnRhZ3NbdGFnTmFtZV19PC9hPjogI3t0YWdDb3VudHNbdGFnTmFtZV19PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICMgaHRtbCA9IFwiPHByZT5cIiArIEpTT04uc3RyaW5naWZ5KHVzZXJDb3VudHMsIG51bGwsIDIpICsgXCI8L3ByZT5cIlxyXG5cclxuICAgICAgIGNhdGNoXHJcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93U3RhdHNcclxuXHJcbnNob3dVc2VyID0gLT5cclxuICBodG1sID0gXCJcIlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICB0cnlcclxuICAgICAgICB1c2VySW5mbyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICBjYXRjaFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+VXNlcjogI3tsYXN0VXNlcn08L2Rpdj5cclxuICAgICAgXCJcIlwiXHJcblxyXG4gICAgICBsaXN0SFRNTCA9IFwiXCJcclxuXHJcbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgaWYgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10/XHJcbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcclxuXHJcbiAgICAgIGZvciBmZWVsaW5nIGluIHNvcnRlZEZlZWxpbmdzXHJcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwidXNlciN7ZmVlbGluZ31cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGlmIHVzZXJJbmZvLmFkZGVkLmxlbmd0aCA+IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5BZGRlZDo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyYWRkZWRcIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGlmIGxpc3RIVE1MLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+KE5vIGluZm8gb24gdGhpcyB1c2VyKTwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaGFzSW5jb21pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nKS5sZW5ndGggPiAwXHJcbiAgICAgICAgaGFzT3V0Z29pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nKS5sZW5ndGggPiAwXHJcblxyXG4gICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnMgb3IgaGFzT3V0Z29pbmdPcGluaW9uc1xyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDx1bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnNcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIGluY29taW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMuaW5jb21pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgaW5jb21pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZzo8L2xpPlxyXG4gICAgICAgICAgICAgIDx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7dXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lLCBvdXRnb2luZyBvZiB1c2VySW5mby5vdGhlck9waW5pb25zLm91dGdvaW5nXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIG91dGdvaW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICBcIlwiXCJcclxuXHJcblxyXG4gICAgICBodG1sICs9IGxpc3RIVE1MXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG4gICAgICBzZXRUaW1lb3V0IC0+XHJcbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlciN7ZmVlbGluZ31cIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXSwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxyXG4gICAgICAgIGlmIHVzZXJJbmZvLmFkZGVkLmxlbmd0aCA+IDBcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCBTT1JUX0FSVElTVF9USVRMRSlcclxuICAgICAgLCAwXHJcblxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyaW5wdXRcIikuZm9jdXMoKVxyXG5cclxuc2hvd1dhdGNoTGluayA9IC0+XHJcbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbnByb2Nlc3NIYXNoID0gLT5cclxuICBjdXJyZW50SGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXHJcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcclxuICAgIGxhc3RVc2VyID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXHJcbiAgICBzaG93VXNlcigpXHJcbiAgICByZXR1cm5cclxuICBpZiBtYXRjaGVzID0gY3VycmVudEhhc2gubWF0Y2goL14jdGFnXFwvKC4rKS8pXHJcbiAgICBsYXN0VGFnID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXHJcbiAgICBzaG93VGFnKClcclxuICAgIHJldHVyblxyXG4gIHN3aXRjaCBjdXJyZW50SGFzaFxyXG4gICAgd2hlbiAnI3F1ZXVlJ1xyXG4gICAgICBzaG93UXVldWUoKVxyXG4gICAgd2hlbiAnI2FsbCdcclxuICAgICAgc2hvd1BsYXlsaXN0KClcclxuICAgIHdoZW4gJyNyZWNlbnQnXHJcbiAgICAgIHNob3dSZWNlbnQoKVxyXG4gICAgd2hlbiAnI2JvdGgnXHJcbiAgICAgIHNob3dCb3RoKClcclxuICAgIHdoZW4gJyNzdGF0cydcclxuICAgICAgc2hvd1N0YXRzKClcclxuICAgIGVsc2VcclxuICAgICAgc2hvd1BsYXlpbmcoKVxyXG5cclxubG9nb3V0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiTG9nZ2luZyBvdXQuLi5cIlxyXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXHJcbiAgc2VuZElkZW50aXR5KClcclxuXHJcbnNlbmRJZGVudGl0eSA9IC0+XHJcbiAgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIGlkZW50aXR5UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiB0b2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcclxuICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgIGxhc3RDbGlja2VkKClcclxuXHJcbm9uSW5pdFN1Y2Nlc3MgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcclxuICBjYXN0QXZhaWxhYmxlID0gdHJ1ZVxyXG5cclxub25FcnJvciA9IChtZXNzYWdlKSAtPlxyXG5cclxuc2Vzc2lvbkxpc3RlbmVyID0gKGUpIC0+XHJcbiAgY2FzdFNlc3Npb24gPSBlXHJcblxyXG5zZXNzaW9uVXBkYXRlTGlzdGVuZXIgPSAoaXNBbGl2ZSkgLT5cclxuICBpZiBub3QgaXNBbGl2ZVxyXG4gICAgY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5wcmVwYXJlQ2FzdCA9IC0+XHJcbiAgaWYgbm90IGNocm9tZS5jYXN0IG9yIG5vdCBjaHJvbWUuY2FzdC5pc0F2YWlsYWJsZVxyXG4gICAgaWYgbm93KCkgPCAocGFnZUVwb2NoICsgMTApICMgZ2l2ZSB1cCBhZnRlciAxMCBzZWNvbmRzXHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxyXG4gIGFwaUNvbmZpZyA9IG5ldyBjaHJvbWUuY2FzdC5BcGlDb25maWcgc2Vzc2lvblJlcXVlc3QsIHNlc3Npb25MaXN0ZW5lciwgLT5cclxuICBjaHJvbWUuY2FzdC5pbml0aWFsaXplKGFwaUNvbmZpZywgb25Jbml0U3VjY2Vzcywgb25FcnJvcilcclxuXHJcbnN0YXJ0Q2FzdCA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJzdGFydCBjYXN0IVwiXHJcblxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJ3YXRjaD9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxyXG4gICAgY2FzdFNlc3Npb24gPSBlXHJcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXHJcbiAgLCBvbkVycm9yXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cubG9nb3V0ID0gbG9nb3V0XHJcbiAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IHByb2Nlc3NIYXNoXHJcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcclxuICB3aW5kb3cuc2hvd1BsYXlpbmcgPSBzaG93UGxheWluZ1xyXG4gIHdpbmRvdy5zaG93UGxheWxpc3QgPSBzaG93UGxheWxpc3RcclxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXHJcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xyXG4gIHdpbmRvdy5zaG93VXNlciA9IHNob3dVc2VyXHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxyXG5cclxuICB0b2tlbiA9IHFzKCd0b2tlbicpXHJcbiAgaWYgdG9rZW4/XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbilcclxuICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvJ1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHByb2Nlc3NIYXNoKClcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgc2VuZElkZW50aXR5KClcclxuXHJcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG4gIHNvY2tldC5vbiAncmVmcmVzaCcsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBvcGluaW9uczpcclxuICAgIGxpa2U6IHRydWVcclxuICAgIG1laDogdHJ1ZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBnb29kT3BpbmlvbnM6ICMgZG9uJ3Qgc2tpcCB0aGVzZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIG9waW5pb25PcmRlcjogWydsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcblxyXG4gIHRhZ3M6XHJcbiAgICBuc2Z3OiBcIk5TRldcIlxyXG5cclxuICAgIGJhc3M6IFwiQmFzc1wiXHJcbiAgICBkYW5jZTogXCJEYW5jZVwiXHJcblxyXG4gICAgYmV0OiBcIkJFVFwiXHJcbiAgICBjbXQ6IFwiQ01UXCJcclxuICAgIHZoMTogXCJWSDFcIlxyXG4iXX0=
