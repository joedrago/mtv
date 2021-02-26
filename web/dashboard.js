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
  var artist, count, e, entryIndex, extraInfo, feeling, html, i, k, len, m, params, ref, title, url, v;
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
    html += `<div> * <a target="_blank" href="${url}"><span class="entryartist">${artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="${url}"><span class="entrytitle">${title}</span></a> <span class="user">(${e.nickname}${extraInfo})</span></div>
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
  window.__onGCastApiAvailable = function(isAvailable) {};
  // console.log "__onGCastApiAvailable fired: #{isAvailable}"
  // castPlayer = new CastPlayer
  // if isAvailable
  //   castPlayer.initializeCastPlayer()
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUE7O0FBQUEsTUFBQSxHQUFTOztBQUVULFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVc7O0FBRVgsWUFBQSxHQUFlO0VBQUMsTUFBRDtFQUFTLEtBQVQ7RUFBZ0IsTUFBaEI7RUFBd0IsTUFBeEI7OztBQUVmLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVE7SUFDTjtNQUFFLE1BQUEsRUFBUSxHQUFWO01BQWUsTUFBQSxFQUFRLElBQXZCO01BQTZCLElBQUEsRUFBTTtJQUFuQyxDQURNO0lBRU47TUFBRSxNQUFBLEVBQVEsR0FBVjtNQUFlLE1BQUEsRUFBUSxFQUF2QjtNQUEyQixJQUFBLEVBQU07SUFBakMsQ0FGTTtJQUdOO01BQUUsTUFBQSxFQUFRLEdBQVY7TUFBZSxNQUFBLEVBQVEsQ0FBdkI7TUFBMEIsSUFBQSxFQUFNO0lBQWhDLENBSE07O0VBTVIsR0FBQSxHQUFNO0VBQ04sS0FBQSx1Q0FBQTs7SUFDRSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQXBCO0lBQ0osSUFBRyxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsSUFBVyxDQUFJLElBQUksQ0FBQyxJQUF2QjtNQUNFLENBQUEsSUFBSyxDQUFBLEdBQUksSUFBSSxDQUFDO01BQ2QsSUFBRyxHQUFHLENBQUMsTUFBSixHQUFhLENBQWhCO1FBQ0UsR0FBQSxJQUFPO1FBQ1AsSUFBRyxDQUFBLEdBQUksRUFBUDtVQUNFLEdBQUEsSUFBTyxJQURUO1NBRkY7O01BSUEsR0FBQSxJQUFPLE1BQUEsQ0FBTyxDQUFQLEVBTlQ7O0VBRkY7QUFTQSxTQUFPO0FBakJPOztBQW1CaEIsY0FBQSxHQUFpQixRQUFBLENBQUMsQ0FBRCxDQUFBO0FBQ2pCLE1BQUEsT0FBQSxFQUFBO0VBQUUsU0FBQSxHQUFZLENBQUMsQ0FBQztFQUNkLElBQUcsU0FBQSxHQUFZLENBQWY7SUFDRSxTQUFBLEdBQVksRUFEZDs7RUFFQSxPQUFBLEdBQVUsQ0FBQyxDQUFDO0VBQ1osSUFBRyxPQUFBLEdBQVUsQ0FBYjtJQUNFLE9BQUEsR0FBVSxDQUFDLENBQUMsU0FEZDs7QUFFQSxTQUFPLENBQUEsQ0FBQSxDQUFHLGFBQUEsQ0FBYyxTQUFkLENBQUgsQ0FBQSxDQUFBLENBQUEsQ0FBK0IsYUFBQSxDQUFjLE9BQWQsQ0FBL0IsQ0FBQTtBQVBROztBQVNqQixhQUFBLEdBQWdCLFFBQUEsQ0FBQyxVQUFELEVBQWEsU0FBYixFQUF3QixPQUF4QixFQUFpQyxLQUFqQyxFQUF3QyxXQUFXLEtBQW5ELEVBQTBELGlCQUFpQixLQUEzRSxDQUFBO0FBQ2hCLE1BQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7RUFBRSxJQUFBLEdBQU87RUFFUCxJQUFHLEtBQUg7O0lBRUUsQ0FBQSxHQUFJO0lBQ0osT0FBQSxHQUFVO0lBQ1YsS0FBQSxNQUFBOztNQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtJQURGLENBSEo7O0lBT0ksUUFBQSxHQUFXLEtBUmI7O0VBVUEsSUFBRyxRQUFIO0lBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNYLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBQSxHQUF5QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUE1QjtBQUNFLGVBQU8sQ0FBQyxFQURWOztNQUVBLElBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBQSxHQUF5QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVQsQ0FBQSxDQUE1QjtBQUNFLGVBQU8sRUFEVDs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBM0I7QUFDRSxlQUFPLEVBRFQ7O0FBRUEsYUFBTztJQVRJLENBQWIsRUFERjs7RUFZQSxLQUFBLG1FQUFBOztJQUNFLE1BQUEsR0FBUyxDQUFDLENBQUM7SUFDWCxJQUFPLGNBQVA7TUFDRSxNQUFBLEdBQVMsVUFEWDs7SUFFQSxLQUFBLEdBQVEsQ0FBQyxDQUFDO0lBQ1YsSUFBTyxhQUFQO01BQ0UsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQURaOztJQUVBLE1BQUEsR0FBUztJQUNULElBQUcsQ0FBQyxDQUFDLEtBQUYsSUFBVyxDQUFkO01BQ0UsTUFBQSxJQUFhLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQXBCLEdBQTJCLEdBQTNCLEdBQW9DO01BQzlDLE1BQUEsSUFBVSxDQUFBLE1BQUEsQ0FBQSxDQUFTLENBQUMsQ0FBQyxLQUFYLENBQUEsRUFGWjs7SUFHQSxJQUFHLENBQUMsQ0FBQyxHQUFGLElBQVMsQ0FBWjtNQUNFLE1BQUEsSUFBYSxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFwQixHQUEyQixHQUEzQixHQUFvQztNQUM5QyxNQUFBLElBQVUsQ0FBQSxJQUFBLENBQUEsQ0FBTyxDQUFDLENBQUMsR0FBVCxDQUFBLEVBRlo7O0lBR0EsR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixDQUFDLENBQUMsRUFBdEIsQ0FBQSxDQUFBLENBQTJCLE1BQTNCLENBQUE7SUFFTixTQUFBLEdBQVk7SUFDWixJQUFHLENBQUMsQ0FBQyxJQUFMO01BQ0UsU0FBQSxJQUFhLFNBRGY7O0lBRUEsSUFBRyxDQUFDLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBQyxDQUFiLENBQUEsSUFBb0IsQ0FBQyxDQUFDLENBQUMsR0FBRixLQUFTLENBQUMsQ0FBWCxDQUF2QjtNQUNFLFNBQUEsSUFBYSxDQUFBLEVBQUEsQ0FBQSxDQUFLLGNBQUEsQ0FBZSxDQUFmLENBQUwsQ0FBQSxFQURmOztJQUVBLElBQUcsa0JBQUg7QUFDRTtNQUFBLEtBQUEsY0FBQTs7UUFDRSxTQUFBLElBQWEsQ0FBQSxFQUFBLENBQUEsQ0FBSyxLQUFMLEVBQUEsQ0FBQSxDQUFjLE9BQWQsQ0FBQSxDQUFBLENBQTJCLEtBQUEsS0FBUyxDQUFaLEdBQW1CLEVBQW5CLEdBQTJCLEdBQW5ELENBQUE7TUFEZixDQURGOztJQUlBLElBQUcsa0JBQUg7TUFDRSxJQUFJLFVBQUEsS0FBYyxDQUFsQjtRQUNFLElBQUEsSUFBUSxDQUFBLHdCQUFBLENBQUEsQ0FDb0IsVUFEcEIsQ0FBQTt3REFBQSxDQUFBLENBRW9ELENBQUMsQ0FBQyxLQUZ0RCxDQUFBLFFBQUEsRUFEVjtPQUFBLE1BS0ssSUFBSSxVQUFBLEtBQWMsQ0FBbEI7UUFDSCxJQUFBLElBQVEsQ0FBQSx1QkFBQSxDQUFBLENBQ21CLFNBRG5CLENBQUEsTUFBQSxFQURMO09BTlA7O0lBVUEsSUFBQSxJQUFRLENBQUEsaUNBQUEsQ0FBQSxDQUM2QixHQUQ3QixDQUFBLDRCQUFBLENBQUEsQ0FDK0QsTUFEL0QsQ0FBQSx3RUFBQSxDQUFBLENBQ2dKLEdBRGhKLENBQUEsMkJBQUEsQ0FBQSxDQUNpTCxLQURqTCxDQUFBLGdDQUFBLENBQUEsQ0FDeU4sQ0FBQyxDQUFDLFFBRDNOLENBQUEsQ0FBQSxDQUNzTyxTQUR0TyxDQUFBO0FBQUE7RUFuQ1Y7QUF1Q0EsU0FBTztBQWhFTzs7QUFtRWhCLFFBQUEsR0FBVyxRQUFBLENBQUMsVUFBRCxFQUFhLFNBQWIsRUFBd0IsR0FBeEIsRUFBNkIsUUFBUSxLQUFyQyxDQUFBO0FBQ1QsU0FBTyxJQUFJLE9BQUosQ0FBWSxRQUFBLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FBQTtBQUNyQixRQUFBO0lBQUksS0FBQSxHQUFRLElBQUksY0FBSixDQUFBO0lBQ1IsS0FBSyxDQUFDLGtCQUFOLEdBQTJCLFFBQUEsQ0FBQSxDQUFBO0FBQy9CLFVBQUE7TUFBUSxJQUFHLENBQUMsSUFBQyxDQUFBLFVBQUQsS0FBZSxDQUFoQixDQUFBLElBQXVCLENBQUMsSUFBQyxDQUFBLE1BQUQsS0FBVyxHQUFaLENBQTFCO0FBRUc7O1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFlBQWpCO2lCQUNWLE9BQUEsQ0FBUSxhQUFBLENBQWMsVUFBZCxFQUEwQixTQUExQixFQUFxQyxPQUFyQyxFQUE4QyxLQUE5QyxDQUFSLEVBRkY7U0FHQSxhQUFBO2lCQUNFLE9BQUEsQ0FBUSxPQUFSLEVBREY7U0FMSDs7SUFEdUI7SUFRM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLEVBQWtCLEdBQWxCLEVBQXVCLElBQXZCO1dBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBQTtFQVhpQixDQUFaO0FBREU7O0FBY1gsV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO0FBQ2QsTUFBQTtFQUFFLEtBQUEsR0FBUSxJQUFJLGNBQUosQ0FBQTtFQUNSLEtBQUssQ0FBQyxrQkFBTixHQUEyQixRQUFBLENBQUEsQ0FBQTtBQUM3QixRQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBO0lBQU0sSUFBRyxDQUFDLElBQUMsQ0FBQSxVQUFELEtBQWUsQ0FBaEIsQ0FBQSxJQUF1QixDQUFDLElBQUMsQ0FBQSxNQUFELEtBQVcsR0FBWixDQUExQjtBQUVHOztRQUNDLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxZQUFqQjtRQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtRQUNBLFVBQUEsR0FBYTtRQUNiLElBQUcscUJBQUEsSUFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosR0FBcUIsQ0FBdEIsQ0FBcEI7VUFDRSxVQUFBLEdBQWE7QUFDYjtVQUFBLEtBQUEscUNBQUE7O1lBQ0UsSUFBRyxVQUFVLENBQUMsTUFBWCxHQUFvQixDQUF2QjtjQUNFLFVBQUEsSUFBYyxLQURoQjs7WUFFQSxVQUFBLElBQWM7VUFIaEI7VUFJQSxjQUFBLEdBQWlCLEtBQUssQ0FBQyxPQUFOLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUM7VUFDN0MsSUFBRyxjQUFBLEdBQWlCLENBQXBCO1lBQ0UsVUFBQSxJQUFjLENBQUEsR0FBQSxDQUFBLENBQU0sY0FBTixDQUFBLEtBQUEsRUFEaEI7O1VBRUEsVUFBQSxHQUFhLENBQUEsRUFBQSxDQUFBLENBQUssVUFBTCxDQUFBLEVBVGY7O2VBV0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxTQUFuQyxHQUErQyxDQUFBLENBQUEsQ0FBQSxDQUFJLEtBQUssQ0FBQyxPQUFWLENBQUEsU0FBQSxDQUFBLENBQTZCLFVBQTdCLENBQUEsQ0FBQSxFQWZoRDtPQWdCQSxhQUFBO0FBQUE7T0FsQkg7O0VBRHVCLEVBRDdCOztFQXNCRSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsRUFBa0IsYUFBbEIsRUFBaUMsSUFBakM7U0FDQSxLQUFLLENBQUMsSUFBTixDQUFBO0FBeEJZOztBQTBCZCxXQUFBLEdBQWMsTUFBQSxRQUFBLENBQUEsQ0FBQTtFQUNaLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEMsQ0FBQSxNQUFNLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDLGVBQXJDLENBQU47RUFDNUMsV0FBQSxDQUFBO1NBQ0EsV0FBQSxHQUFjO0FBSEY7O0FBS2QsU0FBQSxHQUFZLE1BQUEsUUFBQSxDQUFBLENBQUE7RUFDVixRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDLENBQUEsTUFBTSxRQUFBLENBQVMsVUFBVCxFQUFxQixRQUFyQixFQUErQixhQUEvQixDQUFOO0VBQzVDLFdBQUEsQ0FBQTtTQUNBLFdBQUEsR0FBYztBQUhKOztBQUtaLFFBQUEsR0FBVyxNQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ1gsTUFBQSxRQUFBLEVBQUE7RUFBRSxRQUFBLEdBQVcsQ0FBQSxNQUFNLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDLGVBQXJDLENBQU47RUFDWCxTQUFBLEdBQVksQ0FBQSxNQUFNLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFFBQXJCLEVBQStCLGFBQS9CLENBQU47RUFDWixRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDLENBQUEsZ0JBQUEsQ0FBQSxDQUN4QixRQUR3QixDQUFBO2dCQUFBLENBQUEsQ0FFeEIsU0FGd0IsQ0FBQSxNQUFBO0VBSTVDLFdBQUEsQ0FBQTtTQUNBLFdBQUEsR0FBYztBQVJMOztBQVVYLFlBQUEsR0FBZSxNQUFBLFFBQUEsQ0FBQSxDQUFBO0VBQ2IsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxTQUFoQyxHQUE0QyxDQUFBLE1BQU0sUUFBQSxDQUFTLElBQVQsRUFBZSxJQUFmLEVBQXFCLGdCQUFyQixFQUF1QyxJQUF2QyxDQUFOO0VBQzVDLFdBQUEsQ0FBQTtTQUNBLFdBQUEsR0FBYztBQUhEOztBQUtmLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLE1BQUEsSUFBQSxFQUFBO0VBQUUsSUFBQSxHQUFPO0VBQ1AsS0FBQSxHQUFRLElBQUksY0FBSixDQUFBO0VBQ1IsS0FBSyxDQUFDLGtCQUFOLEdBQTJCLFFBQUEsQ0FBQSxDQUFBO0FBQzdCLFFBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLGFBQUEsRUFBQSxtQkFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFFBQUEsRUFBQTtJQUFJLElBQUcsQ0FBQyxJQUFDLENBQUEsVUFBRCxLQUFlLENBQWhCLENBQUEsSUFBdUIsQ0FBQyxJQUFDLENBQUEsTUFBRCxLQUFXLEdBQVosQ0FBMUI7QUFFRzs7UUFDRyxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsWUFBakI7UUFDVixDQUFBLEdBQUk7UUFDSixPQUFBLEdBQVU7UUFDVixLQUFBLE1BQUE7O1VBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiO1FBREY7UUFHQSxhQUFBLEdBQWdCO1FBRWhCLFVBQUEsR0FBYSxDQUFBO1FBQ2IsS0FBQSx5Q0FBQTs7O1lBQ0Usb0JBQTBCOztVQUMxQixVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQUgsQ0FBVixJQUEwQjtVQUMxQixTQUFBLEdBQVksQ0FBQyxDQUFDO1VBQ2QsSUFBRyxTQUFBLEdBQVksQ0FBZjtZQUNFLFNBQUEsR0FBWSxFQURkOztVQUVBLE9BQUEsR0FBVSxDQUFDLENBQUM7VUFDWixJQUFHLE9BQUEsR0FBVSxDQUFiO1lBQ0UsT0FBQSxHQUFVLENBQUMsQ0FBQyxTQURkOztVQUVBLFFBQUEsR0FBVyxPQUFBLEdBQVU7VUFDckIsYUFBQSxJQUFpQjtRQVZuQjtRQVlBLFFBQUEsR0FBVyxNQUFNLENBQUMsSUFBUCxDQUFZLFVBQVo7UUFDWCxRQUFRLENBQUMsSUFBVCxDQUFjLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO1VBQ1osSUFBRyxVQUFVLENBQUMsQ0FBRCxDQUFWLEdBQWdCLFVBQVUsQ0FBQyxDQUFELENBQTdCO0FBQ0UsbUJBQU8sRUFEVDs7VUFFQSxJQUFHLFVBQVUsQ0FBQyxDQUFELENBQVYsR0FBZ0IsVUFBVSxDQUFDLENBQUQsQ0FBN0I7QUFDRSxtQkFBTyxDQUFDLEVBRFY7O0FBRUEsaUJBQU87UUFMSyxDQUFkO1FBT0EsbUJBQUEsR0FBc0I7UUFDdEIsU0FBQSxHQUFZO1VBQ1Y7WUFBRSxJQUFBLEVBQU0sS0FBUjtZQUFlLE1BQUEsRUFBUSxJQUFBLEdBQU87VUFBOUIsQ0FEVTtVQUVWO1lBQUUsSUFBQSxFQUFNLE1BQVI7WUFBZ0IsTUFBQSxFQUFRO1VBQXhCLENBRlU7VUFHVjtZQUFFLElBQUEsRUFBTSxLQUFSO1lBQWUsTUFBQSxFQUFRO1VBQXZCLENBSFU7VUFJVjtZQUFFLElBQUEsRUFBTSxRQUFSO1lBQWtCLE1BQUEsRUFBUTtVQUExQixDQUpVOztRQU1aLEtBQUEsNkNBQUE7O1VBQ0UsSUFBRyxhQUFBLElBQWlCLElBQUksQ0FBQyxNQUF6QjtZQUNFLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQWhDO1lBQ04sYUFBQSxJQUFpQixHQUFBLEdBQU0sSUFBSSxDQUFDO1lBQzVCLElBQUcsbUJBQW1CLENBQUMsTUFBcEIsS0FBOEIsQ0FBakM7Y0FDRSxtQkFBQSxJQUF1QixLQUR6Qjs7WUFFQSxtQkFBQSxJQUF1QixDQUFBLENBQUEsQ0FBRyxHQUFILEVBQUEsQ0FBQSxDQUFVLElBQUksQ0FBQyxJQUFmLENBQUEsQ0FBQSxDQUF5QixHQUFBLEtBQU8sQ0FBVixHQUFpQixFQUFqQixHQUF5QixHQUEvQyxDQUFBLEVBTHpCOztRQURGO1FBUUEsSUFBQSxJQUFRLENBQUE7a0JBQUEsQ0FBQSxDQUVjLE9BQU8sQ0FBQyxNQUZ0QixDQUFBO3FCQUFBLENBQUEsQ0FHaUIsbUJBSGpCLENBQUE7Ozs2Q0FBQTtRQVFSLEtBQUEsNENBQUE7O1VBQ0UsSUFBQSxJQUFRLENBQUEsdUJBQUEsQ0FBQSxDQUNtQixrQkFBQSxDQUFtQixJQUFuQixDQURuQixDQUFBLEVBQUEsQ0FBQSxDQUNnRCxJQURoRCxDQUFBLE1BQUEsQ0FBQSxDQUM2RCxVQUFVLENBQUMsSUFBRCxDQUR2RSxDQUFBLE1BQUE7UUFEVixDQXJESDtPQTREQSxhQUFBOztRQUNFLElBQUEsR0FBTyxTQURUO09BOURIOztXQWdFQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO0VBakVuQjtFQWtFM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLEVBQWtCLGdCQUFsQixFQUFvQyxJQUFwQztFQUNBLEtBQUssQ0FBQyxJQUFOLENBQUE7RUFFQSxXQUFBLENBQUE7U0FDQSxXQUFBLEdBQWM7QUF6RUo7O0FBMkVaLFFBQUEsR0FBVyxRQUFBLENBQUEsQ0FBQTtBQUNYLE1BQUEsSUFBQSxFQUFBO0VBQUUsSUFBQSxHQUFPO0VBQ1AsS0FBQSxHQUFRLElBQUksY0FBSixDQUFBO0VBQ1IsS0FBSyxDQUFDLGtCQUFOLEdBQTJCLFFBQUEsQ0FBQSxDQUFBO0FBQzdCLFFBQUEsT0FBQSxFQUFBLG1CQUFBLEVBQUEsbUJBQUEsRUFBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUE7SUFBSSxJQUFHLENBQUMsSUFBQyxDQUFBLFVBQUQsS0FBZSxDQUFoQixDQUFBLElBQXVCLENBQUMsSUFBQyxDQUFBLE1BQUQsS0FBVyxHQUFaLENBQTFCO0FBRUU7O1FBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFlBQWpCLEVBRGI7T0FFQSxhQUFBO1FBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxTQUFoQyxHQUE0QztBQUM1QyxlQUZGOztNQUlBLElBQUEsR0FBTyxDQUFBLCtCQUFBLENBQUEsQ0FDNEIsUUFENUIsQ0FBQSxNQUFBO01BSVAsUUFBQSxHQUFXO01BRVgsY0FBQSxHQUFpQjtNQUNqQixLQUFBLDhDQUFBOztRQUNFLElBQUcsa0NBQUg7VUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixPQUFwQixFQURGOztNQURGO01BSUEsS0FBQSxrREFBQTs7UUFDRSxRQUFBLElBQVksQ0FBQSx1QkFBQSxDQUFBLENBQ2UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxDQUFmLENBQWlCLENBQUMsV0FBbEIsQ0FBQSxDQUFBLEdBQWtDLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxDQURqRCxDQUFBO2FBQUEsQ0FBQSxDQUVLLE9BRkwsQ0FBQSxRQUFBO01BRGQ7TUFNQSxJQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBZixHQUF3QixDQUEzQjtRQUNFLFFBQUEsSUFBWSxDQUFBOzBCQUFBLEVBRGQ7O01BTUEsSUFBRyxRQUFRLENBQUMsTUFBVCxLQUFtQixDQUF0QjtRQUNFLFFBQUEsSUFBWSxDQUFBLG1EQUFBLEVBRGQ7T0FBQSxNQUFBO1FBS0UsbUJBQUEsR0FBc0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQWpDLENBQTBDLENBQUMsTUFBM0MsR0FBb0Q7UUFDMUUsbUJBQUEsR0FBc0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQWpDLENBQTBDLENBQUMsTUFBM0MsR0FBb0Q7UUFFMUUsSUFBRyxtQkFBQSxJQUF1QixtQkFBMUI7VUFDRSxJQUFBLElBQVEsQ0FBQTtJQUFBO1VBS1IsSUFBRyxtQkFBSDtZQUNFLElBQUEsSUFBUSxDQUFBLDZCQUFBO1lBR1IsS0FBQSxnREFBQTs7Y0FDRSxJQUFHLDhDQUFIO2dCQUNFLElBQUEsSUFBUSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BREEsQ0FBQSxFQUFBLENBQUEsQ0FDWSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFELENBRHpDLENBQUEsS0FBQSxFQURWOztZQURGO1lBS0EsSUFBQSxJQUFRLENBQUEsS0FBQTtZQUlSLElBQUEsSUFBUSxDQUFBLDhCQUFBO0FBR1I7WUFBQSxLQUFBLFdBQUE7O2NBQ0UsSUFBQSxJQUFRLENBQUEsbUJBQUEsQ0FBQSxDQUNlLGtCQUFBLENBQW1CLElBQW5CLENBRGYsQ0FBQSxFQUFBLENBQUEsQ0FDNEMsSUFENUMsQ0FBQSxhQUFBO2NBR1IsS0FBQSxnREFBQTs7Z0JBQ0UsSUFBRyx5QkFBSDtrQkFDRSxJQUFBLElBQVEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQURBLENBQUEsRUFBQSxDQUFBLENBQ1ksUUFBUSxDQUFDLE9BQUQsQ0FEcEIsQ0FBQSxLQUFBLEVBRFY7O2NBREY7Y0FLQSxJQUFBLElBQVEsQ0FBQSxLQUFBO1lBVFY7WUFZQSxJQUFBLElBQVEsQ0FBQSxLQUFBLEVBNUJWOztVQWdDQSxJQUFHLG1CQUFIO1lBQ0UsSUFBQSxJQUFRLENBQUE7SUFBQTtZQUlSLEtBQUEsZ0RBQUE7O2NBQ0UsSUFBRyw4Q0FBSDtnQkFDRSxJQUFBLElBQVEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQURBLENBQUEsRUFBQSxDQUFBLENBQ1ksUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBRCxDQUR6QyxDQUFBLEtBQUEsRUFEVjs7WUFERjtZQUtBLElBQUEsSUFBUSxDQUFBLEtBQUE7WUFJUixJQUFBLElBQVEsQ0FBQSw4QkFBQTtBQUdSO1lBQUEsS0FBQSxZQUFBOztjQUNFLElBQUEsSUFBUSxDQUFBLG1CQUFBLENBQUEsQ0FDZSxrQkFBQSxDQUFtQixJQUFuQixDQURmLENBQUEsRUFBQSxDQUFBLENBQzRDLElBRDVDLENBQUEsYUFBQTtjQUdSLEtBQUEsZ0RBQUE7O2dCQUNFLElBQUcseUJBQUg7a0JBQ0UsSUFBQSxJQUFRLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FEQSxDQUFBLEVBQUEsQ0FBQSxDQUNZLFFBQVEsQ0FBQyxPQUFELENBRHBCLENBQUEsS0FBQSxFQURWOztjQURGO2NBS0EsSUFBQSxJQUFRLENBQUEsS0FBQTtZQVRWO1lBWUEsSUFBQSxJQUFRLENBQUEsS0FBQSxFQTdCVjs7VUFpQ0EsSUFBQSxJQUFRLENBQUEsS0FBQSxFQXZFVjtTQVJGOztNQW9GQSxJQUFBLElBQVE7TUFDUixRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO2FBRTVDLFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQTtBQUNqQixZQUFBLElBQUEsRUFBQTtBQUFRO1FBQUEsS0FBQSxlQUFBOztVQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLENBQUEsSUFBQSxDQUFBLENBQU8sT0FBUCxDQUFBLENBQXhCLENBQXlDLENBQUMsU0FBMUMsR0FBc0QsYUFBQSxDQUFjLElBQWQsRUFBb0IsSUFBcEIsRUFBMEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFELENBQTNDLEVBQXNELEtBQXRELEVBQTZELElBQTdELEVBQW1FLElBQW5FO1FBRHhEO1FBRUEsSUFBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQWYsR0FBd0IsQ0FBM0I7aUJBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxTQUFyQyxHQUFpRCxhQUFBLENBQWMsSUFBZCxFQUFvQixJQUFwQixFQUEwQixRQUFRLENBQUMsS0FBbkMsRUFBMEMsS0FBMUMsRUFBaUQsSUFBakQsRUFBdUQsSUFBdkQsRUFEbkQ7O01BSFMsQ0FBWCxFQUtFLENBTEYsRUF0SEY7O0VBRHlCO0VBOEgzQixLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsRUFBa0IsQ0FBQSxnQkFBQSxDQUFBLENBQW1CLGtCQUFBLENBQW1CLFFBQW5CLENBQW5CLENBQUEsQ0FBbEIsRUFBcUUsSUFBckU7RUFDQSxLQUFLLENBQUMsSUFBTixDQUFBO0VBRUEsV0FBQSxDQUFBO1NBQ0EsV0FBQSxHQUFjO0FBcklMOztBQXVJTCxhQUFOLE1BQUEsV0FBQTtFQUNFLFdBQWEsQ0FBQSxDQUFBO0lBQ1gsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFDaEIsSUFBQyxDQUFBLHNCQUFELEdBQTBCO0VBRmY7O0VBSWIsb0JBQXNCLENBQUEsQ0FBQTtBQUN4QixRQUFBO0lBQUksT0FBQSxHQUNFO01BQUEsY0FBQSxFQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUEzQztNQUNBLHFCQUFBLEVBQXVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBRHpDO0lBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBM0IsQ0FBQSxDQUF3QyxDQUFDLFVBQXpDLENBQW9ELE9BQXBEO0lBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQW5CLENBQUE7SUFDaEIsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBbkIsQ0FBMEMsSUFBQyxDQUFBLFlBQTNDO1dBQzFCLElBQUMsQ0FBQSxzQkFBc0IsQ0FBQyxnQkFBeEIsQ0FBeUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBOUUsRUFBb0csSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQXBHO0VBUG9COztFQVN0QixZQUFjLENBQUEsQ0FBQTtBQUNoQixRQUFBO0lBQUksWUFBQSxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFdBQTNCLENBQUEsQ0FBd0MsQ0FBQyxlQUF6QyxDQUFBO0lBQ2YsSUFBRyxZQUFBLEtBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGVBQS9DO01BQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWjtBQUNBLGFBRkY7O0lBSUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtQkFBWjtXQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksV0FBWixFQUF5QjtNQUFFLEVBQUEsRUFBSSxNQUFNLENBQUM7SUFBYixDQUF6QjtFQVBZOztBQWRoQjs7QUF1QkEsU0FBQSxHQUFZLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFDWixNQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBO0VBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQXFCLEdBQXJCO0VBRUEsWUFBQSxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFdBQTNCLENBQUEsQ0FBd0MsQ0FBQyxlQUF6QyxDQUFBO0VBQ2YsSUFBRyxZQUFBLEtBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGVBQS9DO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQ0FBWjtBQUNBLFdBRkY7O0VBSUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWjtFQUNBLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUEzQixDQUFBLENBQXdDLENBQUMsaUJBQXpDLENBQUE7RUFDZCxTQUFBLEdBQVksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUF0QixDQUFnQyxHQUFHLENBQUMsR0FBcEMsRUFBeUMsV0FBekM7RUFDWixPQUFBLEdBQVUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUF0QixDQUFrQyxTQUFsQztFQUNWLElBQUcsR0FBRyxDQUFDLEtBQUosR0FBWSxDQUFmO0lBQ0UsT0FBTyxDQUFDLFdBQVIsR0FBc0IsR0FBRyxDQUFDLE1BRDVCOztTQUVBLFdBQVcsQ0FBQyxTQUFaLENBQXNCLE9BQXRCO0FBZFU7O0FBZ0JaLGFBQUEsR0FBZ0IsUUFBQSxDQUFBLENBQUE7RUFDZCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLEtBQUssQ0FBQyxPQUF4QyxHQUFrRDtFQUNsRCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLEtBQUssQ0FBQyxPQUF4QyxHQUFrRDtTQUNsRCxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUF4QixDQUFvQyxDQUFDLEtBQXJDLENBQUE7QUFIYzs7QUFLaEIsYUFBQSxHQUFnQixRQUFBLENBQUEsQ0FBQTtFQUNkLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQWlDLENBQUMsS0FBSyxDQUFDLE9BQXhDLEdBQWtEO1NBQ2xELFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQWlDLENBQUMsS0FBSyxDQUFDLE9BQXhDLEdBQWtEO0FBRnBDOztBQUloQixXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7QUFDZCxNQUFBLFdBQUEsRUFBQTtFQUFFLFdBQUEsR0FBYyxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQzlCLElBQUcsT0FBQSxHQUFVLFdBQVcsQ0FBQyxLQUFaLENBQWtCLGNBQWxCLENBQWI7SUFDRSxRQUFBLEdBQVcsa0JBQUEsQ0FBbUIsT0FBTyxDQUFDLENBQUQsQ0FBMUI7SUFDWCxRQUFBLENBQUE7QUFDQSxXQUhGOztBQUlBLFVBQU8sV0FBUDtBQUFBLFNBQ08sUUFEUDthQUVJLFNBQUEsQ0FBQTtBQUZKLFNBR08sTUFIUDthQUlJLFlBQUEsQ0FBQTtBQUpKLFNBS08sT0FMUDthQU1JLFFBQUEsQ0FBQTtBQU5KLFNBT08sUUFQUDthQVFJLFNBQUEsQ0FBQTtBQVJKO2FBVUksV0FBQSxDQUFBO0FBVko7QUFOWTs7QUFrQmQsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0VBQ0wsTUFBTSxDQUFDLFdBQVAsR0FBcUI7RUFDckIsTUFBTSxDQUFDLFNBQVAsR0FBbUI7RUFDbkIsTUFBTSxDQUFDLFlBQVAsR0FBc0I7RUFDdEIsTUFBTSxDQUFDLFFBQVAsR0FBa0I7RUFDbEIsTUFBTSxDQUFDLFNBQVAsR0FBbUI7RUFDbkIsTUFBTSxDQUFDLFFBQVAsR0FBa0I7RUFDbEIsTUFBTSxDQUFDLGFBQVAsR0FBdUI7RUFDdkIsTUFBTSxDQUFDLGFBQVAsR0FBdUI7RUFDdkIsTUFBTSxDQUFDLFlBQVAsR0FBc0I7RUFFdEIsV0FBQSxDQUFBO0VBRUEsTUFBQSxHQUFTLEVBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQ2hCLFNBQUEsQ0FBVSxHQUFWO0VBRGdCLENBQWxCO0VBR0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFFBQUEsQ0FBQyxHQUFELENBQUE7SUFDaEIsSUFBRyxtQkFBSDthQUNFLFdBQUEsQ0FBQSxFQURGOztFQURnQixDQUFsQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixRQUFBLENBQUMsR0FBRCxDQUFBO0lBQ25CLElBQUcsbUJBQUg7YUFDRSxXQUFBLENBQUEsRUFERjs7RUFEbUIsQ0FBckI7RUFJQSxNQUFNLENBQUMscUJBQVAsR0FBK0IsUUFBQSxDQUFDLFdBQUQsQ0FBQSxFQUFBLEVBeEJqQzs7Ozs7U0E4QkUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaO0FBL0JLOztBQWlDUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInNvY2tldCA9IG51bGxcblxubGFzdENsaWNrZWQgPSBudWxsXG5sYXN0VXNlciA9IG51bGxcblxub3Bpbmlvbk9yZGVyID0gWydsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXG5cbnNlY29uZHNUb1RpbWUgPSAodCkgLT5cbiAgdW5pdHMgPSBbXG4gICAgeyBzdWZmaXg6IFwiaFwiLCBmYWN0b3I6IDM2MDAsIHNraXA6IHRydWUgfVxuICAgIHsgc3VmZml4OiBcIm1cIiwgZmFjdG9yOiA2MCwgc2tpcDogZmFsc2UgfVxuICAgIHsgc3VmZml4OiBcInNcIiwgZmFjdG9yOiAxLCBza2lwOiBmYWxzZSB9XG4gIF1cblxuICBzdHIgPSBcIlwiXG4gIGZvciB1bml0IGluIHVuaXRzXG4gICAgdSA9IE1hdGguZmxvb3IodCAvIHVuaXQuZmFjdG9yKVxuICAgIGlmICh1ID4gMCkgb3Igbm90IHVuaXQuc2tpcFxuICAgICAgdCAtPSB1ICogdW5pdC5mYWN0b3JcbiAgICAgIGlmIHN0ci5sZW5ndGggPiAwXG4gICAgICAgIHN0ciArPSBcIjpcIlxuICAgICAgICBpZiB1IDwgMTBcbiAgICAgICAgICBzdHIgKz0gXCIwXCJcbiAgICAgIHN0ciArPSBTdHJpbmcodSlcbiAgcmV0dXJuIHN0clxuXG5wcmV0dHlEdXJhdGlvbiA9IChlKSAtPlxuICBzdGFydFRpbWUgPSBlLnN0YXJ0XG4gIGlmIHN0YXJ0VGltZSA8IDBcbiAgICBzdGFydFRpbWUgPSAwXG4gIGVuZFRpbWUgPSBlLmVuZFxuICBpZiBlbmRUaW1lIDwgMFxuICAgIGVuZFRpbWUgPSBlLmR1cmF0aW9uXG4gIHJldHVybiBcIiN7c2Vjb25kc1RvVGltZShzdGFydFRpbWUpfS0je3NlY29uZHNUb1RpbWUoZW5kVGltZSl9XCJcblxucmVuZGVyRW50cmllcyA9IChmaXJzdFRpdGxlLCByZXN0VGl0bGUsIGVudHJpZXMsIGlzTWFwLCBzb3J0TGlzdCA9IGZhbHNlLCBzaG93UGxheUNvdW50cyA9IGZhbHNlKSAtPlxuICBodG1sID0gXCJcIlxuXG4gIGlmIGlzTWFwXG4gICAgIyBjb25zb2xlLmxvZyBlbnRyaWVzXG4gICAgbSA9IGVudHJpZXNcbiAgICBlbnRyaWVzID0gW11cbiAgICBmb3IgaywgdiBvZiBtXG4gICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gICAgIyBUaGlzIGlzIHRoZSBcImFsbFwiIGxpc3QsIHNvcnQgaXRcbiAgICBzb3J0TGlzdCA9IHRydWVcblxuICBpZiBzb3J0TGlzdFxuICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcblxuICBmb3IgZSwgZW50cnlJbmRleCBpbiBlbnRyaWVzXG4gICAgYXJ0aXN0ID0gZS5hcnRpc3RcbiAgICBpZiBub3QgYXJ0aXN0P1xuICAgICAgYXJ0aXN0ID0gXCJVbmtub3duXCJcbiAgICB0aXRsZSA9IGUudGl0bGVcbiAgICBpZiBub3QgdGl0bGU/XG4gICAgICB0aXRsZSA9IGUuaWRcbiAgICBwYXJhbXMgPSBcIlwiXG4gICAgaWYgZS5zdGFydCA+PSAwXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxuICAgICAgcGFyYW1zICs9IFwic3RhcnQ9I3tlLnN0YXJ0fVwiXG4gICAgaWYgZS5lbmQgPj0gMFxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcbiAgICAgIHBhcmFtcyArPSBcImVuZD0je2UuZW5kfVwiXG4gICAgdXJsID0gXCJodHRwczovL3lvdXR1LmJlLyN7ZS5pZH0je3BhcmFtc31cIlxuXG4gICAgZXh0cmFJbmZvID0gXCJcIlxuICAgIGlmIGUubnNmd1xuICAgICAgZXh0cmFJbmZvICs9IFwiLCBOU0ZXXCJcbiAgICBpZiAoZS5zdGFydCAhPSAtMSkgb3IgIChlLmVuZCAhPSAtMSlcbiAgICAgIGV4dHJhSW5mbyArPSBcIiwgI3twcmV0dHlEdXJhdGlvbihlKX1cIlxuICAgIGlmIGUub3BpbmlvbnM/XG4gICAgICBmb3IgZmVlbGluZywgY291bnQgb2YgZS5vcGluaW9uc1xuICAgICAgICBleHRyYUluZm8gKz0gXCIsICN7Y291bnR9ICN7ZmVlbGluZ30je2lmIGNvdW50ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgIGlmIGZpcnN0VGl0bGU/XG4gICAgICBpZiAoZW50cnlJbmRleCA9PSAwKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaXJzdFRpdGxlXCI+I3tmaXJzdFRpdGxlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3Q29udGFpbmVyXCI+PGltZyBjbGFzcz1cInByZXZpZXdcIiBzcmM9XCIje2UudGh1bWJ9XCI+PC9kaXY+XG4gICAgICAgIFwiXCJcIlxuICAgICAgZWxzZSBpZiAoZW50cnlJbmRleCA9PSAxKVxuICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0VGl0bGVcIj4je3Jlc3RUaXRsZX08L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxkaXY+ICogPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnlhcnRpc3RcIj4je2FydGlzdH08L3NwYW4+PC9hPjxzcGFuIGNsYXNzPVwiZW50cnltaWRkbGVcIj4gLSA8L3NwYW4+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPjxzcGFuIGNsYXNzPVwiZW50cnl0aXRsZVwiPiN7dGl0bGV9PC9zcGFuPjwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS5uaWNrbmFtZX0je2V4dHJhSW5mb30pPC9zcGFuPjwvZGl2PlxuXG4gICAgXCJcIlwiXG4gIHJldHVybiBodG1sXG5cblxuc2hvd0xpc3QgPSAoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCB1cmwsIGlzTWFwID0gZmFsc2UpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKHJlbmRlckVudHJpZXMoZmlyc3RUaXRsZSwgcmVzdFRpdGxlLCBlbnRyaWVzLCBpc01hcCkpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShcIkVycm9yXCIpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbnVwZGF0ZU90aGVyID0gLT5cbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgIHRyeVxuICAgICAgICAgIG90aGVyID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgY29uc29sZS5sb2cgb3RoZXJcbiAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgIGlmIG90aGVyLm5hbWVzPyBhbmQgKG90aGVyLm5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUgaW4gb3RoZXIubmFtZXNcbiAgICAgICAgICAgICAgaWYgbmFtZVN0cmluZy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBcIiwgXCJcbiAgICAgICAgICAgICAgbmFtZVN0cmluZyArPSBuYW1lXG4gICAgICAgICAgICByZW1haW5pbmdDb3VudCA9IG90aGVyLnBsYXlpbmcgLSBvdGhlci5uYW1lcy5sZW5ndGhcbiAgICAgICAgICAgIGlmIHJlbWFpbmluZ0NvdW50ID4gMFxuICAgICAgICAgICAgICBuYW1lU3RyaW5nICs9IFwiICsgI3tyZW1haW5pbmdDb3VudH0gYW5vblwiXG4gICAgICAgICAgICBuYW1lU3RyaW5nID0gXCI6ICN7bmFtZVN0cmluZ31cIlxuXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGF5aW5nXCIpLmlubmVySFRNTCA9IFwiKCN7b3RoZXIucGxheWluZ30gV2F0Y2hpbmcje25hbWVTdHJpbmd9KVwiXG4gICAgICAgICBjYXRjaFxuICAgICAgICAgICAjIG5vdGhpbmc/XG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9vdGhlclwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuc2hvd1BsYXlpbmcgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiTm93IFBsYXlpbmc6XCIsIFwiSGlzdG9yeTpcIiwgXCIvaW5mby9oaXN0b3J5XCIpXG4gIHVwZGF0ZU90aGVyKClcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWluZ1xuXG5zaG93UXVldWUgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IGF3YWl0IHNob3dMaXN0KFwiVXAgTmV4dDpcIiwgXCJRdWV1ZTpcIiwgXCIvaW5mby9xdWV1ZVwiKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1F1ZXVlXG5cbnNob3dCb3RoID0gLT5cbiAgbGVmdFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIk5vdyBQbGF5aW5nOlwiLCBcIkhpc3Rvcnk6XCIsIFwiL2luZm8vaGlzdG9yeVwiKVxuICByaWdodFNpZGUgPSBhd2FpdCBzaG93TGlzdChcIlVwIE5leHQ6XCIsIFwiUXVldWU6XCIsIFwiL2luZm8vcXVldWVcIilcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8ZGl2IGlkPVwibWFpbmxcIj4je2xlZnRTaWRlfTwvZGl2PlxuICAgIDxkaXYgaWQ9XCJtYWluclwiPiN7cmlnaHRTaWRlfTwvZGl2PlxuICBcIlwiXCJcbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dCb3RoXG5cbnNob3dQbGF5bGlzdCA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykuaW5uZXJIVE1MID0gYXdhaXQgc2hvd0xpc3QobnVsbCwgbnVsbCwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1BsYXlsaXN0XG5cbnNob3dTdGF0cyA9IC0+XG4gIGh0bWwgPSBcIlwiXG4gIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICB0cnlcbiAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgbSA9IGVudHJpZXNcbiAgICAgICAgICBlbnRyaWVzID0gW11cbiAgICAgICAgICBmb3IgaywgdiBvZiBtXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2ggdlxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvbiA9IDBcblxuICAgICAgICAgIHVzZXJDb3VudHMgPSB7fVxuICAgICAgICAgIGZvciBlIGluIGVudHJpZXNcbiAgICAgICAgICAgIHVzZXJDb3VudHNbZS5uaWNrbmFtZV0gPz0gMFxuICAgICAgICAgICAgdXNlckNvdW50c1tlLm5pY2tuYW1lXSArPSAxXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBlLnN0YXJ0XG4gICAgICAgICAgICBpZiBzdGFydFRpbWUgPCAwXG4gICAgICAgICAgICAgIHN0YXJ0VGltZSA9IDBcbiAgICAgICAgICAgIGVuZFRpbWUgPSBlLmVuZFxuICAgICAgICAgICAgaWYgZW5kVGltZSA8IDBcbiAgICAgICAgICAgICAgZW5kVGltZSA9IGUuZHVyYXRpb25cbiAgICAgICAgICAgIGR1cmF0aW9uID0gZW5kVGltZSAtIHN0YXJ0VGltZVxuICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBkdXJhdGlvblxuXG4gICAgICAgICAgdXNlckxpc3QgPSBPYmplY3Qua2V5cyh1c2VyQ291bnRzKVxuICAgICAgICAgIHVzZXJMaXN0LnNvcnQgKGEsIGIpIC0+XG4gICAgICAgICAgICBpZiB1c2VyQ291bnRzW2FdIDwgdXNlckNvdW50c1tiXVxuICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgaWYgdXNlckNvdW50c1thXSA+IHVzZXJDb3VudHNbYl1cbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICByZXR1cm4gMFxuXG4gICAgICAgICAgdG90YWxEdXJhdGlvblN0cmluZyA9IFwiXCJcbiAgICAgICAgICB0aW1lVW5pdHMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXknLCBmYWN0b3I6IDM2MDAgKiAyNCB9XG4gICAgICAgICAgICB7IG5hbWU6ICdob3VyJywgZmFjdG9yOiAzNjAwIH1cbiAgICAgICAgICAgIHsgbmFtZTogJ21pbicsIGZhY3RvcjogNjAgfVxuICAgICAgICAgICAgeyBuYW1lOiAnc2Vjb25kJywgZmFjdG9yOiAxIH1cbiAgICAgICAgICBdXG4gICAgICAgICAgZm9yIHVuaXQgaW4gdGltZVVuaXRzXG4gICAgICAgICAgICBpZiB0b3RhbER1cmF0aW9uID49IHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGFtdCA9IE1hdGguZmxvb3IodG90YWxEdXJhdGlvbiAvIHVuaXQuZmFjdG9yKVxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uIC09IGFtdCAqIHVuaXQuZmFjdG9yXG4gICAgICAgICAgICAgIGlmIHRvdGFsRHVyYXRpb25TdHJpbmcubGVuZ3RoICE9IDBcbiAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiLCBcIlxuICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uU3RyaW5nICs9IFwiI3thbXR9ICN7dW5pdC5uYW1lfSN7aWYgYW10ID09IDEgdGhlbiBcIlwiIGVsc2UgXCJzXCJ9XCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5CYXNpYyBTdGF0czo8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+VG90YWwgU29uZ3M6ICN7ZW50cmllcy5sZW5ndGh9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlRvdGFsIER1cmF0aW9uOiAje3RvdGFsRHVyYXRpb25TdHJpbmd9PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXY+Jm5ic3A7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNoZWFkZXJcIj5Tb25ncyBieSBVc2VyOjwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGZvciB1c2VyIGluIHVzZXJMaXN0XG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2PiAqIDxhIGhyZWY9XCIjdXNlci8je2VuY29kZVVSSUNvbXBvbmVudCh1c2VyKX1cIj4je3VzZXJ9PC9hPjogI3t1c2VyQ291bnRzW3VzZXJdfTwvZGl2PlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAjIGh0bWwgPSBcIjxwcmU+XCIgKyBKU09OLnN0cmluZ2lmeSh1c2VyQ291bnRzLCBudWxsLCAyKSArIFwiPC9wcmU+XCJcblxuICAgICAgIGNhdGNoXG4gICAgICAgICBodG1sID0gXCJFcnJvciFcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG4gIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxuICB4aHR0cC5zZW5kKClcblxuICB1cGRhdGVPdGhlcigpXG4gIGxhc3RDbGlja2VkID0gc2hvd1N0YXRzXG5cbnNob3dVc2VyID0gLT5cbiAgaHRtbCA9IFwiXCJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICB0cnlcbiAgICAgICAgdXNlckluZm8gPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgIGNhdGNoXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBcIkVycm9yIVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c2hlYWRlclwiPlVzZXI6ICN7bGFzdFVzZXJ9PC9kaXY+XG4gICAgICBcIlwiXCJcblxuICAgICAgbGlzdEhUTUwgPSBcIlwiXG5cbiAgICAgIHNvcnRlZEZlZWxpbmdzID0gW11cbiAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICBpZiB1c2VySW5mby5vcGluaW9uc1tmZWVsaW5nXT9cbiAgICAgICAgICBzb3J0ZWRGZWVsaW5ncy5wdXNoIGZlZWxpbmdcblxuICAgICAgZm9yIGZlZWxpbmcgaW4gc29ydGVkRmVlbGluZ3NcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OjwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJ1c2VyI3tmZWVsaW5nfVwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgdXNlckluZm8uYWRkZWQubGVuZ3RoID4gMFxuICAgICAgICBsaXN0SFRNTCArPSBcIlwiXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdFRpdGxlXCI+QWRkZWQ6PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cInVzZXJhZGRlZFwiPjwvZGl2PlxuICAgICAgICBcIlwiXCJcblxuICAgICAgaWYgbGlzdEhUTUwubGVuZ3RoID09IDBcbiAgICAgICAgbGlzdEhUTUwgKz0gXCJcIlwiXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPihObyBpbmZvIG9uIHRoaXMgdXNlcik8L2Rpdj5cbiAgICAgICAgXCJcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIGhhc0luY29taW5nT3BpbmlvbnMgPSBPYmplY3Qua2V5cyh1c2VySW5mby5vdGhlclRvdGFscy5pbmNvbWluZykubGVuZ3RoID4gMFxuICAgICAgICBoYXNPdXRnb2luZ09waW5pb25zID0gT2JqZWN0LmtleXModXNlckluZm8ub3RoZXJUb3RhbHMub3V0Z29pbmcpLmxlbmd0aCA+IDBcblxuICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zIG9yIGhhc091dGdvaW5nT3BpbmlvbnNcbiAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RUaXRsZVwiPk9waW5pb24gU3RhdHM6PC9kaXY+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpZiBoYXNJbmNvbWluZ09waW5pb25zXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+SW5jb21pbmcgVG90YWxzOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgaWYgdXNlckluZm8ub3RoZXJUb3RhbHMuaW5jb21pbmdbZmVlbGluZ10/XG4gICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje3VzZXJJbmZvLm90aGVyVG90YWxzLmluY29taW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDxsaT5JbmNvbWluZyBieSB1c2VyOjwvbGk+PHVsPlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5jb21pbmcgb2YgdXNlckluZm8ub3RoZXJPcGluaW9ucy5pbmNvbWluZ1xuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI3VzZXIvI3tlbmNvZGVVUklDb21wb25lbnQobmFtZSl9XCI+I3tuYW1lfTwvYT48L2xpPjx1bD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGZvciBmZWVsaW5nIGluIG9waW5pb25PcmRlclxuICAgICAgICAgICAgICAgIGlmIGluY29taW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgPGxpPiN7ZmVlbGluZ306ICN7aW5jb21pbmdbZmVlbGluZ119PC9saT5cbiAgICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaWYgaGFzT3V0Z29pbmdPcGluaW9uc1xuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPGxpPk91dGdvaW5nOjwvbGk+XG4gICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIGZlZWxpbmcgaW4gb3Bpbmlvbk9yZGVyXG4gICAgICAgICAgICAgIGlmIHVzZXJJbmZvLm90aGVyVG90YWxzLm91dGdvaW5nW2ZlZWxpbmddP1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICA8bGk+I3tmZWVsaW5nfTogI3t1c2VySW5mby5vdGhlclRvdGFscy5vdXRnb2luZ1tmZWVsaW5nXX08L2xpPlxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBodG1sICs9IFwiXCJcIlxuICAgICAgICAgICAgICA8bGk+T3V0Z29pbmcgYnkgdXNlcjo8L2xpPjx1bD5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZm9yIG5hbWUsIG91dGdvaW5nIG9mIHVzZXJJbmZvLm90aGVyT3BpbmlvbnMub3V0Z29pbmdcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiN1c2VyLyN7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfVwiPiN7bmFtZX08L2E+PC9saT48dWw+XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBmb3IgZmVlbGluZyBpbiBvcGluaW9uT3JkZXJcbiAgICAgICAgICAgICAgICBpZiBvdXRnb2luZ1tmZWVsaW5nXT9cbiAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgIDxsaT4je2ZlZWxpbmd9OiAje291dGdvaW5nW2ZlZWxpbmddfTwvbGk+XG4gICAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIFwiXCJcIlxuXG5cbiAgICAgIGh0bWwgKz0gbGlzdEhUTUxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKS5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgZm9yIGZlZWxpbmcsIGxpc3Qgb2YgdXNlckluZm8ub3BpbmlvbnNcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXIje2ZlZWxpbmd9XCIpLmlubmVySFRNTCA9IHJlbmRlckVudHJpZXMobnVsbCwgbnVsbCwgdXNlckluZm8ub3BpbmlvbnNbZmVlbGluZ10sIGZhbHNlLCB0cnVlLCB0cnVlKVxuICAgICAgICBpZiB1c2VySW5mby5hZGRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyYWRkZWRcIikuaW5uZXJIVE1MID0gcmVuZGVyRW50cmllcyhudWxsLCBudWxsLCB1c2VySW5mby5hZGRlZCwgZmFsc2UsIHRydWUsIHRydWUpXG4gICAgICAsIDBcblxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2luZm8vdXNlcj91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGxhc3RVc2VyKX1cIiwgdHJ1ZSlcbiAgeGh0dHAuc2VuZCgpXG5cbiAgdXBkYXRlT3RoZXIoKVxuICBsYXN0Q2xpY2tlZCA9IHNob3dVc2VyXG5cbmNsYXNzIENhc3RQbGF5ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHJlbW90ZVBsYXllciA9IG51bGxcbiAgICBAcmVtb3RlUGxheWVyQ29udHJvbGxlciA9IG51bGxcblxuICBpbml0aWFsaXplQ2FzdFBsYXllcjogLT5cbiAgICBvcHRpb25zID1cbiAgICAgIGF1dG9Kb2luUG9saWN5OiBjaHJvbWUuY2FzdC5BdXRvSm9pblBvbGljeS5PUklHSU5fU0NPUEVEXG4gICAgICByZWNlaXZlckFwcGxpY2F0aW9uSWQ6IGNocm9tZS5jYXN0Lm1lZGlhLkRFRkFVTFRfTUVESUFfUkVDRUlWRVJfQVBQX0lEXG4gICAgY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5zZXRPcHRpb25zKG9wdGlvbnMpXG4gICAgQHJlbW90ZVBsYXllciA9IG5ldyBjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXIoKVxuICAgIEByZW1vdGVQbGF5ZXJDb250cm9sbGVyID0gbmV3IGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllckNvbnRyb2xsZXIoQHJlbW90ZVBsYXllcilcbiAgICBAcmVtb3RlUGxheWVyQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllckV2ZW50VHlwZS5JU19DT05ORUNURURfQ0hBTkdFRCwgQHN3aXRjaFBsYXllci5iaW5kKHRoaXMpKVxuXG4gIHN3aXRjaFBsYXllcjogLT5cbiAgICBzZXNzaW9uU3RhdGUgPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25TdGF0ZSgpXG4gICAgaWYgc2Vzc2lvblN0YXRlICE9IGNhc3QuZnJhbWV3b3JrLlNlc3Npb25TdGF0ZS5TRVNTSU9OX1NUQVJURURcbiAgICAgIGNvbnNvbGUubG9nIFwiU2Vzc2lvbiBlbmRlZCFcIlxuICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZyBcIlNlc3Npb24gc3RhcnRpbmchXCJcbiAgICBzb2NrZXQuZW1pdCAnY2FzdHJlYWR5JywgeyBpZDogc29ja2V0LmlkIH1cblxuYmVnaW5DYXN0ID0gKHBrdCkgLT5cbiAgY29uc29sZS5sb2cgXCJDQVNUOlwiLCBwa3RcblxuICBzZXNzaW9uU3RhdGUgPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25TdGF0ZSgpXG4gIGlmIHNlc3Npb25TdGF0ZSAhPSBjYXN0LmZyYW1ld29yay5TZXNzaW9uU3RhdGUuU0VTU0lPTl9TVEFSVEVEXG4gICAgY29uc29sZS5sb2cgXCJObyBzZXNzaW9uOyBza2lwcGluZyBiZWdpbkNhc3RcIlxuICAgIHJldHVyblxuXG4gIGNvbnNvbGUubG9nIFwiU3RhcnRpbmcgY2FzdCFcIlxuICBjYXN0U2Vzc2lvbiA9IGNhc3QuZnJhbWV3b3JrLkNhc3RDb250ZXh0LmdldEluc3RhbmNlKCkuZ2V0Q3VycmVudFNlc3Npb24oKVxuICBtZWRpYUluZm8gPSBuZXcgY2hyb21lLmNhc3QubWVkaWEuTWVkaWFJbmZvKHBrdC51cmwsICd2aWRlby9tcDQnKVxuICByZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0Lm1lZGlhLkxvYWRSZXF1ZXN0KG1lZGlhSW5mbylcbiAgaWYgcGt0LnN0YXJ0ID4gMFxuICAgIHJlcXVlc3QuY3VycmVudFRpbWUgPSBwa3Quc3RhcnRcbiAgY2FzdFNlc3Npb24ubG9hZE1lZGlhKHJlcXVlc3QpXG5cbnNob3dXYXRjaEZvcm0gPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcblxuc2hvd1dhdGNoTGluayA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxucHJvY2Vzc0hhc2ggPSAtPlxuICBjdXJyZW50SGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXG4gIGlmIG1hdGNoZXMgPSBjdXJyZW50SGFzaC5tYXRjaCgvXiN1c2VyXFwvKC4rKS8pXG4gICAgbGFzdFVzZXIgPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hlc1sxXSlcbiAgICBzaG93VXNlcigpXG4gICAgcmV0dXJuXG4gIHN3aXRjaCBjdXJyZW50SGFzaFxuICAgIHdoZW4gJyNxdWV1ZSdcbiAgICAgIHNob3dRdWV1ZSgpXG4gICAgd2hlbiAnI2FsbCdcbiAgICAgIHNob3dQbGF5bGlzdCgpXG4gICAgd2hlbiAnI2JvdGgnXG4gICAgICBzaG93Qm90aCgpXG4gICAgd2hlbiAnI3N0YXRzJ1xuICAgICAgc2hvd1N0YXRzKClcbiAgICBlbHNlXG4gICAgICBzaG93UGxheWluZygpXG5cbmluaXQgPSAtPlxuICB3aW5kb3cuc2hvd1BsYXlpbmcgPSBzaG93UGxheWluZ1xuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXG4gIHdpbmRvdy5zaG93UGxheWxpc3QgPSBzaG93UGxheWxpc3RcbiAgd2luZG93LnNob3dCb3RoID0gc2hvd0JvdGhcbiAgd2luZG93LnNob3dTdGF0cyA9IHNob3dTdGF0c1xuICB3aW5kb3cuc2hvd1VzZXIgPSBzaG93VXNlclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXG4gIHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBwcm9jZXNzSGFzaFxuXG4gIHByb2Nlc3NIYXNoKClcblxuICBzb2NrZXQgPSBpbygpXG4gIHNvY2tldC5vbiAnY2FzdCcsIChwa3QpIC0+XG4gICAgYmVnaW5DYXN0KHBrdClcblxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxuICAgIGlmIGxhc3RDbGlja2VkP1xuICAgICAgbGFzdENsaWNrZWQoKVxuXG4gIHNvY2tldC5vbiAncmVmcmVzaCcsIChwa3QpIC0+XG4gICAgaWYgbGFzdENsaWNrZWQ/XG4gICAgICBsYXN0Q2xpY2tlZCgpXG5cbiAgd2luZG93Ll9fb25HQ2FzdEFwaUF2YWlsYWJsZSA9IChpc0F2YWlsYWJsZSkgLT5cbiAgICAjIGNvbnNvbGUubG9nIFwiX19vbkdDYXN0QXBpQXZhaWxhYmxlIGZpcmVkOiAje2lzQXZhaWxhYmxlfVwiXG4gICAgIyBjYXN0UGxheWVyID0gbmV3IENhc3RQbGF5ZXJcbiAgICAjIGlmIGlzQXZhaWxhYmxlXG4gICAgIyAgIGNhc3RQbGF5ZXIuaW5pdGlhbGl6ZUNhc3RQbGF5ZXIoKVxuXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcblxud2luZG93Lm9ubG9hZCA9IGluaXRcbiJdfQ==
