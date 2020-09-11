(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CastPlayer, beginCast, init, lastClicked, lastUser, opinionOrder, prettyDuration, processHash, renderEntries, secondsToTime, showBoth, showHistory, showList, showPlaylist, showQueue, showStats, showUser, showWatchForm, showWatchLink, socket, updateOther;

socket = null;

lastClicked = null;

lastUser = null;

opinionOrder = [
  'like',
  'meh',
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

renderEntries = function(domID, firstTitle, restTitle, entries, isMap, sortList = false, showPlayCounts = false) {
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
    if ((e.start !== -1) || (e.end !== -1)) {
      extraInfo += `, ${prettyDuration(e)}`;
    }
    if (showPlayCounts) {
      if (e.countPlay != null) {
        extraInfo += `, ${e.countPlay} play${e.countPlay === 1 ? "" : "s"}`;
      }
      if (e.countSkip != null) {
        extraInfo += `, ${e.countSkip} skip${e.countSkip === 1 ? "" : "s"}`;
      }
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
  return document.getElementById(domID).innerHTML = html;
};

showList = function(domID, firstTitle, restTitle, url, isMap = false) {
  var xhttp;
  // document.getElementById('main').innerHTML = ""
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var entries;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        entries = JSON.parse(xhttp.responseText);
        return renderEntries(domID, firstTitle, restTitle, entries, isMap);
      } catch (error) {
        return document.getElementById("main").innerHTML = "Error!";
      }
    }
  };
  xhttp.open("GET", url, true);
  return xhttp.send();
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

showHistory = function() {
  showList('main', "Now Playing:", "History:", "/info/history");
  updateOther();
  return lastClicked = showHistory;
};

showQueue = function() {
  showList('main', "Up Next:", "Queue:", "/info/queue");
  updateOther();
  return lastClicked = showQueue;
};

showBoth = function() {
  document.getElementById('main').innerHTML = `<div id="mainl"></div>
<div id="mainr"></div>`;
  showList('mainl', "Now Playing:", "History:", "/info/history");
  showList('mainr', "Up Next:", "Queue:", "/info/queue");
  updateOther();
  return lastClicked = showBoth;
};

showPlaylist = function() {
  showList('main', null, null, "/info/playlist", true);
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
          renderEntries(`user${feeling}`, null, null, userInfo.opinions[feeling], false, true, true);
        }
        if (userInfo.added.length > 0) {
          return renderEntries("useradded", null, null, userInfo.added, false, true, true);
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
      return showHistory();
  }
};

init = function() {
  window.showHistory = showHistory;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUVULFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBRVgsWUFBQSxHQUFlO0VBQUMsTUFBRDtFQUFTLEtBQVQ7RUFBZ0IsTUFBaEI7OztBQUVmLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVE7SUFDTjtNQUFFLE1BQUEsRUFBUSxHQUFWO01BQWUsTUFBQSxFQUFRLElBQXZCO01BQTZCLElBQUEsRUFBTTtJQUFuQyxDQURNO0lBRU47TUFBRSxNQUFBLEVBQVEsR0FBVjtNQUFlLE1BQUEsRUFBUSxFQUF2QjtNQUEyQixJQUFBLEVBQU07SUFBakMsQ0FGTTtJQUdOO01BQUUsTUFBQSxFQUFRLEdBQVY7TUFBZSxNQUFBLEVBQVEsQ0FBdkI7TUFBMEIsSUFBQSxFQUFNO0lBQWhDLENBSE07O0VBTVIsR0FBQSxHQUFNO0VBQ04sS0FBQSx1Q0FBQTs7SUFDRSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQXBCO0lBQ0osSUFBRyxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsSUFBVyxDQUFJ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RCxDQUFBO0FBQ2pDLFFBQUE7SUFBSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsNkJBQUEsQ0FBQSxDQUFnQyxXQUFoQyxDQUFBLENBQVo7SUFDQSxVQUFBLEdBQWEsSUFBSSxVQUFKLENBQUE7SUFDYixJQUFHLFdBQUg7YUFDRSxVQUFVLENBQUMsb0JBQVgsQ0FBQSxFQURGOztFQUg2QjtTQU0vQixPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUEvQks7O0FBaUNQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwic29ja2V0ID0gbnVsbFxyXG5cclxubGFzdENsaWNrZWQgPSBudWxsXHJcbmxhc3RVc2VyID0gbnVsbFxyXG5cclxub3Bpbmlvbk9yZGVyID0gWydsaWtlJywgJ21laCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG5cclxuc2Vjb25kc1RvVGltZSA9ICh0KSAtPlxyXG4gIHVuaXRzID0gW1xyXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxyXG4gICAgeyBzdWZmaXg6IFwibVwiLCBmYWN0b3I6IDYwLCBza2lwOiBmYWxzZSB9XHJcbiAgICB7IHN1ZmZpeDogXCJzXCIsIGZhY3RvcjogMSwgc2tpcDogZmFsc2UgfVxyXG4gIF1cclxuXHJcbiAgc3RyID0gXCJcIlxyXG4gIGZvciB1bml0IGluIHVuaXRzXHJcbiAgICB1ID0gTWF0aC5mbG9vcih0IC8gdW5pdC5mYWN0b3IpXHJcbiAgICBpZiAodSA+IDApIG9yIG5vdCB1bml0LnNraXBcclxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcclxuICAgICAgaWYgc3RyLmxlbmd0aCA+IDBcclxuICAgICAgICBzdHIgKz0gXCI6XCJcclxuICAgICAgICBpZiB1IDwgMTBcclxuICAgICAgICAgIHN0ciArPSBcIjBcIlxyXG4gICAgICBzdHIgKz0gU3RyaW5nKHUpXHJcbiAgcmV0dXJuIHN0clxyXG5cclxucHJldHR5RHVyYXRpb24gPSAoZSkgLT5cclxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgaWYgc3RhcnRUaW1lIDwgMFxyXG4gICAgc3RhcnRUaW1lID0gMFxyXG4gIGVuZFRpbWUgPSBlLmVuZFxyXG4gIGlmIGVuZFRpbWUgPCAwXHJcbiAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcclxuXHJcbnJlbmRlckVudHJpZXMgPSAoZG9tSUQsIGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRMaXN0ID0gZmFsc2UsIHNob3dQbGF5Q291bnRzID0gZmFsc2UpIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuXHJcbiAgaWYgaXNNYXBcclxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xyXG4gICAgbSA9IGVudHJpZXNcclxuICAgIGVudHJpZXMgPSBbXVxyXG4gICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICAgICMgVGhpcyBpcyB0aGUgXCJhbGxcIiBsaXN0LCBzb3J0IGl0XHJcbiAgICBzb3J0TGlzdCA9IHRydWVcclxuXHJcbiAgaWYgc29ydExpc3RcclxuICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXHJcbiAgICBpZiBzaG93UGxheUNvdW50c1xyXG4gICAgICBpZiBlLmNvdW50UGxheT9cclxuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7ZS5jb3VudFBsYXl9IHBsYXkje2lmIGUuY291bnRQbGF5ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuICAgICAgaWYgZS5jb3VudFNraXA/XHJcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2UuY291bnRTa2lwfSBza2lwI3tpZiBlLmNvdW50U2tpcCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je3RpdGxlfTwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS51c2VyfSN7ZXh0cmFJbmZvfSk8L3NwYW4+PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tSUQpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9IChkb21JRCwgZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UpIC0+XHJcbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICB0cnlcclxuICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgcmVuZGVyRW50cmllcyhkb21JRCwgZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcClcclxuICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJFcnJvciFcIlxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgIHRyeVxyXG4gICAgICAgICAgb3RoZXIgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXHJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgaWYgb3RoZXIubmFtZXM/IGFuZCAob3RoZXIubmFtZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcclxuICAgICAgICAgICAgICBpZiBuYW1lU3RyaW5nLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NvdW50ID0gb3RoZXIucGxheWluZyAtIG90aGVyLm5hbWVzLmxlbmd0aFxyXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIjogI3tuYW1lU3RyaW5nfVwiXHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiKCN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9KVwiXHJcbiAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgIyBub3RoaW5nP1xyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9vdGhlclwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuc2hvd0hpc3RvcnkgPSAtPlxyXG4gIHNob3dMaXN0KCdtYWluJywgXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93SGlzdG9yeVxyXG5cclxuc2hvd1F1ZXVlID0gLT5cclxuICBzaG93TGlzdCgnbWFpbicsIFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxyXG5cclxuc2hvd0JvdGggPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj48L2Rpdj5cclxuICAgIDxkaXYgaWQ9XCJtYWluclwiPjwvZGl2PlxyXG4gIFwiXCJcIlxyXG4gIHNob3dMaXN0KCdtYWlubCcsIFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgc2hvd0xpc3QoJ21haW5yJywgXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcclxuXHJcbnNob3dQbGF5bGlzdCA9IC0+XHJcbiAgc2hvd0xpc3QoJ21haW4nLCBudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93U3RhdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBtID0gZW50cmllc1xyXG4gICAgICAgICAgZW50cmllcyA9IFtdXHJcbiAgICAgICAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcclxuXHJcbiAgICAgICAgICB1c2VyQ291bnRzID0ge31cclxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdID89IDBcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdICs9IDFcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gICAgICAgICAgICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxyXG4gICAgICAgICAgICBlbmRUaW1lID0gZS5lbmRcclxuICAgICAgICAgICAgaWYgZW5kVGltZSA8IDBcclxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBkdXJhdGlvblxyXG5cclxuICAgICAgICAgIHVzZXJMaXN0ID0gT2JqZWN0LmtleXModXNlckNvdW50cylcclxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgdGltZVVuaXRzID0gW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdtaW4nLCBmYWN0b3I6IDYwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICAgIGZvciB1bml0IGluIHRpbWVVbml0c1xyXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiAtPSBhbXQgKiB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcclxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiN7YW10fSAje3VuaXQubmFtZX0je2lmIGFtdCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+QmFzaWMgU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQodXNlcil9XCI+I3t1c2VyfTwvYT46ICN7dXNlckNvdW50c1t1c2VyXX08L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgIyBodG1sID0gXCI8cHJlPlwiICsgSlNPTi5zdHJpbmdpZnkodXNlckNvdW50cywgbnVsbCwgMikgKyBcIjwvcHJlPlwiXHJcblxyXG4gICAgICAgY2F0Y2hcclxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dTdGF0c1xyXG5cclxuc2hvd1VzZXIgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHVzZXJJbmZvID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgIGNhdGNoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Vc2VyOiAje2xhc3RVc2VyfTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgICAgIGxpc3RIVE1MID0gXCJcIlxyXG5cclxuICAgICAgc29ydGVkRmVlbGluZ3MgPSBbXVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cclxuICAgICAgICAgIHNvcnRlZEZlZWxpbmdzLnB1c2ggZmVlbGluZ1xyXG5cclxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTo8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPkFkZGVkOjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxyXG4gICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcclxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4oTm8gaW5mbyBvbiB0aGlzIHVzZXIpPC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBoYXNJbmNvbWluZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmcpLmxlbmd0aCA+IDBcclxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcclxuXHJcbiAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9ucyBvciBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+T3BpbmlvbiBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaWYgaGFzSW5jb21pbmdPcGluaW9uc1xyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBUb3RhbHM6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBpbmNvbWluZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tpbmNvbWluZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNPdXRnb2luZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XHJcbiAgICAgICAgICAgICAgPHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxsaT5PdXRnb2luZyBieSB1c2VyOjwvbGk+PHVsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1cIj4je25hbWV9PC9hPjwvbGk+PHVsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgb3V0Z29pbmdbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7b3V0Z29pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIFwiXCJcIlxyXG5cclxuXHJcbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBmb3IgZmVlbGluZywgbGlzdCBvZiB1c2VySW5mby5vcGluaW9uc1xyXG4gICAgICAgICAgcmVuZGVyRW50cmllcyhcInVzZXIje2ZlZWxpbmd9XCIsIG51bGwsIG51bGwsIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSlcclxuICAgICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXHJcbiAgICAgICAgICByZW5kZXJFbnRyaWVzKFwidXNlcmFkZGVkXCIsIG51bGwsIG51bGwsIHVzZXJJbmZvLmFkZGVkLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSlcclxuICAgICAgLCAwXHJcblxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby91c2VyP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQobGFzdFVzZXIpfVwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93VXNlclxyXG5cclxuY2xhc3MgQ2FzdFBsYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQHJlbW90ZVBsYXllciA9IG51bGxcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyID0gbnVsbFxyXG5cclxuICBpbml0aWFsaXplQ2FzdFBsYXllcjogLT5cclxuICAgIG9wdGlvbnMgPVxyXG4gICAgICBhdXRvSm9pblBvbGljeTogY2hyb21lLmNhc3QuQXV0b0pvaW5Qb2xpY3kuT1JJR0lOX1NDT1BFRFxyXG4gICAgICByZWNlaXZlckFwcGxpY2F0aW9uSWQ6IGNocm9tZS5jYXN0Lm1lZGlhLkRFRkFVTFRfTUVESUFfUkVDRUlWRVJfQVBQX0lEXHJcbiAgICBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLnNldE9wdGlvbnMob3B0aW9ucylcclxuICAgIEByZW1vdGVQbGF5ZXIgPSBuZXcgY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyKClcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyID0gbmV3IGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllckNvbnRyb2xsZXIoQHJlbW90ZVBsYXllcilcclxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyRXZlbnRUeXBlLklTX0NPTk5FQ1RFRF9DSEFOR0VELCBAc3dpdGNoUGxheWVyLmJpbmQodGhpcykpXHJcblxyXG4gIHN3aXRjaFBsYXllcjogLT5cclxuICAgIHNlc3Npb25TdGF0ZSA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0U2Vzc2lvblN0YXRlKClcclxuICAgIGlmIHNlc3Npb25TdGF0ZSAhPSBjYXN0LmZyYW1ld29yay5TZXNzaW9uU3RhdGUuU0VTU0lPTl9TVEFSVEVEXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiU2Vzc2lvbiBlbmRlZCFcIlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIlNlc3Npb24gc3RhcnRpbmchXCJcclxuICAgIHNvY2tldC5lbWl0ICdjYXN0cmVhZHknLCB7IGlkOiBzb2NrZXQuaWQgfVxyXG5cclxuYmVnaW5DYXN0ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcIkNBU1Q6XCIsIHBrdFxyXG5cclxuICBzZXNzaW9uU3RhdGUgPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25TdGF0ZSgpXHJcbiAgaWYgc2Vzc2lvblN0YXRlICE9IGNhc3QuZnJhbWV3b3JrLlNlc3Npb25TdGF0ZS5TRVNTSU9OX1NUQVJURURcclxuICAgIGNvbnNvbGUubG9nIFwiTm8gc2Vzc2lvbjsgc2tpcHBpbmcgYmVnaW5DYXN0XCJcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcIlN0YXJ0aW5nIGNhc3QhXCJcclxuICBjYXN0U2Vzc2lvbiA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0Q3VycmVudFNlc3Npb24oKVxyXG4gIG1lZGlhSW5mbyA9IG5ldyBjaHJvbWUuY2FzdC5tZWRpYS5NZWRpYUluZm8ocGt0LnVybCwgJ3ZpZGVvL21wNCcpXHJcbiAgcmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5tZWRpYS5Mb2FkUmVxdWVzdChtZWRpYUluZm8pXHJcbiAgaWYgcGt0LnN0YXJ0ID4gMFxyXG4gICAgcmVxdWVzdC5jdXJyZW50VGltZSA9IHBrdC5zdGFydFxyXG4gIGNhc3RTZXNzaW9uLmxvYWRNZWRpYShyZXF1ZXN0KVxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyaW5wdXRcIikuZm9jdXMoKVxyXG5cclxuc2hvd1dhdGNoTGluayA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG5wcm9jZXNzSGFzaCA9IC0+XHJcbiAgY3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxyXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXHJcbiAgICBsYXN0VXNlciA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKVxyXG4gICAgc2hvd1VzZXIoKVxyXG4gICAgcmV0dXJuXHJcbiAgc3dpdGNoIGN1cnJlbnRIYXNoXHJcbiAgICB3aGVuICcjcXVldWUnXHJcbiAgICAgIHNob3dRdWV1ZSgpXHJcbiAgICB3aGVuICcjYWxsJ1xyXG4gICAgICBzaG93UGxheWxpc3QoKVxyXG4gICAgd2hlbiAnI2JvdGgnXHJcbiAgICAgIHNob3dCb3RoKClcclxuICAgIHdoZW4gJyNzdGF0cydcclxuICAgICAgc2hvd1N0YXRzKClcclxuICAgIGVsc2VcclxuICAgICAgc2hvd0hpc3RvcnkoKVxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LnNob3dIaXN0b3J5ID0gc2hvd0hpc3RvcnlcclxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXHJcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxyXG4gIHdpbmRvdy5zaG93Qm90aCA9IHNob3dCb3RoXHJcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xyXG4gIHdpbmRvdy5zaG93VXNlciA9IHNob3dVc2VyXHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IHByb2Nlc3NIYXNoXHJcblxyXG4gIHByb2Nlc3NIYXNoKClcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5vbiAnY2FzdCcsIChwa3QpIC0+XHJcbiAgICBiZWdpbkNhc3QocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgc29ja2V0Lm9uICdyZWZyZXNoJywgKHBrdCkgLT5cclxuICAgIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG4gIHdpbmRvdy5fX29uR0Nhc3RBcGlBdmFpbGFibGUgPSAoaXNBdmFpbGFibGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIl9fb25HQ2FzdEFwaUF2YWlsYWJsZSBmaXJlZDogI3tpc0F2YWlsYWJsZX1cIlxyXG4gICAgY2FzdFBsYXllciA9IG5ldyBDYXN0UGxheWVyXHJcbiAgICBpZiBpc0F2YWlsYWJsZVxyXG4gICAgICBjYXN0UGxheWVyLmluaXRpYWxpemVDYXN0UGxheWVyKClcclxuXHJcbiAgY29uc29sZS5sb2cgXCJpbml0aWFsaXplZCFcIlxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIl19
