(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CastPlayer, beginCast, init, lastClicked, lastUser, opinionOrder, prettyDuration, processHash, renderEntries, secondsToTime, showBoth, showList, showPlaying, showPlaylist, showQueue, showStats, showUser, showWatchForm, showWatchLink, socket, updateOther;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUVULFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBRVgsWUFBQSxHQUFlO0VBQUMsTUFBRDtFQUFTLEtBQVQ7RUFBZ0IsTUFBaEI7OztBQUVmLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVE7SUFDTjtNQUFFLE1BQUEsRUFBUSxHQUFWO01BQWUsTUFBQSxFQUFRLElBQXZCO01BQTZCLElBQUEsRUFBTTtJQUFuQyxDQURNO0lBRU47TUFBRSxNQUFBLEVBQVEsR0FBVjtNQUFlLE1BQUEsRUFBUSxFQUF2QjtNQUEyQixJQUFBLEVBQU07SUFBakMsQ0FGTTtJQUdOO01BQUUsTUFBQSxFQUFRLEdBQVY7TUFBZSxNQUFBLEVBQVEsQ0FBdkI7TUFBMEIsSUFBQSxFQUFNO0lBQWhDLENBSE07O0VBTVIsR0FBQSxHQUFNO0VBQ04sS0FBQSx1Q0FBQTs7SUFDRSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQXBCO0lBQ0osSUFBRyxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsSUFBVyxDQUFJ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QVUsTUFBVixFQUFrQixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQ2hCLFNBQUEsQ0FBVSxHQUFWO0VBRGdCLENBQWxCO0VBR0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFFBQUEsQ0FBQyxHQUFELENBQUE7SUFDaEIsSUFBRyxtQkFBSDthQUNFLFdBQUEsQ0FBQSxFQURGOztFQURnQixDQUFsQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixRQUFBLENBQUMsR0FBRCxDQUFBO0lBQ25CLElBQUcsbUJBQUg7YUFDRSxXQUFBLENBQUEsRUFERjs7RUFEbUIsQ0FBckI7RUFJQSxNQUFNLENBQUMscUJBQVAsR0FBK0IsUUFBQSxDQUFDLFdBQUQsQ0FBQTtBQUNqQyxRQUFBO0lBQUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLDZCQUFBLENBQUEsQ0FBZ0MsV0FBaEMsQ0FBQSxDQUFaO0lBQ0EsVUFBQSxHQUFhLElBQUksVUFBSixDQUFBO0lBQ2IsSUFBRyxXQUFIO2FBQ0UsVUFBVSxDQUFDLG9CQUFYLENBQUEsRUFERjs7RUFINkI7U0FNL0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaO0FBL0JLOztBQWlDUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInNvY2tldCA9IG51bGxcclxuXHJcbmxhc3RDbGlja2VkID0gbnVsbFxyXG5sYXN0VXNlciA9IG51bGxcclxuXHJcbm9waW5pb25PcmRlciA9IFsnbGlrZScsICdtZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuXHJcbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cclxuICB1bml0cyA9IFtcclxuICAgIHsgc3VmZml4OiBcImhcIiwgZmFjdG9yOiAzNjAwLCBza2lwOiB0cnVlIH1cclxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxyXG4gICAgeyBzdWZmaXg6IFwic1wiLCBmYWN0b3I6IDEsIHNraXA6IGZhbHNlIH1cclxuICBdXHJcblxyXG4gIHN0ciA9IFwiXCJcclxuICBmb3IgdW5pdCBpbiB1bml0c1xyXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxyXG4gICAgaWYgKHUgPiAwKSBvciBub3QgdW5pdC5za2lwXHJcbiAgICAgIHQgLT0gdSAqIHVuaXQuZmFjdG9yXHJcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXHJcbiAgICAgICAgc3RyICs9IFwiOlwiXHJcbiAgICAgICAgaWYgdSA8IDEwXHJcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcclxuICAgICAgc3RyICs9IFN0cmluZyh1KVxyXG4gIHJldHVybiBzdHJcclxuXHJcbnByZXR0eUR1cmF0aW9uID0gKGUpIC0+XHJcbiAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgIHN0YXJ0VGltZSA9IDBcclxuICBlbmRUaW1lID0gZS5lbmRcclxuICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgZW5kVGltZSA9IGUuZHVyYXRpb25cclxuICByZXR1cm4gXCIje3NlY29uZHNUb1RpbWUoc3RhcnRUaW1lKX0tI3tzZWNvbmRzVG9UaW1lKGVuZFRpbWUpfVwiXHJcblxyXG5yZW5kZXJFbnRyaWVzID0gKGZpcnN0VGl0bGUsIHJlc3RUaXRsZSwgZW50cmllcywgaXNNYXAsIHNvcnRMaXN0ID0gZmFsc2UsIHNob3dQbGF5Q291bnRzID0gZmFsc2UpIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuXHJcbiAgaWYgaXNNYXBcclxuICAgICMgY29uc29sZS5sb2cgZW50cmllc1xyXG4gICAgbSA9IGVudHJpZXNcclxuICAgIGVudHJpZXMgPSBbXVxyXG4gICAgZm9yIGssIHYgb2YgbVxyXG4gICAgICBlbnRyaWVzLnB1c2ggdlxyXG5cclxuICAgICMgVGhpcyBpcyB0aGUgXCJhbGxcIiBsaXN0LCBzb3J0IGl0XHJcbiAgICBzb3J0TGlzdCA9IHRydWVcclxuXHJcbiAgaWYgc29ydExpc3RcclxuICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje3ByZXR0eUR1cmF0aW9uKGUpfVwiXHJcbiAgICBpZiBzaG93UGxheUNvdW50c1xyXG4gICAgICBpZiBlLmNvdW50UGxheT9cclxuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7ZS5jb3VudFBsYXl9IHBsYXkje2lmIGUuY291bnRQbGF5ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuICAgICAgaWYgZS5jb3VudFNraXA/XHJcbiAgICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2UuY291bnRTa2lwfSBza2lwI3tpZiBlLmNvdW50U2tpcCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je3RpdGxlfTwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS51c2VyfSN7ZXh0cmFJbmZvfSk8L3NwYW4+PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgcmV0dXJuIGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIHVybCwgaXNNYXAgPSBmYWxzZSkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCkpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUoXCJFcnJvclwiKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbnVwZGF0ZU90aGVyID0gLT5cclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICB0cnlcclxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBvdGhlclxyXG4gICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lIGluIG90aGVyLm5hbWVzXHJcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiLCBcIlxyXG4gICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gbmFtZVxyXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcclxuICAgICAgICAgICAgaWYgcmVtYWluaW5nQ291bnQgPiAwXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiArICN7cmVtYWluaW5nQ291bnR9IGFub25cIlxyXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxyXG5cclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxheWluZ1wiKS5pbm5lckhUTUwgPSBcIigje290aGVyLnBsYXlpbmd9IFdhdGNoaW5nI3tuYW1lU3RyaW5nfSlcIlxyXG4gICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICMgbm90aGluZz9cclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vb3RoZXJcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dQbGF5aW5nID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlpbmdcclxuXHJcbnNob3dRdWV1ZSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UXVldWVcclxuXHJcbnNob3dCb3RoID0gLT5cclxuICBsZWZ0U2lkZSA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgcmlnaHRTaWRlID0gYXdhaXQgc2hvd0xpc3QoXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgaWQ9XCJtYWlubFwiPiN7bGVmdFNpZGV9PC9kaXY+XHJcbiAgICA8ZGl2IGlkPVwibWFpbnJcIj4je3JpZ2h0U2lkZX08L2Rpdj5cclxuICBcIlwiXCJcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93Qm90aFxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KG51bGwsIG51bGwsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSlcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWxpc3RcclxuXHJcbnNob3dTdGF0cyA9IC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICB0cnlcclxuICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIG0gPSBlbnRyaWVzXHJcbiAgICAgICAgICBlbnRyaWVzID0gW11cclxuICAgICAgICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uID0gMFxyXG5cclxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxyXG4gICAgICAgICAgZm9yIGUgaW4gZW50cmllc1xyXG4gICAgICAgICAgICB1c2VyQ291bnRzW2UudXNlcl0gPz0gMFxyXG4gICAgICAgICAgICB1c2VyQ291bnRzW2UudXNlcl0gKz0gMVxyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBlLnN0YXJ0XHJcbiAgICAgICAgICAgIGlmIHN0YXJ0VGltZSA8IDBcclxuICAgICAgICAgICAgICBzdGFydFRpbWUgPSAwXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSBlLmVuZFxyXG4gICAgICAgICAgICBpZiBlbmRUaW1lIDwgMFxyXG4gICAgICAgICAgICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXHJcbiAgICAgICAgICAgIGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxyXG4gICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGR1cmF0aW9uXHJcblxyXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxyXG4gICAgICAgICAgdXNlckxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA8IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdID4gdXNlckNvdW50c1tiXVxyXG4gICAgICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG5cclxuICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgPSBcIlwiXHJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2RheScsIGZhY3RvcjogMzYwMCAqIDI0IH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnaG91cicsIGZhY3RvcjogMzYwMCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWNvbmQnLCBmYWN0b3I6IDEgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXHJcbiAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb24gPj0gdW5pdC5mYWN0b3JcclxuICAgICAgICAgICAgICBhbXQgPSBNYXRoLmZsb29yKHRvdGFsRHVyYXRpb24gLyB1bml0LmZhY3RvcilcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgaWYgdG90YWxEdXJhdGlvblN0cmluZy5sZW5ndGggIT0gMFxyXG4gICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiwgXCJcclxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBTb25nczogI3tlbnRyaWVzLmxlbmd0aH08L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj5Ub3RhbCBEdXJhdGlvbjogI3t0b3RhbER1cmF0aW9uU3RyaW5nfTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdj4mbmJzcDs8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+U29uZ3MgYnkgVXNlcjo8L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgZm9yIHVzZXIgaW4gdXNlckxpc3RcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcclxuXHJcbiAgICAgICBjYXRjaFxyXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vcGxheWxpc3RcIiwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXHJcblxyXG5zaG93VXNlciA9IC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgdHJ5XHJcbiAgICAgICAgdXNlckluZm8gPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgY2F0Y2hcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJFcnJvciFcIlxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XHJcbiAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgbGlzdEhUTUwgPSBcIlwiXHJcblxyXG4gICAgICBzb3J0ZWRGZWVsaW5ncyA9IFtdXHJcbiAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgIGlmIHVzZXJJbmZvLm9waW5pb25zW2ZlZWxpbmddP1xyXG4gICAgICAgICAgc29ydGVkRmVlbGluZ3MucHVzaCBmZWVsaW5nXHJcblxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBzb3J0ZWRGZWVsaW5nc1xyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD1cInVzZXIje2ZlZWxpbmd9XCI+PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXHJcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+QWRkZWQ6PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwidXNlcmFkZGVkXCI+PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICBpZiBsaXN0SFRNTC5sZW5ndGggPT0gMFxyXG4gICAgICAgIGxpc3RIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPihObyBpbmZvIG9uIHRoaXMgdXNlcik8L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGhhc0luY29taW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZykubGVuZ3RoID4gMFxyXG4gICAgICAgIGhhc091dGdvaW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZykubGVuZ3RoID4gMFxyXG5cclxuICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zIG9yIGhhc091dGdvaW5nT3BpbmlvbnNcclxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5PcGluaW9uIFN0YXRzOjwvZGl2PlxyXG4gICAgICAgICAgICA8dWw+XHJcbiAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPkluY29taW5nIFRvdGFsczo8L2xpPjx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7dXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ119PC9saT5cclxuICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgYnkgdXNlcjo8L2xpPjx1bD5cclxuICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgIGZvciBuYW1lLCBpbmNvbWluZyBvZiB1c2VySW5mby5vdGhlck9waW5pb25zLmluY29taW5nXHJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIGluY29taW5nW2ZlZWxpbmddP1xyXG4gICAgICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje2luY29taW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGlmIGhhc091dGdvaW5nT3BpbmlvbnNcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmc6PC9saT5cclxuICAgICAgICAgICAgICA8dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgICAgICAgICBpZiB1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddfTwvbGk+XHJcbiAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nIGJ5IHVzZXI6PC9saT48dWw+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgICBmb3IgbmFtZSwgb3V0Z29pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5vdXRnb2luZ1xyXG4gICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XHJcbiAgICAgICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiBvdXRnb2luZ1tmZWVsaW5nXT9cclxuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3tvdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxyXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgXCJcIlwiXHJcblxyXG5cclxuICAgICAgaHRtbCArPSBsaXN0SFRNTFxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICAgICAgc2V0VGltZW91dCAtPlxyXG4gICAgICAgIGZvciBmZWVsaW5nLCBsaXN0IG9mIHVzZXJJbmZvLm9waW5pb25zXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXIje2ZlZWxpbmd9XCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10sIGZhbHNlLCB0cnVlLCB0cnVlKVxyXG4gICAgICAgIGlmIHVzZXJJbmZvLmFkZGVkLmxlbmd0aCA+IDBcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmFkZGVkXCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8uYWRkZWQsIGZhbHNlLCB0cnVlLCB0cnVlKVxyXG4gICAgICAsIDBcclxuXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXHJcblxyXG5jbGFzcyBDYXN0UGxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAcmVtb3RlUGxheWVyID0gbnVsbFxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIgPSBudWxsXHJcblxyXG4gIGluaXRpYWxpemVDYXN0UGxheWVyOiAtPlxyXG4gICAgb3B0aW9ucyA9XHJcbiAgICAgIGF1dG9Kb2luUG9saWN5OiBjaHJvbWUuY2FzdC5BdXRvSm9pblBvbGljeS5PUklHSU5fU0NPUEVEXHJcbiAgICAgIHJlY2VpdmVyQXBwbGljYXRpb25JZDogY2hyb21lLmNhc3QubWVkaWEuREVGQVVMVF9NRURJQV9SRUNFSVZFUl9BUFBfSURcclxuICAgIGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuc2V0T3B0aW9ucyhvcHRpb25zKVxyXG4gICAgQHJlbW90ZVBsYXllciA9IG5ldyBjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXIoKVxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIgPSBuZXcgY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyQ29udHJvbGxlcihAcmVtb3RlUGxheWVyKVxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcihjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXJFdmVudFR5cGUuSVNfQ09OTkVDVEVEX0NIQU5HRUQsIEBzd2l0Y2hQbGF5ZXIuYmluZCh0aGlzKSlcclxuXHJcbiAgc3dpdGNoUGxheWVyOiAtPlxyXG4gICAgc2Vzc2lvblN0YXRlID0gY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5nZXRTZXNzaW9uU3RhdGUoKVxyXG4gICAgaWYgc2Vzc2lvblN0YXRlICE9IGNhc3QuZnJhbWV3b3JrLlNlc3Npb25TdGF0ZS5TRVNTSU9OX1NUQVJURURcclxuICAgICAgY29uc29sZS5sb2cgXCJTZXNzaW9uIGVuZGVkIVwiXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwiU2Vzc2lvbiBzdGFydGluZyFcIlxyXG4gICAgc29ja2V0LmVtaXQgJ2Nhc3RyZWFkeScsIHsgaWQ6IHNvY2tldC5pZCB9XHJcblxyXG5iZWdpbkNhc3QgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiQ0FTVDpcIiwgcGt0XHJcblxyXG4gIHNlc3Npb25TdGF0ZSA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0U2Vzc2lvblN0YXRlKClcclxuICBpZiBzZXNzaW9uU3RhdGUgIT0gY2FzdC5mcmFtZXdvcmsuU2Vzc2lvblN0YXRlLlNFU1NJT05fU1RBUlRFRFxyXG4gICAgY29uc29sZS5sb2cgXCJObyBzZXNzaW9uOyBza2lwcGluZyBiZWdpbkNhc3RcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiU3RhcnRpbmcgY2FzdCFcIlxyXG4gIGNhc3RTZXNzaW9uID0gY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5nZXRDdXJyZW50U2Vzc2lvbigpXHJcbiAgbWVkaWFJbmZvID0gbmV3IGNocm9tZS5jYXN0Lm1lZGlhLk1lZGlhSW5mbyhwa3QudXJsLCAndmlkZW8vbXA0JylcclxuICByZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0Lm1lZGlhLkxvYWRSZXF1ZXN0KG1lZGlhSW5mbylcclxuICBpZiBwa3Quc3RhcnQgPiAwXHJcbiAgICByZXF1ZXN0LmN1cnJlbnRUaW1lID0gcGt0LnN0YXJ0XHJcbiAgY2FzdFNlc3Npb24ubG9hZE1lZGlhKHJlcXVlc3QpXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJpbnB1dFwiKS5mb2N1cygpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbnByb2Nlc3NIYXNoID0gLT5cclxuICBjdXJyZW50SGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXHJcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcclxuICAgIGxhc3RVc2VyID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXHJcbiAgICBzaG93VXNlcigpXHJcbiAgICByZXR1cm5cclxuICBzd2l0Y2ggY3VycmVudEhhc2hcclxuICAgIHdoZW4gJyNxdWV1ZSdcclxuICAgICAgc2hvd1F1ZXVlKClcclxuICAgIHdoZW4gJyNhbGwnXHJcbiAgICAgIHNob3dQbGF5bGlzdCgpXHJcbiAgICB3aGVuICcjYm90aCdcclxuICAgICAgc2hvd0JvdGgoKVxyXG4gICAgd2hlbiAnI3N0YXRzJ1xyXG4gICAgICBzaG93U3RhdHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBzaG93UGxheWluZygpXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cuc2hvd1BsYXlpbmcgPSBzaG93UGxheWluZ1xyXG4gIHdpbmRvdy5zaG93UXVldWUgPSBzaG93UXVldWVcclxuICB3aW5kb3cuc2hvd1BsYXlsaXN0ID0gc2hvd1BsYXlsaXN0XHJcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcclxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXHJcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcclxuXHJcbiAgcHJvY2Vzc0hhc2goKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0Lm9uICdjYXN0JywgKHBrdCkgLT5cclxuICAgIGJlZ2luQ2FzdChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgd2luZG93Ll9fb25HQ2FzdEFwaUF2YWlsYWJsZSA9IChpc0F2YWlsYWJsZSkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiX19vbkdDYXN0QXBpQXZhaWxhYmxlIGZpcmVkOiAje2lzQXZhaWxhYmxlfVwiXHJcbiAgICBjYXN0UGxheWVyID0gbmV3IENhc3RQbGF5ZXJcclxuICAgIGlmIGlzQXZhaWxhYmxlXHJcbiAgICAgIGNhc3RQbGF5ZXIuaW5pdGlhbGl6ZUNhc3RQbGF5ZXIoKVxyXG5cclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
