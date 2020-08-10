(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CastPlayer, beginCast, init, lastClicked, renderEntries, showHistory, showList, showPlaylist, showQueue, socket;

socket = null;

lastClicked = null;

renderEntries = function(entries, isMap) {
  var e, extraInfo, html, i, k, len, m, params, title, url, v;
  html = "";
  if (isMap) {
    console.log(entries);
    m = entries;
    entries = [];
    for (k in m) {
      v = m[k];
      entries.push(v);
    }
    // This is the "all" list, sort it
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
  for (i = 0, len = entries.length; i < len; i++) {
    e = entries[i];
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
    html += `<div> * <a target="_blank" href="${url}">${title}</a> <span class="user">(${e.user}${extraInfo})</span></div>
`;
  }
  return document.getElementById("main").innerHTML = html;
};

showList = function(url, isMap = false) {
  var xhttp;
  document.getElementById('main').innerHTML = "";
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var entries;
    if ((this.readyState === 4) && (this.status === 200)) {
      try {
        // Typical action to be performed when the document is ready:
        entries = JSON.parse(xhttp.responseText);
        return renderEntries(entries, isMap);
      } catch (error) {
        return document.getElementById("main").innerHTML = "Error!";
      }
    }
  };
  xhttp.open("GET", url, true);
  return xhttp.send();
};

showHistory = function() {
  showList("/info/history");
  return lastClicked = showHistory;
};

showQueue = function() {
  showList("/info/queue");
  return lastClicked = showQueue;
};

showPlaylist = function() {
  showList("/info/playlist", true);
  return lastClicked = showPlaylist;
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

init = function() {
  window.showHistory = showHistory;
  window.showQueue = showQueue;
  window.showPlaylist = showPlaylist;
  showHistory();
  socket = io();
  socket.on('cast', function(pkt) {
    beginCast(pkt);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBOztBQUFBLE1BQUEsR0FBUzs7QUFFVCxXQUFBLEdBQWM7O0FBRWQsYUFBQSxHQUFnQixRQUFBLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtFQUFFLElBQUEsR0FBTztFQUVQLElBQUcsS0FBSDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWjtJQUNBLENBQUEsR0FBSTtJQUNKLE9BQUEsR0FBVTtJQUNWLEtBQUEsTUFBQTs7TUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7SUFERixDQUhKOztJQU9JLE9BQU8sQ0FBQyxJQUFSLENBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7TUFDWCxJQUFHLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQWY7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLEtBQWY7QUFDRSxlQUFPLEVBRFQ7O0FBRUEsYUFBTztJQUxJLENBQWIsRUFSRjs7RUFlQSxLQUFBLHlDQUFBOztJQUNFLEtBQUEsR0FBUSxDQUFDLENBQUM7SUFDVixJQUFPLGFBQVA7TUFDRSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBRFo7O0lBRUEsTUFBQSxHQUFTO0lBQ1QsSUFBRyxDQUFDLENBQUMsS0FBRixJQUFX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O0FBQ2pDLFFBQUE7SUFBSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsNkJBQUEsQ0FBQSxDQUFnQyxXQUFoQyxDQUFBLENBQVo7SUFDQSxVQUFBLEdBQWEsSUFBSSxVQUFKLENBQUE7SUFDYixJQUFHLFdBQUg7YUFDRSxVQUFVLENBQUMsb0JBQVgsQ0FBQSxFQURGOztFQUg2QjtTQU0vQixPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUFuQks7O0FBcUJQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwic29ja2V0ID0gbnVsbFxyXG5cclxubGFzdENsaWNrZWQgPSBudWxsXHJcblxyXG5yZW5kZXJFbnRyaWVzID0gKGVudHJpZXMsIGlzTWFwKSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcblxyXG4gIGlmIGlzTWFwXHJcbiAgICBjb25zb2xlLmxvZyBlbnRyaWVzXHJcbiAgICBtID0gZW50cmllc1xyXG4gICAgZW50cmllcyA9IFtdXHJcbiAgICBmb3IgaywgdiBvZiBtXHJcbiAgICAgIGVudHJpZXMucHVzaCB2XHJcblxyXG4gICAgIyBUaGlzIGlzIHRoZSBcImFsbFwiIGxpc3QsIHNvcnQgaXRcclxuICAgIGVudHJpZXMuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS50aXRsZSA8IGIudGl0bGVcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZSA+IGIudGl0bGVcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICByZXR1cm4gMFxyXG5cclxuICBmb3IgZSBpbiBlbnRyaWVzXHJcbiAgICB0aXRsZSA9IGUudGl0bGVcclxuICAgIGlmIG5vdCB0aXRsZT9cclxuICAgICAgdGl0bGUgPSBlLmlkXHJcbiAgICBwYXJhbXMgPSBcIlwiXHJcbiAgICBpZiBlLnN0YXJ0ID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwic3RhcnQ9I3tlLnN0YXJ0fVwiXHJcbiAgICBpZiBlLmVuZCA+PSAwXHJcbiAgICAgIHBhcmFtcyArPSBpZiBwYXJhbXMubGVuZ3RoID09IDAgdGhlbiBcIj9cIiBlbHNlIFwiJlwiXHJcbiAgICAgIHBhcmFtcyArPSBcImVuZD0je2UuZW5kfVwiXHJcbiAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tlLmlkfSN7cGFyYW1zfVwiXHJcbiAgICBleHRyYUluZm8gPSBcIlwiXHJcbiAgICBpZiBlLmNvdW50UGxheT9cclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2UuY291bnRQbGF5fSBwbGF5I3tpZiBlLmNvdW50UGxheSA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcbiAgICBpZiBlLmNvdW50U2tpcD9cclxuICAgICAgZXh0cmFJbmZvICs9IFwiLCAje2UuY291bnRTa2lwfSBza2lwI3tpZiBlLmNvdW50U2tpcCA9PSAxIHRoZW4gXCJcIiBlbHNlIFwic1wifVwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8ZGl2PiAqIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je3RpdGxlfTwvYT4gPHNwYW4gY2xhc3M9XCJ1c2VyXCI+KCN7ZS51c2VyfSN7ZXh0cmFJbmZvfSk8L3NwYW4+PC9kaXY+XHJcblxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcblxyXG5zaG93TGlzdCA9ICh1cmwsIGlzTWFwID0gZmFsc2UpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgIHJlbmRlckVudHJpZXMoZW50cmllcywgaXNNYXApXHJcbiAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dIaXN0b3J5ID0gLT5cclxuICBzaG93TGlzdChcIi9pbmZvL2hpc3RvcnlcIilcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dIaXN0b3J5XHJcblxyXG5zaG93UXVldWUgPSAtPlxyXG4gIHNob3dMaXN0KFwiL2luZm8vcXVldWVcIilcclxuICBsYXN0Q2xpY2tlZCA9IHNob3dRdWV1ZVxyXG5cclxuc2hvd1BsYXlsaXN0ID0gLT5cclxuICBzaG93TGlzdChcIi9pbmZvL3BsYXlsaXN0XCIsIHRydWUpXHJcbiAgbGFzdENsaWNrZWQgPSBzaG93UGxheWxpc3RcclxuXHJcbmNsYXNzIENhc3RQbGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEByZW1vdGVQbGF5ZXIgPSBudWxsXHJcbiAgICBAcmVtb3RlUGxheWVyQ29udHJvbGxlciA9IG51bGxcclxuXHJcbiAgaW5pdGlhbGl6ZUNhc3RQbGF5ZXI6IC0+XHJcbiAgICBvcHRpb25zID1cclxuICAgICAgYXV0b0pvaW5Qb2xpY3k6IGNocm9tZS5jYXN0LkF1dG9Kb2luUG9saWN5Lk9SSUdJTl9TQ09QRURcclxuICAgICAgcmVjZWl2ZXJBcHBsaWNhdGlvbklkOiBjaHJvbWUuY2FzdC5tZWRpYS5ERUZBVUxUX01FRElBX1JFQ0VJVkVSX0FQUF9JRFxyXG4gICAgY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5zZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICBAcmVtb3RlUGxheWVyID0gbmV3IGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllcigpXHJcbiAgICBAcmVtb3RlUGxheWVyQ29udHJvbGxlciA9IG5ldyBjYXN0LmZyYW1ld29yay5SZW1vdGVQbGF5ZXJDb250cm9sbGVyKEByZW1vdGVQbGF5ZXIpXHJcbiAgICBAcmVtb3RlUGxheWVyQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKGNhc3QuZnJhbWV3b3JrLlJlbW90ZVBsYXllckV2ZW50VHlwZS5JU19DT05ORUNURURfQ0hBTkdFRCwgQHN3aXRjaFBsYXllci5iaW5kKHRoaXMpKVxyXG5cclxuICBzd2l0Y2hQbGF5ZXI6IC0+XHJcbiAgICBzZXNzaW9uU3RhdGUgPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25TdGF0ZSgpXHJcbiAgICBpZiBzZXNzaW9uU3RhdGUgIT0gY2FzdC5mcmFtZXdvcmsuU2Vzc2lvblN0YXRlLlNFU1NJT05fU1RBUlRFRFxyXG4gICAgICBjb25zb2xlLmxvZyBcIlNlc3Npb24gZW5kZWQhXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJTZXNzaW9uIHN0YXJ0aW5nIVwiXHJcbiAgICBzb2NrZXQuZW1pdCAnY2FzdHJlYWR5JywgeyBpZDogc29ja2V0LmlkIH1cclxuXHJcbmJlZ2luQ2FzdCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJDQVNUOlwiLCBwa3RcclxuXHJcbiAgc2Vzc2lvblN0YXRlID0gY2FzdC5mcmFtZXdvcmsuQ2FzdENvbnRleHQuZ2V0SW5zdGFuY2UoKS5nZXRTZXNzaW9uU3RhdGUoKVxyXG4gIGlmIHNlc3Npb25TdGF0ZSAhPSBjYXN0LmZyYW1ld29yay5TZXNzaW9uU3RhdGUuU0VTU0lPTl9TVEFSVEVEXHJcbiAgICBjb25zb2xlLmxvZyBcIk5vIHNlc3Npb247IHNraXBwaW5nIGJlZ2luQ2FzdFwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgY29uc29sZS5sb2cgXCJTdGFydGluZyBjYXN0IVwiXHJcbiAgY2FzdFNlc3Npb24gPSBjYXN0LmZyYW1ld29yay5DYXN0Q29udGV4dC5nZXRJbnN0YW5jZSgpLmdldEN1cnJlbnRTZXNzaW9uKClcclxuICBtZWRpYUluZm8gPSBuZXcgY2hyb21lLmNhc3QubWVkaWEuTWVkaWFJbmZvKHBrdC51cmwsICd2aWRlby9tcDQnKVxyXG4gIHJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QubWVkaWEuTG9hZFJlcXVlc3QobWVkaWFJbmZvKVxyXG4gIGlmIHBrdC5zdGFydCA+IDBcclxuICAgIHJlcXVlc3QuY3VycmVudFRpbWUgPSBwa3Quc3RhcnRcclxuICBjYXN0U2Vzc2lvbi5sb2FkTWVkaWEocmVxdWVzdClcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5zaG93SGlzdG9yeSA9IHNob3dIaXN0b3J5XHJcbiAgd2luZG93LnNob3dRdWV1ZSA9IHNob3dRdWV1ZVxyXG4gIHdpbmRvdy5zaG93UGxheWxpc3QgPSBzaG93UGxheWxpc3RcclxuXHJcbiAgc2hvd0hpc3RvcnkoKVxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0Lm9uICdjYXN0JywgKHBrdCkgLT5cclxuICAgIGJlZ2luQ2FzdChwa3QpXHJcbiAgICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgICAgbGFzdENsaWNrZWQoKVxyXG5cclxuICB3aW5kb3cuX19vbkdDYXN0QXBpQXZhaWxhYmxlID0gKGlzQXZhaWxhYmxlKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJfX29uR0Nhc3RBcGlBdmFpbGFibGUgZmlyZWQ6ICN7aXNBdmFpbGFibGV9XCJcclxuICAgIGNhc3RQbGF5ZXIgPSBuZXcgQ2FzdFBsYXllclxyXG4gICAgaWYgaXNBdmFpbGFibGVcclxuICAgICAgY2FzdFBsYXllci5pbml0aWFsaXplQ2FzdFBsYXllcigpXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiJdfQ==
