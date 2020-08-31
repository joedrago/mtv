(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CastPlayer, beginCast, init, lastClicked, lastUser, processHash, renderEntries, showBoth, showHistory, showList, showPlaylist, showQueue, showStats, showUser, showWatchForm, showWatchLink, socket, updateOther;

socket = null;

lastClicked = null;

lastUser = null;

renderEntries = function(domID, firstTitle, restTitle, entries, isMap, sortList = false) {
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
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
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
    if (e.countPlay != null) {
      extraInfo += `, ${e.countPlay} play${e.countPlay === 1 ? "" : "s"}`;
    }
    if (e.countSkip != null) {
      extraInfo += `, ${e.countSkip} skip${e.countSkip === 1 ? "" : "s"}`;
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
    var entries, feeling, i, j, len, len1, ref, sortedFeelings;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        entries = JSON.parse(xhttp.responseText);
        html = "";
        sortedFeelings = [];
        ref = ['like', 'meh', 'hate'];
        // always in this specific order
        for (i = 0, len = ref.length; i < len; i++) {
          feeling = ref[i];
          if (entries.opinions[feeling] != null) {
            sortedFeelings.push(feeling);
          }
        }
        for (j = 0, len1 = sortedFeelings.length; j < len1; j++) {
          feeling = sortedFeelings[j];
          html += `<div class="restTitle">${feeling.charAt(0).toUpperCase() + feeling.slice(1)}:</div>
<div id="user${feeling}"></div>`;
        }
        if (entries.added.length > 0) {
          html += `<div class="restTitle">Added:</div>
<div id="useradded"></div>`;
        }
        if (html.length === 0) {
          html += `<div class="restTitle">(No info on this user)</div>`;
        }
        html = `<div class="statsheader">User: ${lastUser}</div>` + html;
        document.getElementById("main").innerHTML = html;
        return setTimeout(function() {
          var list, ref1;
          ref1 = entries.opinions;
          for (feeling in ref1) {
            list = ref1[feeling];
            renderEntries(`user${feeling}`, null, null, entries.opinions[feeling], false, true);
          }
          if (entries.added.length > 0) {
            return renderEntries("useradded", null, null, entries.added, false, true);
          }
        }, 0);
      } catch (error) {
        return html = "Error!";
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUVULFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBRVgsYUFBQSxHQUFnQixRQUFBLENBQUMsS0FBRCxFQUFRLFVBQVIsRUFBb0IsU0FBcEIsRUFBK0IsT0FBL0IsRUFBd0MsS0FBeEMsRUFBK0MsV0FBVyxLQUExRCxDQUFBO0FBQ2hCLE1BQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtFQUFFLElBQUEsR0FBTztFQUVQLElBQUcsS0FBSDs7SUFFRSxDQUFBLEdBQUk7SUFDSixPQUFBLEdBQVU7SUFDVixLQUFBLE1BQUE7O01BQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO0lBREYsQ0FISjs7SUFPSSxRQUFBLEdBQVcsS0FSYjs7RUFVQSxJQUFHLFFBQUg7SUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO01BQ1gsSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQUMsQ0FBQyxLQUFmO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FB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dCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwic29ja2V0ID0gbnVsbFxyXG5cclxubGFzdENsaWNrZWQgPSBudWxsXHJcbmxhc3RVc2VyID0gbnVsbFxyXG5cclxucmVuZGVyRW50cmllcyA9IChkb21JRCwgZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCwgc29ydExpc3QgPSBmYWxzZSkgLT5cclxuICBodG1sID0gXCJcIlxyXG5cclxuICBpZiBpc01hcFxyXG4gICAgIyBjb25zb2xlLmxvZyBlbnRyaWVzXHJcbiAgICBtID0gZW50cmllc1xyXG4gICAgZW50cmllcyA9IFtdXHJcbiAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgIyBUaGlzIGlzIHRoZSBcImFsbFwiIGxpc3QsIHNvcnQgaXRcclxuICAgIHNvcnRMaXN0ID0gdHJ1ZVxyXG5cclxuICBpZiBzb3J0TGlzdFxyXG4gICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLnRpdGxlIDwgYi50aXRsZVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlID4gYi50aXRsZVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIGZvciBlLCBlbnRyeUluZGV4IGluIGVudHJpZXNcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuICAgIGV4dHJhSW5mbyA9IFwiXCJcclxuICAgIGlmIGUuY291bnRQbGF5P1xyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7ZS5jb3VudFBsYXl9IHBsYXkje2lmIGUuY291bnRQbGF5ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuICAgIGlmIGUuY291bnRTa2lwP1xyXG4gICAgICBleHRyYUluZm8gKz0gXCIsICN7ZS5jb3VudFNraXB9IHNraXAje2lmIGUuY291bnRTa2lwID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcclxuXHJcbiAgICBpZiBlLm9waW5pb25zP1xyXG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xyXG4gICAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3tjb3VudH0gI3tmZWVsaW5nfSN7aWYgY291bnQgPT0gMSB0aGVuIFwiXCIgZWxzZSBcInNcIn1cIlxyXG5cclxuICAgIGlmIGZpcnN0VGl0bGU/XHJcbiAgICAgIGlmIChlbnRyeUluZGV4ID09IDApXHJcbiAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXdDb250YWluZXJcIj48aW1nIGNsYXNzPVwicHJldmlld1wiIHNyYz1cIiN7ZS50aHVtYn1cIj48L2Rpdj5cclxuICAgICAgICBcIlwiXCJcclxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tyZXN0VGl0bGV9PC9kaXY+XHJcbiAgICAgICAgXCJcIlwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je3RpdGxlfTwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS51c2VyfSN7ZXh0cmFJbmZvfSk8L3NwYW4+PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tSUQpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9IChkb21JRCwgZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UpIC0+XHJcbiAgIyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiXCJcclxuICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICB0cnlcclxuICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgcmVuZGVyRW50cmllcyhkb21JRCwgZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcClcclxuICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gXCJFcnJvciFcIlxyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxudXBkYXRlT3RoZXIgPSAtPlxyXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgIHRyeVxyXG4gICAgICAgICAgb3RoZXIgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgIGNvbnNvbGUubG9nIG90aGVyXHJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgaWYgb3RoZXIubmFtZXM/IGFuZCAob3RoZXIubmFtZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgbmFtZVN0cmluZyA9IFwiXCJcclxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcclxuICAgICAgICAgICAgICBpZiBuYW1lU3RyaW5nLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgIG5hbWVTdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NvdW50ID0gb3RoZXIucGxheWluZyAtIG90aGVyLm5hbWVzLmxlbmd0aFxyXG4gICAgICAgICAgICBpZiByZW1haW5pbmdDb3VudCA+IDBcclxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXHJcbiAgICAgICAgICAgIG5hbWVTdHJpbmcgPSBcIjogI3tuYW1lU3RyaW5nfVwiXHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiKCN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9KVwiXHJcbiAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgIyBub3RoaW5nP1xyXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9vdGhlclwiLCB0cnVlKVxyXG4gIHhodHRwLnNlbmQoKVxyXG5cclxuc2hvd0hpc3RvcnkgPSAtPlxyXG4gIHNob3dMaXN0KCdtYWluJywgXCJOb3cgUGxheWluZzpcIiwgXCJIaXN0b3J5OlwiLCBcIi9pbmZvL2hpc3RvcnlcIilcclxuICB1cGRhdGVPdGhlcigpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93SGlzdG9yeVxyXG5cclxuc2hvd1F1ZXVlID0gLT5cclxuICBzaG93TGlzdCgnbWFpbicsIFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxyXG5cclxuc2hvd0JvdGggPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj48L2Rpdj5cclxuICAgIDxkaXYgaWQ9XCJtYWluclwiPjwvZGl2PlxyXG4gIFwiXCJcIlxyXG4gIHNob3dMaXN0KCdtYWlubCcsIFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXHJcbiAgc2hvd0xpc3QoJ21haW5yJywgXCJVcCBOZXh0OlwiLCBcIlF1ZXVlOlwiLCBcIi9pbmZvL3F1ZXVlXCIpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd0JvdGhcclxuXHJcbnNob3dQbGF5bGlzdCA9IC0+XHJcbiAgc2hvd0xpc3QoJ21haW4nLCBudWxsLCBudWxsLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgdXBkYXRlT3RoZXIoKVxyXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XHJcblxyXG5zaG93U3RhdHMgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICBtID0gZW50cmllc1xyXG4gICAgICAgICAgZW50cmllcyA9IFtdXHJcbiAgICAgICAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcclxuXHJcbiAgICAgICAgICB1c2VyQ291bnRzID0ge31cclxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdID89IDBcclxuICAgICAgICAgICAgdXNlckNvdW50c1tlLnVzZXJdICs9IDFcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gZS5zdGFydFxyXG4gICAgICAgICAgICBpZiBzdGFydFRpbWUgPCAwXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lID0gMFxyXG4gICAgICAgICAgICBlbmRUaW1lID0gZS5lbmRcclxuICAgICAgICAgICAgaWYgZW5kVGltZSA8IDBcclxuICAgICAgICAgICAgICBlbmRUaW1lID0gZS5kdXJhdGlvblxyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcclxuICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBkdXJhdGlvblxyXG5cclxuICAgICAgICAgIHVzZXJMaXN0ID0gT2JqZWN0LmtleXModXNlckNvdW50cylcclxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgICAgICAgIGlmIHVzZXJDb3VudHNbYV0gPCB1c2VyQ291bnRzW2JdXHJcbiAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cclxuICAgICAgICAgICAgICByZXR1cm4gLTFcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuXHJcbiAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgdGltZVVuaXRzID0gW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2hvdXInLCBmYWN0b3I6IDM2MDAgfVxyXG4gICAgICAgICAgICB7IG5hbWU6ICdtaW4nLCBmYWN0b3I6IDYwIH1cclxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICAgIGZvciB1bml0IGluIHRpbWVVbml0c1xyXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXHJcbiAgICAgICAgICAgICAgYW10ID0gTWF0aC5mbG9vcih0b3RhbER1cmF0aW9uIC8gdW5pdC5mYWN0b3IpXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiAtPSBhbXQgKiB1bml0LmZhY3RvclxyXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcclxuICAgICAgICAgICAgICAgIHRvdGFsRHVyYXRpb25TdHJpbmcgKz0gXCIsIFwiXHJcbiAgICAgICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyArPSBcIiN7YW10fSAje3VuaXQubmFtZX0je2lmIGFtdCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcblxyXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzaGVhZGVyXCI+QmFzaWMgU3RhdHM6PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXY+VG90YWwgRHVyYXRpb246ICN7dG90YWxEdXJhdGlvblN0cmluZ308L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlNvbmdzIGJ5IFVzZXI6PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgICAgPGRpdj4gKiA8YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQodXNlcil9XCI+I3t1c2VyfTwvYT46ICN7dXNlckNvdW50c1t1c2VyXX08L2Rpdj5cclxuICAgICAgICAgICAgXCJcIlwiXHJcblxyXG4gICAgICAgICAgIyBodG1sID0gXCI8cHJlPlwiICsgSlNPTi5zdHJpbmdpZnkodXNlckNvdW50cywgbnVsbCwgMikgKyBcIjwvcHJlPlwiXHJcblxyXG4gICAgICAgY2F0Y2hcclxuICAgICAgICAgaHRtbCA9IFwiRXJyb3IhXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dTdGF0c1xyXG5cclxuc2hvd1VzZXIgPSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgdHJ5XHJcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcblxyXG4gICAgICAgICAgaHRtbCA9IFwiXCJcclxuXHJcbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncyA9IFtdXHJcbiAgICAgICAgICBmb3IgZmVlbGluZyBpbiBbJ2xpa2UnLCAnbWVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcbiAgICAgICAgICAgIGlmIGVudHJpZXMub3BpbmlvbnNbZmVlbGluZ10/XHJcbiAgICAgICAgICAgICAgc29ydGVkRmVlbGluZ3MucHVzaCBmZWVsaW5nXHJcblxyXG4gICAgICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+I3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBpZD1cInVzZXIje2ZlZWxpbmd9XCI+PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGlmIGVudHJpZXMuYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj5BZGRlZDo8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IGlkPVwidXNlcmFkZGVkXCI+PC9kaXY+XHJcbiAgICAgICAgICAgIFwiXCJcIlxyXG5cclxuICAgICAgICAgIGlmIGh0bWwubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+KE5vIGluZm8gb24gdGhpcyB1c2VyKTwvZGl2PlxyXG4gICAgICAgICAgICBcIlwiXCJcclxuXHJcbiAgICAgICAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCIgKyBodG1sXHJcblxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgICAgICAgICBzZXRUaW1lb3V0IC0+XHJcbiAgICAgICAgICAgIGZvciBmZWVsaW5nLCBsaXN0IG9mIGVudHJpZXMub3BpbmlvbnNcclxuICAgICAgICAgICAgICByZW5kZXJFbnRyaWVzKFwidXNlciN7ZmVlbGluZ31cIiwgbnVsbCwgbnVsbCwgZW50cmllcy5vcGluaW9uc1tmZWVsaW5nXSwgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgICAgIGlmIGVudHJpZXMuYWRkZWQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgIHJlbmRlckVudHJpZXMoXCJ1c2VyYWRkZWRcIiwgbnVsbCwgbnVsbCwgZW50cmllcy5hZGRlZCwgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgICAsIDBcclxuICAgICAgIGNhdGNoXHJcbiAgICAgICAgIGh0bWwgPSBcIkVycm9yIVwiXHJcbiAgeGh0dHAub3BlbihcIkdFVFwiLCBcIi9pbmZvL3VzZXI/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChsYXN0VXNlcil9XCIsIHRydWUpXHJcbiAgeGh0dHAuc2VuZCgpXHJcblxyXG4gIHVwZGF0ZU90aGVyKClcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXHJcblxyXG5jbGFzcyBDYXN0UGxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAcmVtb3RlUGxheWVyID0gbnVsbFxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIgPSBudWxsXHJcblxyXG4gIGluaXRpYWxpemVDYXN0UGxheWVyOiAtPlxyXG4gICAgb3B0aW9ucyA9XHJcbiAgICAgIGF1dG9Kb2luUG9saWN5OiBjaHJvbWUuY2FzdC5BdXRvSm9pblBvbGljeS5PUklHSU5fU0NPUEVEXHJcbiAgICAgIHJlY2VpdmVyQXBwbGljYXRpb25JZDogY2hyb21lLmNhc3QubWVkaWEuREVGQVVMVF9NRURJQV9SRUNFSVZFUl9BUFBfSURcclxuICAgIGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuc2V0T3B0aW9ucyhvcHRpb25zKVxyXG4gICAgQHJlbW90ZVBsYXllciA9IG5ldyBjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXIoKVxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIgPSBuZXcgY2FzdC5mcmFtZXdvcmsuUmVtb3RlUGxheWVyQ29udHJvbGxlcihAcmVtb3RlUGxheWVyKVxyXG4gICAgQHJlbW90ZVBsYXllckNvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcihjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXJFdmVudFR5cGUuSVNfQ09OTkVDVEVEX0NIQU5HRUQsIEBzd2l0Y2hQbGF5ZXIuYmluZCh0aGlzKSlcclxuXHJcbiAgc3dpdGNoUGxheWVyOiAtPlxyXG4gICAgc2Vzc2lvblN0YXRlID0gY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5nZXRTZXNzaW9uU3RhdGUoKVxyXG4gICAgaWYgc2Vzc2lvblN0YXRlICE9IGNhc3QuZnJhbWV3b3JrLlNlc3Npb25TdGF0ZS5TRVNTSU9OX1NUQVJURURcclxuICAgICAgY29uc29sZS5sb2cgXCJTZXNzaW9uIGVuZGVkIVwiXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwiU2Vzc2lvbiBzdGFydGluZyFcIlxyXG4gICAgc29ja2V0LmVtaXQgJ2Nhc3RyZWFkeScsIHsgaWQ6IHNvY2tldC5pZCB9XHJcblxyXG5iZWdpbkNhc3QgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiQ0FTVDpcIiwgcGt0XHJcblxyXG4gIHNlc3Npb25TdGF0ZSA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0U2Vzc2lvblN0YXRlKClcclxuICBpZiBzZXNzaW9uU3RhdGUgIT0gY2FzdC5mcmFtZXdvcmsuU2Vzc2lvblN0YXRlLlNFU1NJT05fU1RBUlRFRFxyXG4gICAgY29uc29sZS5sb2cgXCJObyBzZXNzaW9uOyBza2lwcGluZyBiZWdpbkNhc3RcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiU3RhcnRpbmcgY2FzdCFcIlxyXG4gIGNhc3RTZXNzaW9uID0gY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5nZXRDdXJyZW50U2Vzc2lvbigpXHJcbiAgbWVkaWFJbmZvID0gbmV3IGNocm9tZS5jYXN0Lm1lZGlhLk1lZGlhSW5mbyhwa3QudXJsLCAndmlkZW8vbXA0JylcclxuICByZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0Lm1lZGlhLkxvYWRSZXF1ZXN0KG1lZGlhSW5mbylcclxuICBpZiBwa3Quc3RhcnQgPiAwXHJcbiAgICByZXF1ZXN0LmN1cnJlbnRUaW1lID0gcGt0LnN0YXJ0XHJcbiAgY2FzdFNlc3Npb24ubG9hZE1lZGlhKHJlcXVlc3QpXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJpbnB1dFwiKS5mb2N1cygpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbnByb2Nlc3NIYXNoID0gLT5cclxuICBjdXJyZW50SGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXHJcbiAgaWYgbWF0Y2hlcyA9IGN1cnJlbnRIYXNoLm1hdGNoKC9eI3VzZXJcXC8oLispLylcclxuICAgIGxhc3RVc2VyID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pXHJcbiAgICBzaG93VXNlcigpXHJcbiAgICByZXR1cm5cclxuICBzd2l0Y2ggY3VycmVudEhhc2hcclxuICAgIHdoZW4gJyNxdWV1ZSdcclxuICAgICAgc2hvd1F1ZXVlKClcclxuICAgIHdoZW4gJyNhbGwnXHJcbiAgICAgIHNob3dQbGF5bGlzdCgpXHJcbiAgICB3aGVuICcjYm90aCdcclxuICAgICAgc2hvd0JvdGgoKVxyXG4gICAgd2hlbiAnI3N0YXRzJ1xyXG4gICAgICBzaG93U3RhdHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBzaG93SGlzdG9yeSgpXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cuc2hvd0hpc3RvcnkgPSBzaG93SGlzdG9yeVxyXG4gIHdpbmRvdy5zaG93UXVldWUgPSBzaG93UXVldWVcclxuICB3aW5kb3cuc2hvd1BsYXlsaXN0ID0gc2hvd1BsYXlsaXN0XHJcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcclxuICB3aW5kb3cuc2hvd1N0YXRzID0gc2hvd1N0YXRzXHJcbiAgd2luZG93LnNob3dVc2VyID0gc2hvd1VzZXJcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cub25oYXNoY2hhbmdlID0gcHJvY2Vzc0hhc2hcclxuXHJcbiAgcHJvY2Vzc0hhc2goKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0Lm9uICdjYXN0JywgKHBrdCkgLT5cclxuICAgIGJlZ2luQ2FzdChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICBzb2NrZXQub24gJ3JlZnJlc2gnLCAocGt0KSAtPlxyXG4gICAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICAgIGxhc3RDbGlja2VkKClcclxuXHJcbiAgd2luZG93Ll9fb25HQ2FzdEFwaUF2YWlsYWJsZSA9IChpc0F2YWlsYWJsZSkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiX19vbkdDYXN0QXBpQXZhaWxhYmxlIGZpcmVkOiAje2lzQXZhaWxhYmxlfVwiXHJcbiAgICBjYXN0UGxheWVyID0gbmV3IENhc3RQbGF5ZXJcclxuICAgIGlmIGlzQXZhaWxhYmxlXHJcbiAgICAgIGNhc3RQbGF5ZXIuaW5pdGlhbGl6ZUNhc3RQbGF5ZXIoKVxyXG5cclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
