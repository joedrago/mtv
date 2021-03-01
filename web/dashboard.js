(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DASHCAST_NAMESPACE, SORT_ADDED, SORT_ARTIST_TITLE, SORT_NONE, castAvailable, castSession, discordNickname, discordTag, init, lastClicked, lastUser, logout, now, onError, onInitSuccess, opinionOrder, pageEpoch, prepareCast, prettyDuration, processHash, qs, receiveIdentity, renderEntries, secondsToTime, sendIdentity, sessionListener, sessionUpdateListener, showBoth, showList, showPlaying, showPlaylist, showQueue, showRecent, showStats, showUser, showWatchForm, showWatchLink, socket, startCast, updateOther;

socket = null;

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast';

lastClicked = null;

lastUser = null;

discordTag = null;

discordNickname = null;

castAvailable = false;

castSession = null;

opinionOrder = [
  'like',
  'meh',
  'bleh',
  'hate' // always in this specific order
];

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

renderEntries = function(firstTitle, restTitle, entries, isMap, sortMethod = SORT_NONE) {
  var actions, artist, count, e, entryIndex, extraInfo, feeling, html, i, k, len, m, params, ref, title, url, v;
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
  for (entryIndex = i = 0, len = entries.length; i < len; entryIndex = ++i) {
    e = entries[entryIndex];
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
    if (e.nsfw) {
      extraInfo += ", NSFW";
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

showList = function(firstTitle, restTitle, url, isMap = false, sortMethod = SORT_NONE) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          return resolve(renderEntries(firstTitle, restTitle, entries, isMap, sortMethod));
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

showStats = function() {
  var html, xhttp;
  html = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var amt, duration, e, endTime, entries, i, j, k, l, len, len1, len2, m, name1, startTime, timeUnits, totalDuration, totalDurationString, unit, user, userCounts, userList, v;
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
      url: mtvURL
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGtCQUFBLEVBQUEsVUFBQSxFQUFBLGlCQUFBLEVBQUEsU0FBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUEsZUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQSxxQkFBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFFVCxrQkFBQSxHQUFxQjs7QUFFckIsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVzs7QUFDWCxVQUFBLEdBQWE7O0FBQ2IsZUFBQSxHQUFrQjs7QUFFbEIsYUFBQSxHQUFnQjs7QUFDaEIsV0FBQSxHQUFjOztBQUVkLFlBQUEsR0FBZTtFQUFDLE1BQUQ7RUFBUyxLQUFUO0VBQWdCLE1BQWhCO0VBQXdCLE1BQXhCOzs7QUFFZixHQUFBLEdBQU0sUUFBQSxDQUFBLENBQUE7QUFDSixTQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsSUFBeEI7QUFESDs7QUFHTixTQUFBLEdBQVksR0FBQSxDQUFBOztBQUVaLEVBQUEsR0FBSyxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ0wsTUFBQSxLQUFB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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInNvY2tldCA9IG51bGxcblxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcblxubGFzdENsaWNrZWQgPSBudWxsXG5sYXN0VXNlciA9IG51bGxcbmRpc2NvcmRUYWcgPSBudWxsXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXG5cbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxuY2FzdFNlc3Npb24gPSBudWxsXG5cbm9waW5pb25PcmRlciA9IFsnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxucGFnZUVwb2NoID0gbm93KClcblxucXMgPSAobmFtZSkgLT5cbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cbiAgICByZXR1cm4gbnVsbFxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXG5cbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cbiAgdW5pdHMgPSBbXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxuICAgIHsgc3VmZml4OiBcInNcIiwgZmFjdG9yOiAxLCBza2lwOiBmYWxzZSB9XG4gIF1cblxuICBzdHIgPSBcIlwiXG4gIGZvciB1bml0IGluIHVuaXRzXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxuICAgIGlmICh1ID4gMCkgb3Igbm90IHVuaXQuc2tpcFxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXG4gICAgICAgIHN0ciArPSBcIjpcIlxuICAgICAgICBpZiB1IDwgMTBcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcbiAgICAgIHN0ciArPSBTdHJpbmcodSlcbiAgcmV0dXJuIHN0clxuXG5wcmV0dHlEdXJhdGlvbiA9IChlKSAtPlxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XG4gIGlmIHN0YXJ0VGltZSA8IDBcbiAgICBzdGFydFRpbWUgPSAwXG4gIGVuZFRpbWUgPSBlLmVuZFxuICBpZiBlbmRUaW1lIDwgMFxuICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcblxuU09SVF9OT05FID0gMFxuU09SVF9BUlRJU1RfVElUTEUgPSAxXG5TT1JUX0FEREVEID0gMlxuXG5yZW5kZXJFbnRyaWVzID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QgPSBTT1JUX05PTkUpIC0+XG4gIGh0bWwgPSBcIlwiXG5cbiAgaWYgaXNNYXBcbiAgICAjIGNvbnNvbGUubG9nIGVudHJpZXNcbiAgICBtID0gZW50cmllc1xuICAgIGVudHJpZXMgPSBbXVxuICAgIGZvciBrLCB2IG9mIG1cbiAgICAgIGVudHJpZXMucHVzaCB2XG5cbiAgc3dpdGNoIHNvcnRNZXRob2RcbiAgICB3aGVuIFNPUlRfQVJUSVNUX1RJVExFXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgd2hlbiBTT1JUX0FEREVEXG4gICAgICBlbnRyaWVzLnNvcnQgKGEsIGIpIC0+XG4gICAgICAgIGlmIGEuYWRkZWQgPiBiLmFkZGVkXG4gICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgIGlmIGEuYWRkZWQgPCBiLmFkZGVkXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICBmb3IgZSwgZW50cnlJbmRleCBpbiBlbnRyaWVzXG4gICAgYXJ0aXN0ID0gZS5hcnRpc3RcbiAgICBpZiBub3QgYXJ0aXN0P1xuICAgICAgYXJ0aXN0ID0gXCJVbmtub3duXCJcbiAgICB0aXRsZSA9IGUudGl0bGVcbiAgICBpZiBub3QgdGl0bGU/XG4gICAgICB0aXRsZSA9IGUuaWRcbiAgICBwYXJhbXMgPSBcIlwiXG4gICAgaWYgZS5zdGFydCA+PSAwXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxuICAgICAgcGFyYW1zICs9IFwic3RhcnQ9I3tlLnN0YXJ0fVwiXG4gICAgaWYgZS5lbmQgPj0gMFxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcbiAgICAgIHBhcmFtcyArPSBcImVuZD0je2UuZW5kfVwiXG4gICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7ZS5pZH0je3BhcmFtc31cIlxuXG4gICAgZXh0cmFJbmZvID0gXCJcIlxuICAgIGlmIGUubnNmd1xuICAgICAgZXh0cmFJbmZvICs9IFwiLCBOU0ZXXCJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3twcmV0dHlEdXJhdGlvbihlKX1cIlxuICAgIGlmIGUub3BpbmlvbnM/XG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7Y291bnR9ICN7ZmVlbGluZ30je2lmIGNvdW50ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgIGlmIGZpcnN0VGl0bGU/XG4gICAgICBpZiAoZW50cnlJbmRleCA9PSAwKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3Q29udGFpbmVyXCI+PGltZyBjbGFzcz1cInByZXZpZXdcIiBzcmM9XCIje2UudGh1bWJ9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je3Jlc3RUaXRsZX08L2Rpdj5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBpZiBkaXNjb3JkVGFnXG4gICAgICBhY3Rpb25zID0gXCJcIiAjIFwiIFsgRG8gc3R1ZmYgYXMgI3tkaXNjb3JkVGFnfSBdXCJcbiAgICBlbHNlXG4gICAgICBhY3Rpb25zID0gXCJcIlxuXG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxkaXY+ICogPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS5uaWNrbmFtZX0je2V4dHJhSW5mb30pPC9zcGFuPiN7YWN0aW9uc308L2Rpdj5cblxuICAgIFwiXCJcIlxuICByZXR1cm4gaHRtbFxuXG5cbnNob3dMaXN0ID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgdXJsLCBpc01hcCA9IGZhbHNlLCBzb3J0TWV0aG9kID0gU09SVF9OT05FKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShyZW5kZXJFbnRyaWVzKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRNZXRob2QpKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUoXCJFcnJvclwiKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG51cGRhdGVPdGhlciA9IC0+XG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICB0cnlcbiAgICAgICAgICBvdGhlciA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXG4gICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcbiAgICAgICAgICBpZiBvdGhlci5uYW1lcz8gYW5kIChvdGhlci5uYW1lcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcbiAgICAgICAgICAgIGZvciBuYW1lIGluIG90aGVyLm5hbWVzXG4gICAgICAgICAgICAgIGlmIG5hbWVTdHJpbmcubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gbmFtZVxuICAgICAgICAgICAgcmVtYWluaW5nQ291bnQgPSBvdGhlci5wbGF5aW5nIC0gb3RoZXIubmFtZXMubGVuZ3RoXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiArICN7cmVtYWluaW5nQ291bnR9IGFub25cIlxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiOiAje25hbWVTdHJpbmd9XCJcblxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWluZ1wiKS5pbm5lckhUTUwgPSBcIiN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9XCJcbiAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICMgbm90aGluZz9cbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL290aGVyXCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG5zaG93UGxheWluZyA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXG5cbnNob3dRdWV1ZSA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcblxuc2hvd0JvdGggPSAtPlxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXG4gIHJpZ2h0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XG4gICAgPGRpdiBpZD1cIm1haW5yXCI+I3tyaWdodFNpZGV9PC9kaXY+XG4gIFwiXCJcIlxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcblxuc2hvd1BsYXlsaXN0ID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUsIFNPUlRfQVJUSVNUX1RJVExFKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XG5cbnNob3dSZWNlbnQgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSwgU09SVF9BRERFRClcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dSZWNlbnRcblxuc2hvd1N0YXRzID0gLT5cbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgIHRyeVxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICBtID0gZW50cmllc1xuICAgICAgICAgIGVudHJpZXMgPSBbXVxuICAgICAgICAgIGZvciBrLCB2IG9mIG1cbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XG5cbiAgICAgICAgICB0b3RhbER1cmF0aW9uID0gMFxuXG4gICAgICAgICAgdXNlckNvdW50cyA9IHt9XG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSA/PSAwXG4gICAgICAgICAgICB1c2VyQ291bnRzW2Uubmlja25hbWVdICs9IDFcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IGUuc3RhcnRcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxuICAgICAgICAgICAgZW5kVGltZSA9IGUuZW5kXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmRUaW1lIC0gc3RhcnRUaW1lXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXG5cbiAgICAgICAgICB1c2VyTGlzdCA9IE9iamVjdC5rZXlzKHVzZXJDb3VudHMpXG4gICAgICAgICAgdXNlckxpc3Quc29ydCAoYSwgYikgLT5cbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXG4gICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdID4gdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgIHJldHVybiAwXG5cbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxuICAgICAgICAgIHRpbWVVbml0cyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2RheScsIGZhY3RvcjogMzYwMCAqIDI0IH1cbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnbWluJywgZmFjdG9yOiA2MCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdzZWNvbmQnLCBmYWN0b3I6IDEgfVxuICAgICAgICAgIF1cbiAgICAgICAgICBmb3IgdW5pdCBpbiB0aW1lVW5pdHNcbiAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb24gPj0gdW5pdC5mYWN0b3JcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb24gLT0gYW10ICogdW5pdC5mYWN0b3JcbiAgICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvblN0cmluZy5sZW5ndGggIT0gMFxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXG4gICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIje2FtdH0gI3t1bml0Lm5hbWV9I3tpZiBhbXQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxuXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPkJhc2ljIFN0YXRzOjwvZGl2PlxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBTb25nczogI3tlbnRyaWVzLmxlbmd0aH08L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cblxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZm9yIHVzZXIgaW4gdXNlckxpc3RcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXY+ICogPGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHVzZXIpfVwiPiN7dXNlcn08L2E+OiAje3VzZXJDb3VudHNbdXNlcl19PC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICMgaHRtbCA9IFwiPHByZT5cIiArIEpTT04uc3RyaW5naWZ5KHVzZXJDb3VudHMsIG51bGwsIDIpICsgXCI8L3ByZT5cIlxuXG4gICAgICAgY2F0Y2hcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93U3RhdHNcblxuc2hvd1VzZXIgPSAtPlxuICBodG1sID0gXCJcIlxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgIHRyeVxuICAgICAgICB1c2VySW5mbyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgY2F0Y2hcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+VXNlcjogI3tsYXN0VXNlcn08L2Rpdj5cbiAgICAgIFwiXCJcIlxuXG4gICAgICBsaXN0SFRNTCA9IFwiXCJcblxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxuICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgIGlmIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddP1xuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xuXG4gICAgICBmb3IgZmVlbGluZyBpbiBzb3J0ZWRGZWVsaW5nc1xuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXIje2ZlZWxpbmd9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5BZGRlZDo8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPVwidXNlcmFkZGVkXCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBpZiBsaXN0SFRNTC5sZW5ndGggPT0gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+KE5vIGluZm8gb24gdGhpcyB1c2VyKTwvZGl2PlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaGFzSW5jb21pbmdPcGluaW9ucyA9IE9iamVjdC5rZXlzKHVzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nKS5sZW5ndGggPiAwXG4gICAgICAgIGhhc091dGdvaW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZykubGVuZ3RoID4gMFxuXG4gICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnMgb3IgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGlmIGhhc0luY29taW5nT3BpbmlvbnNcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7dXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGZvciBuYW1lLCBpbmNvbWluZyBvZiB1c2VySW5mby5vdGhlck9waW5pb25zLmluY29taW5nXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgICAgaWYgaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmc6PC9saT5cbiAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgb3V0Z29pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5vdXRnb2luZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIG91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgXCJcIlwiXG5cblxuICAgICAgaHRtbCArPSBsaXN0SFRNTFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcblxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlciN7ZmVlbGluZ31cIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXSwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxuICAgICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIFNPUlRfQVJUSVNUX1RJVExFKVxuICAgICAgLCAwXG5cbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXG4gIHhodHRwLnNlbmQoKVxuXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxuXG5zaG93V2F0Y2hGb3JtID0gLT5cbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyaW5wdXRcIikuZm9jdXMoKVxuXG5zaG93V2F0Y2hMaW5rID0gLT5cbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbnByb2Nlc3NIYXNoID0gLT5cbiAgY3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxuICBpZiBtYXRjaGVzID0gY3VycmVudEhhc2gubWF0Y2goL14jdXNlclxcLyguKykvKVxuICAgIGxhc3RVc2VyID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXG4gICAgc2hvd1VzZXIoKVxuICAgIHJldHVyblxuICBzd2l0Y2ggY3VycmVudEhhc2hcbiAgICB3aGVuICcjcXVldWUnXG4gICAgICBzaG93UXVldWUoKVxuICAgIHdoZW4gJyNhbGwnXG4gICAgICBzaG93UGxheWxpc3QoKVxuICAgIHdoZW4gJyNyZWNlbnQnXG4gICAgICBzaG93UmVjZW50KClcbiAgICB3aGVuICcjYm90aCdcbiAgICAgIHNob3dCb3RoKClcbiAgICB3aGVuICcjc3RhdHMnXG4gICAgICBzaG93U3RhdHMoKVxuICAgIGVsc2VcbiAgICAgIHNob3dQbGF5aW5nKClcblxubG9nb3V0ID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcbiAgc2VuZElkZW50aXR5KClcblxuc2VuZElkZW50aXR5ID0gLT5cbiAgdG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxuICBpZGVudGl0eVBheWxvYWQgPSB7XG4gICAgdG9rZW46IHRva2VuXG4gIH1cbiAgY29uc29sZS5sb2cgXCJTZW5kaW5nIGlkZW50aWZ5OiBcIiwgaWRlbnRpdHlQYXlsb2FkXG4gIHNvY2tldC5lbWl0ICdpZGVudGlmeScsIGlkZW50aXR5UGF5bG9hZFxuXG5yZWNlaXZlSWRlbnRpdHkgPSAocGt0KSAtPlxuICBjb25zb2xlLmxvZyBcImlkZW50aWZ5IHJlc3BvbnNlOlwiLCBwa3RcbiAgaWYgcGt0LmRpc2FibGVkXG4gICAgY29uc29sZS5sb2cgXCJEaXNjb3JkIGF1dGggZGlzYWJsZWQuXCJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcbiAgICByZXR1cm5cblxuICBpZiBwa3QudGFnPyBhbmQgKHBrdC50YWcubGVuZ3RoID4gMClcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xuICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiXCJcbiAgICBpZiBwa3Qubmlja25hbWU/XG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcbiAgICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiICgje2Rpc2NvcmROaWNrbmFtZX0pXCJcbiAgICBodG1sID0gXCJcIlwiXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcblxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgWzxhIGhyZWY9XCIje2xvZ2luTGlua31cIj5Mb2dpbjwvYT5dXG4gICAgXCJcIlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxuICBpZiBsYXN0Q2xpY2tlZD9cbiAgICBsYXN0Q2xpY2tlZCgpXG5cbm9uSW5pdFN1Y2Nlc3MgPSAtPlxuICBjb25zb2xlLmxvZyBcIkNhc3QgYXZhaWxhYmxlIVwiXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXG5cbm9uRXJyb3IgPSAobWVzc2FnZSkgLT5cblxuc2Vzc2lvbkxpc3RlbmVyID0gKGUpIC0+XG4gIGNhc3RTZXNzaW9uID0gZVxuXG5zZXNzaW9uVXBkYXRlTGlzdGVuZXIgPSAoaXNBbGl2ZSkgLT5cbiAgaWYgbm90IGlzQWxpdmVcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcblxucHJlcGFyZUNhc3QgPSAtPlxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXG4gICAgaWYgbm93KCkgPCAocGFnZUVwb2NoICsgMTApICMgZ2l2ZSB1cCBhZnRlciAxMCBzZWNvbmRzXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChwcmVwYXJlQ2FzdCwgMTAwKVxuICAgIHJldHVyblxuXG4gIHNlc3Npb25SZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0LlNlc3Npb25SZXF1ZXN0KCc1QzNGMEEzQycpICMgRGFzaGNhc3RcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxuICBjaHJvbWUuY2FzdC5pbml0aWFsaXplKGFwaUNvbmZpZywgb25Jbml0U3VjY2Vzcywgb25FcnJvcilcblxuc3RhcnRDYXN0ID0gLT5cbiAgY29uc29sZS5sb2cgXCJzdGFydCBjYXN0IVwiXG5cbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwid2F0Y2g/XCIgKyBxdWVyeXN0cmluZ1xuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxuICAgIGNhc3RTZXNzaW9uID0gZVxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCB9KVxuICAsIG9uRXJyb3JcblxuaW5pdCA9IC0+XG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcbiAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IHByb2Nlc3NIYXNoXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXG4gIHdpbmRvdy5zaG93UGxheWluZyA9IHNob3dQbGF5aW5nXG4gIHdpbmRvdy5zaG93UGxheWxpc3QgPSBzaG93UGxheWxpc3RcbiAgd2luZG93LnNob3dRdWV1ZSA9IHNob3dRdWV1ZVxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXG4gIHdpbmRvdy5zaG93VXNlciA9IHNob3dVc2VyXG4gIHdpbmRvdy5zaG93V2F0Y2hGb3JtID0gc2hvd1dhdGNoRm9ybVxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxuXG4gIHRva2VuID0gcXMoJ3Rva2VuJylcbiAgaWYgdG9rZW4/XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgdG9rZW4pXG4gICAgd2luZG93LmxvY2F0aW9uID0gJy8nXG4gICAgcmV0dXJuXG5cbiAgcHJvY2Vzc0hhc2goKVxuXG4gIHNvY2tldCA9IGlvKClcblxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxuICAgIHNlbmRJZGVudGl0eSgpXG5cbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cbiAgICBpZiBsYXN0Q2xpY2tlZD9cbiAgICAgIGxhc3RDbGlja2VkKClcblxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxuICAgIGlmIGxhc3RDbGlja2VkP1xuICAgICAgbGFzdENsaWNrZWQoKVxuXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXG5cbiAgcHJlcGFyZUNhc3QoKVxuXG53aW5kb3cub25sb2FkID0gaW5pdFxuIl19
