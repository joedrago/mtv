(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CastPlayer, beginCast, init, lastClicked, lastUser, opinionOrder, prettyDuration, processHash, renderEntries, secondsToTime, showBoth, showList, showPlaying, showPlaylist, showQueue, showStats, showUser, showWatchForm, showWatchLink, socket, updateOther;

socket = null;

lastClicked = null;

lastUser = null;

opinionOrder = [
  'like',
  'meh',
  'bleh',
  'hate' // always in this specific order
];

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

renderEntries = function(firstTitle, restTitle, entries, isMap, sortList = false, showPlayCounts = false) {
  var count, e, entryIndex, extraInfo, feeling, html, i, k, len, m, params, ref, title, url, v;
  html = "";
  if (isMap) {
    // console.log entries
    m = entries;
    entries = [];
    for (k in m) {
      v = m[k];
      entries.push(v);
    }
    // This is the "all" list, sort it
    sortList = true;
  }
  if (sortList) {
    entries.sort(function(a, b) {
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
    html += `<div> * <a target="_blank" href="${url}">${title}</a> <span class="user">(${e.user}${extraInfo})</span></div>
`;
  }
  return html;
};

showList = function(firstTitle, restTitle, url, isMap = false) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          return resolve(renderEntries(firstTitle, restTitle, entries, isMap));
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
        return document.getElementById("playing").innerHTML = `(${other.playing} Watching${nameString})`;
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
  document.getElementById('main').innerHTML = (await showList(null, null, "/info/playlist", true));
  updateOther();
  return lastClicked = showPlaylist;
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
          if (userCounts[name1 = e.user] == null) {
            userCounts[name1] = 0;
          }
          userCounts[e.user] += 1;
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
          document.getElementById(`user${feeling}`).innerHTML = renderEntries(null, null, userInfo.opinions[feeling], false, true, true);
        }
        if (userInfo.added.length > 0) {
          return document.getElementById("useradded").innerHTML = renderEntries(null, null, userInfo.added, false, true, true);
        }
      }, 0);
    }
  };
  xhttp.open("GET", `/info/user?user=${encodeURIComponent(lastUser)}`, true);
  xhttp.send();
  updateOther();
  return lastClicked = showUser;
};

CastPlayer = class CastPlayer {
  constructor() {
    this.remotePlayer = null;
    this.remotePlayerController = null;
  }

  initializeCastPlayer() {
    var options;
    options = {
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    };
    cast.framework.CastContext.getInstance().setOptions(options);
    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
    return this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, this.switchPlayer.bind(this));
  }

  switchPlayer() {
    var sessionState;
    sessionState = cast.framework.CastContext.getInstance().getSessionState();
    if (sessionState !== cast.framework.SessionState.SESSION_STARTED) {
      console.log("Session ended!");
      return;
    }
    console.log("Session starting!");
    return socket.emit('castready', {
      id: socket.id
    });
  }

};

beginCast = function(pkt) {
  var castSession, mediaInfo, request, sessionState;
  console.log("CAST:", pkt);
  sessionState = cast.framework.CastContext.getInstance().getSessionState();
  if (sessionState !== cast.framework.SessionState.SESSION_STARTED) {
    console.log("No session; skipping beginCast");
    return;
  }
  console.log("Starting cast!");
  castSession = cast.framework.CastContext.getInstance().getCurrentSession();
  mediaInfo = new chrome.cast.media.MediaInfo(pkt.url, 'video/mp4');
  request = new chrome.cast.media.LoadRequest(mediaInfo);
  if (pkt.start > 0) {
    request.currentTime = pkt.start;
  }
  return castSession.loadMedia(request);
};

showWatchForm = function() {
  document.getElementById('aslink').style.display = 'none';
  document.getElementById('asform').style.display = 'inline-block';
  return document.getElementById("userinput").focus();
};

showWatchLink = function() {
  document.getElementById('aslink').style.display = 'inline-block';
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
    case '#both':
      return showBoth();
    case '#stats':
      return showStats();
    default:
      return showPlaying();
  }
};

init = function() {
  window.showPlaying = showPlaying;
  window.showQueue = showQueue;
  window.showPlaylist = showPlaylist;
  window.showBoth = showBoth;
  window.showStats = showStats;
  window.showUser = showUser;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.onhashchange = processHash;
  processHash();
  socket = io();
  socket.on('cast', function(pkt) {
    return beginCast(pkt);
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
  window.__onGCastApiAvailable = function(isAvailable) {
    var castPlayer;
    console.log(`__onGCastApiAvailable fired: ${isAvailable}`);
    castPlayer = new CastPlayer();
    if (isAvailable) {
      return castPlayer.initializeCastPlayer();
    }
  };
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUVULFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBRVgsWUFBQSxHQUFlO0VBQUMsTUFBRDtFQUFTLEtBQVQ7RUFBZ0IsTUFBaEI7RUFBd0IsTUFBeEI7OztBQUVmLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVE7SUFDTjtNQUFFLE1BQUEsRUFBUSxHQUFWO01BQWUsTUFBQSxFQUFRLElBQXZCO01BQTZCLElBQUEsRUFBTTtJQUFuQyxDQURNO0lBRU47TUFBRSxNQUFBLEVBQVEsR0FBVjtNQUFlLE1BQUEsRUFBUSxFQUF2QjtNQUEyQixJQUFBLEVBQU07SUFBakMsQ0FGTTtJQUdOO01BQUUsTUFBQSxFQUFRLEdBQVY7TUFBZSxNQUFBLEVBQVEsQ0FBdkI7TUFBMEIsSUFBQSxFQUFNO0lBQWhDLENBSE07O0VBTVIsR0FBQSxHQUFNO0VBQ04sS0FBQSx1Q0FBQTs7SUFDRSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQXBCO0lBQ0osSUFBRyxDQUFDLENBQUEsR0FBSSxDQUFMLENB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QUEsRUFERjs7RUFEbUIsQ0FBckI7RUFJQSxNQUFNLENBQUMscUJBQVAsR0FBK0IsUUFBQSxDQUFDLFdBQUQsQ0FBQTtBQUNqQyxRQUFBO0lBQUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLDZCQUFBLENBQUEsQ0FBZ0MsV0FBaEMsQ0FBQSxDQUFaO0lBQ0EsVUFBQSxHQUFhLElBQUksVUFBSixDQUFBO0lBQ2IsSUFBRyxXQUFIO2FBQ0UsVUFBVSxDQUFDLG9CQUFYLENBQUEsRUFERjs7RUFINkI7U0FNL0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaO0FBL0JLOztBQWlDUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInNvY2tldCA9IG51bGxcclxuXHJcbmxhc3RDbGlja2VkID0gbnVsbFxyXG5sYXN0VXNlciA9IG51bGxcclxuXHJcbm9waW5pb25PcmRlciA9IFsnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG5cclxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxyXG4gIHVuaXRzID0gW1xyXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxyXG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XHJcbiAgICB7IHN1ZmZpeDogXCJzXCIsIGZhY3RvcjogMSwgc2tpcDogZmFsc2UgfVxyXG4gIF1cclxuXHJcbiAgc3RyID0gXCJcIlxyXG4gIGZvciB1bml0IGluIHVuaXRzXHJcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXHJcbiAgICBpZiAodSA+IDApIG9yIG5vdCB1bml0LnNraXBcclxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcclxuICAgICAgICBzdHIgKz0gXCI6XCJcclxuICAgICAgICBpZiB1IDwgMTBcclxuICAgICAgICAgIHN0ciArPSBcIjBcIlxyXG4gICAgICBzdHIgKz0gU3RyaW5nKHUpXHJcbiAgcmV0dXJuIHN0clxyXG5cclxucHJldHR5RHVyYXRpb24gPSAoZSkgLT5cclxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBlLmVuZFxyXG4gIGlmIGVuZFRpbWUgPCAwXHJcbiAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcclxuXHJcbnJlbmRlckVudHJpZXMgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydExpc3QgPSBmYWxzZSwgc2hvd1BsYXlDb3VudHMgPSBmYWxzZSkgLT5cclxuICBodG1sID0gXCJcIlxyXG5cclxuICBpZiBpc01hcFxyXG4gICAgIyBjb25zb2xlLmxvZyBlbnRyaWVzXHJcbiAgICBtID0gZW50cmllc1xyXG4gICAgZW50cmllcyA9IFtdXHJcbiAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgIyBUaGlzIGlzIHRoZSBcImFsbFwiIGxpc3QsIHNvcnQgaXRcclxuICAgIHNvcnRMaXN0ID0gdHJ1ZVxyXG5cclxuICBpZiBzb3J0TGlzdFxyXG4gICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuXHJcbiAgZm9yIGUsIGVudHJ5SW5kZXggaW4gZW50cmllc1xyXG4gICAgdGl0bGUgPSBlLnRpdGxlXHJcbiAgICBpZiBub3QgdGl0bGU/XHJcbiAgICAgIHRpdGxlID0gZS5pZFxyXG4gICAgcGFyYW1zID0gXCJcIlxyXG4gICAgaWYgZS5zdGFydCA+PSAwXHJcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXHJcbiAgICAgIHBhcmFtcyArPSBcInN0YXJ0PSN7ZS5zdGFydH1cIlxyXG4gICAgaWYgZS5lbmQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJlbmQ9I3tlLmVuZH1cIlxyXG4gICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7ZS5pZH0je3BhcmFtc31cIlxyXG5cclxuICAgIGV4dHJhSW5mbyA9IFwiXCJcclxuICAgIGlmIGUubnNmd1xyXG4gICAgICBleHRyYUluZm8gKz0gXCIsIE5TRldcIlxyXG4gICAgaWYgKGUuc3RhcnQgIT0gLTEpIG9yICAoZS5lbmQgIT0gLTEpXHJcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3twcmV0dHlEdXJhdGlvbihlKX1cIlxyXG4gICAgaWYgZS5vcGluaW9ucz9cclxuICAgICAgZm9yIGZlZWxpbmcsIGNvdW50IG9mIGUub3BpbmlvbnNcclxuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7Y291bnR9ICN7ZmVlbGluZ30je2lmIGNvdW50ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuXHJcbiAgICBpZiBmaXJzdFRpdGxlP1xyXG4gICAgICBpZiAoZW50cnlJbmRleCA9PSAwKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmlyc3RUaXRsZVwiPiN7Zmlyc3RUaXRsZX08L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3Q29udGFpbmVyXCI+PGltZyBjbGFzcz1cInByZXZpZXdcIiBzcmM9XCIje2UudGh1bWJ9XCI+PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2UgaWYgKGVudHJ5SW5kZXggPT0gMSlcclxuICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7cmVzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGRpdj4gKiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3t0aXRsZX08L2E+IDxzcGFuIGNsYXNzPVwidXNlclwiPigje2UudXNlcn0je2V4dHJhSW5mb30pPC9zcGFuPjwvZGl2PlxyXG5cclxuICAgIFwiXCJcIlxyXG4gIHJldHVybiBodG1sXHJcblxyXG5cclxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShyZW5kZXJFbnRyaWVzKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXApKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKFwiRXJyb3JcIilcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG51cGRhdGVPdGhlciA9IC0+XHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgdHJ5XHJcbiAgICAgICAgICBvdGhlciA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgY29uc29sZS5sb2cgb3RoZXJcclxuICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICBpZiBvdGhlci5uYW1lcz8gYW5kIChvdGhlci5uYW1lcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSBpbiBvdGhlci5uYW1lc1xyXG4gICAgICAgICAgICAgIGlmIG5hbWVTdHJpbmcubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiwgXCJcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IG5hbWVcclxuICAgICAgICAgICAgcmVtYWluaW5nQ291bnQgPSBvdGhlci5wbGF5aW5nIC0gb3RoZXIubmFtZXMubGVuZ3RoXHJcbiAgICAgICAgICAgIGlmIHJlbWFpbmluZ0NvdW50ID4gMFxyXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIgKyAje3JlbWFpbmluZ0NvdW50fSBhbm9uXCJcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiOiAje25hbWVTdHJpbmd9XCJcclxuXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBsYXlpbmdcIikuaW5uZXJIVE1MID0gXCIoI3tvdGhlci5wbGF5aW5nfSBXYXRjaGluZyN7bmFtZVN0cmluZ30pXCJcclxuICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAjIG5vdGhpbmc/XHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL290aGVyXCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG5zaG93UGxheWluZyA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dQbGF5aW5nXHJcblxyXG5zaG93UXVldWUgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1F1ZXVlXHJcblxyXG5zaG93Qm90aCA9IC0+XHJcbiAgbGVmdFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxyXG4gIHJpZ2h0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj4je2xlZnRTaWRlfTwvZGl2PlxyXG4gICAgPGRpdiBpZD1cIm1haW5yXCI+I3tyaWdodFNpZGV9PC9kaXY+XHJcbiAgXCJcIlwiXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcclxuXHJcbnNob3dQbGF5bGlzdCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93U3RhdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBtID0gZW50cmllc1xyXG4gICAgICAgICAgZW50cmllcyA9IFtdXHJcbiAgICAgICAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcclxuXHJcbiAgICAgICAgICB1c2VyQ291bnRzID0ge31cclxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdID89IDBcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdICs9IDFcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gICAgICAgICAgICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxyXG4gICAgICAgICAgICBlbmRUaW1lID0gZS5lbmRcclxuICAgICAgICAgICAgaWYgZW5kVGltZSA8IDBcclxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBkdXJhdGlvblxyXG5cclxuICAgICAgICAgIHVzZXJMaXN0ID0gT2JqZWN0LmtleXModXNlckNvdW50cylcclxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgdGltZVVuaXRzID0gW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdtaW4nLCBmYWN0b3I6IDYwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICAgIGZvciB1bml0IGluIHRpbWVVbml0c1xyXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiAtPSBhbXQgKiB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcclxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiN7YW10fSAje3VuaXQubmFtZX0je2lmIGFtdCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+QmFzaWMgU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQodXNlcil9XCI+I3t1c2VyfTwvYT46ICN7dXNlckNvdW50c1t1c2VyXX08L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgIyBodG1sID0gXCI8cHJlPlwiICsgSlNPTi5zdHJpbmdpZnkodXNlckNvdW50cywgbnVsbCwgMikgKyBcIjwvcHJlPlwiXHJcblxyXG4gICAgICAgY2F0Y2hcclxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dTdGF0c1xyXG5cclxuc2hvd1VzZXIgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHVzZXJJbmZvID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgIGNhdGNoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Vc2VyOiAje2xhc3RVc2VyfTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGxpc3RIVE1MID0gXCJcIlxyXG5cclxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cclxuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xyXG5cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPkFkZGVkOjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4oTm8gaW5mbyBvbiB0aGlzIHVzZXIpPC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBoYXNJbmNvbWluZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmcpLmxlbmd0aCA+IDBcclxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcclxuXHJcbiAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9ucyBvciBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBpbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XHJcbiAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgb3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuXHJcbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyI3tmZWVsaW5nfVwiKS5pbm5lckhUTUwgPSByZW5kZXJFbnRyaWVzKG51bGwsIG51bGwsIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSlcclxuICAgICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJhZGRlZFwiKS5pbm5lckhUTUwgPSByZW5kZXJFbnRyaWVzKG51bGwsIG51bGwsIHVzZXJJbmZvLmFkZGVkLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSlcclxuICAgICAgLCAwXHJcblxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxyXG5cclxuY2xhc3MgQ2FzdFBsYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQHJlbW90ZVBsYXllciA9IG51bGxcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyID0gbnVsbFxyXG5cclxuICBpbml0aWFsaXplQ2FzdFBsYXllcjogLT5cclxuICAgIG9wdGlvbnMgPVxyXG4gICAgICBhdXRvSm9pblBvbGljeTogY2hyb21lLmNhc3QuQXV0b0pvaW5Qb2xpY3kuT1JJR0lOX1NDT1BFRFxyXG4gICAgICByZWNlaXZlckFwcGxpY2F0aW9uSWQ6IGNocm9tZS5jYXN0Lm1lZGlhLkRFRkFVTFRfTUVESUFfUkVDRUlWRVJfQVBQX0lEXHJcbiAgICBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLnNldE9wdGlvbnMob3B0aW9ucylcclxuICAgIEByZW1vdGVQbGF5ZXIgPSBuZXcgY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyKClcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyID0gbmV3IGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllckNvbnRyb2xsZXIoQHJlbW90ZVBsYXllcilcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyRXZlbnRUeXBlLklTX0NPTk5FQ1RFRF9DSEFOR0VELCBAc3dpdGNoUGxheWVyLmJpbmQodGhpcykpXHJcblxyXG4gIHN3aXRjaFBsYXllcjogLT5cclxuICAgIHNlc3Npb25TdGF0ZSA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0U2Vzc2lvblN0YXRlKClcclxuICAgIGlmIHNlc3Npb25TdGF0ZSAhPSBjYXN0LmZyYW1ld29yay5TZXNzaW9uU3RhdGUuU0VTU0lPTl9TVEFSVEVEXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiU2Vzc2lvbiBlbmRlZCFcIlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIlNlc3Npb24gc3RhcnRpbmchXCJcclxuICAgIHNvY2tldC5lbWl0ICdjYXN0cmVhZHknLCB7IGlkOiBzb2NrZXQuaWQgfVxyXG5cclxuYmVnaW5DYXN0ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcIkNBU1Q6XCIsIHBrdFxyXG5cclxuICBzZXNzaW9uU3RhdGUgPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25TdGF0ZSgpXHJcbiAgaWYgc2Vzc2lvblN0YXRlICE9IGNhc3QuZnJhbWV3b3JrLlNlc3Npb25TdGF0ZS5TRVNTSU9OX1NUQVJURURcclxuICAgIGNvbnNvbGUubG9nIFwiTm8gc2Vzc2lvbjsgc2tpcHBpbmcgYmVnaW5DYXN0XCJcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcIlN0YXJ0aW5nIGNhc3QhXCJcclxuICBjYXN0U2Vzc2lvbiA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0Q3VycmVudFNlc3Npb24oKVxyXG4gIG1lZGlhSW5mbyA9IG5ldyBjaHJvbWUuY2FzdC5tZWRpYS5NZWRpYUluZm8ocGt0LnVybCwgJ3ZpZGVvL21wNCcpXHJcbiAgcmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5tZWRpYS5Mb2FkUmVxdWVzdChtZWRpYUluZm8pXHJcbiAgaWYgcGt0LnN0YXJ0ID4gMFxyXG4gICAgcmVxdWVzdC5jdXJyZW50VGltZSA9IHBrdC5zdGFydFxyXG4gIGNhc3RTZXNzaW9uLmxvYWRNZWRpYShyZXF1ZXN0KVxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyaW5wdXRcIikuZm9jdXMoKVxyXG5cclxuc2hvd1dhdGNoTGluayA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG5wcm9jZXNzSGFzaCA9IC0+XHJcbiAgY3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXHJcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1VzZXIoKVxyXG4gICAgcmV0dXJuXHJcbiAgc3dpdGNoIGN1cnJlbnRIYXNoXHJcbiAgICB3aGVuICcjcXVldWUnXHJcbiAgICAgIHNob3dRdWV1ZSgpXHJcbiAgICB3aGVuICcjYWxsJ1xyXG4gICAgICBzaG93UGxheWxpc3QoKVxyXG4gICAgd2hlbiAnI2JvdGgnXHJcbiAgICAgIHNob3dCb3RoKClcclxuICAgIHdoZW4gJyNzdGF0cydcclxuICAgICAgc2hvd1N0YXRzKClcclxuICAgIGVsc2VcclxuICAgICAgc2hvd1BsYXlpbmcoKVxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LnNob3dQbGF5aW5nID0gc2hvd1BsYXlpbmdcclxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXHJcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxyXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXHJcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xyXG4gIHdpbmRvdy5zaG93VXNlciA9IHNob3dVc2VyXHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IHByb2Nlc3NIYXNoXHJcblxyXG4gIHByb2Nlc3NIYXNoKClcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5vbiAnY2FzdCcsIChwa3QpIC0+XHJcbiAgICBiZWdpbkNhc3QocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgc29ja2V0Lm9uICdyZWZyZXNoJywgKHBrdCkgLT5cclxuICAgIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG4gIHdpbmRvdy5fX29uR0Nhc3RBcGlBdmFpbGFibGUgPSAoaXNBdmFpbGFibGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIl9fb25HQ2FzdEFwaUF2YWlsYWJsZSBmaXJlZDogI3tpc0F2YWlsYWJsZX1cIlxyXG4gICAgY2FzdFBsYXllciA9IG5ldyBDYXN0UGxheWVyXHJcbiAgICBpZiBpc0F2YWlsYWJsZVxyXG4gICAgICBjYXN0UGxheWVyLmluaXRpYWxpemVDYXN0UGxheWVyKClcclxuXHJcbiAgY29uc29sZS5sb2cgXCJpbml0aWFsaXplZCFcIlxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIl19
