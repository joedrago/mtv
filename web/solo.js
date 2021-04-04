(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var DASHCAST_NAMESPACE, castAvailable, castSession, constants, generatePermalink, init, now, onError, onInitSuccess, opinionOrder, pageEpoch, prepareCast, qs, renderInfo, sessionListener, sessionUpdateListener, showWatchForm, showWatchLink, socket, soloCommand, soloID, soloInfo, soloPause, soloRestart, soloSkip, startCast;

constants = require('../constants');

socket = null;

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast';

soloID = null;

soloInfo = {};

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

showWatchForm = function() {
  document.getElementById('aslink').style.display = 'none';
  document.getElementById('asform').style.display = 'block';
  document.getElementById('castbutton').style.display = 'inline-block';
  return document.getElementById("userinput").focus();
};

showWatchLink = function() {
  document.getElementById('aslink').style.display = 'inline-block';
  return document.getElementById('asform').style.display = 'none';
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
  baseURL = baseURL.replace(/solo$/, "");
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

generatePermalink = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  console.log("generatePermalink()");
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "?" + querystring;
  console.log(`We're going here: ${mtvURL}`);
  return window.location = mtvURL;
};

soloSkip = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'skip'
  });
};

soloRestart = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'restart'
  });
};

soloPause = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'pause'
  });
};

renderInfo = function() {
  var html;
  if ((soloInfo == null) || (soloInfo.current == null)) {
    return;
  }
  html = `<div class=\"infocounts\">Track ${soloInfo.index} / ${soloInfo.count}</div>`;
  html += "<div class=\"infoheading\">Current:</div>";
  html += `<div class=\"infoartist\">${soloInfo.current.artist}</div>`;
  html += `<div class=\"infotitle\">\"${soloInfo.current.title}\"</div>`;
  if (soloInfo.next != null) {
    html += "<div class=\"infoheading\">Next:</div>";
    html += `<div class=\"infoartist\">${soloInfo.next.artist}</div>`;
    html += `<div class=\"infotitle\">\"${soloInfo.next.title}\"</div>`;
  } else {
    html += "<div class=\"infoheading\">Next:</div>";
    html += "<div class=\"inforeshuffle\">(...Reshuffle...)</div>";
  }
  return document.getElementById('info').innerHTML = html;
};

soloCommand = function(pkt) {
  if (pkt.id !== soloID) {
    return;
  }
  console.log("soloCommand: ", pkt);
  switch (pkt.cmd) {
    case 'info':
      if (pkt.info != null) {
        console.log("NEW INFO!: ", pkt.info);
        soloInfo = pkt.info;
        return renderInfo();
      }
  }
};

init = function() {
  var qsFilters;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.startCast = startCast;
  window.soloSkip = soloSkip;
  window.soloRestart = soloRestart;
  window.soloPause = soloPause;
  window.generatePermalink = generatePermalink;
  soloID = qs('solo');
  if (soloID == null) {
    document.body.innerHTML = "ERROR: no solo query parameter";
    return;
  }
  document.getElementById("soloid").value = soloID;
  qsFilters = qs('filters');
  if (qsFilters != null) {
    document.getElementById("filters").value = qsFilters;
  }
  document.getElementById("controls").checked = qs('controls') != null;
  document.getElementById("hidetitles").checked = qs('hidetitles') != null;
  socket = io();
  socket.on('connect', function() {
    if (soloID != null) {
      return socket.emit('solo', {
        id: soloID
      });
    }
  });
  socket.on('solo', function(pkt) {
    return soloCommand(pkt);
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
    vh1: "VH1",
    "70s": "70s",
    "80s": "80s",
    disco: "Disco",
    soultrain: "SoulTrain"
  }
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L3NvbG8uY29mZmVlIiwic3JjL2NvbnN0YW50cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGtCQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBLFVBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0FBRVosTUFBQSxHQUFTOztBQUVULGtCQUFBLEdBQXFCOztBQUVyQixNQUFBLEdBQVM7O0FBQ1QsUUFBQSxHQUFXLENBQUE7O0FBRVgsYUFBQSxHQUFnQjs7QUFDaEIsV0FBQSxHQUFjOztBQUVkLFlBQUEsR0FBZSxTQUFTLENBQUM7O0FBRXpCLEdBQUEsR0FBTSxRQUFBLENBQUEsQ0FBQTtBQUNKLFNBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUF4QjtBQURIOztBQUdOLFNBQUEsR0FBWSxHQUFBLENBQUE7O0FBRVosRUFBQSxHQUFLLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDTCxNQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7RUFBRSxHQUFBLEdBQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUN0QixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCO0VBQ1AsS0FBQSxHQUFRLElBQUksTUFBSixDQUFXLE1BQUEsR0FBUyxJQUFULEdBQWdC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ZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0luZm8gPSB7fVxyXG5cclxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXHJcbmNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxub3Bpbmlvbk9yZGVyID0gY29uc3RhbnRzLm9waW5pb25PcmRlclxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhZ2VFcG9jaCA9IG5vdygpXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FzdGJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlcmlucHV0XCIpLmZvY3VzKClcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3NvbG8kLywgXCJcIilcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJ3YXRjaD9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxyXG4gICAgY2FzdFNlc3Npb24gPSBlXHJcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXHJcbiAgLCBvbkVycm9yXHJcblxyXG5nZW5lcmF0ZVBlcm1hbGluayA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJnZW5lcmF0ZVBlcm1hbGluaygpXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IG10dlVSTFxyXG5cclxuc29sb1NraXAgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAnc2tpcCdcclxuICB9XHJcblxyXG5zb2xvUmVzdGFydCA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdyZXN0YXJ0J1xyXG4gIH1cclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwYXVzZSdcclxuICB9XHJcblxyXG5yZW5kZXJJbmZvID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jb3VudHNcXFwiPlRyYWNrICN7c29sb0luZm8uaW5kZXh9IC8gI3tzb2xvSW5mby5jb3VudH08L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvaGVhZGluZ1xcXCI+Q3VycmVudDo8L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvYXJ0aXN0XFxcIj4je3NvbG9JbmZvLmN1cnJlbnQuYXJ0aXN0fTwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIiN7c29sb0luZm8uY3VycmVudC50aXRsZX1cXFwiPC9kaXY+XCJcclxuICBpZiBzb2xvSW5mby5uZXh0P1xyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9oZWFkaW5nXFxcIj5OZXh0OjwvZGl2PlwiXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2FydGlzdFxcXCI+I3tzb2xvSW5mby5uZXh0LmFydGlzdH08L2Rpdj5cIlxyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIiN7c29sb0luZm8ubmV4dC50aXRsZX1cXFwiPC9kaXY+XCJcclxuICBlbHNlXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2hlYWRpbmdcXFwiPk5leHQ6PC9kaXY+XCJcclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvcmVzaHVmZmxlXFxcIj4oLi4uUmVzaHVmZmxlLi4uKTwvZGl2PlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8nKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxyXG4gICAgcmV0dXJuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxyXG4gIHN3aXRjaCBwa3QuY21kXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBwa3QuaW5mbz9cclxuICAgICAgICBjb25zb2xlLmxvZyBcIk5FVyBJTkZPITogXCIsIHBrdC5pbmZvXHJcbiAgICAgICAgc29sb0luZm8gPSBwa3QuaW5mb1xyXG4gICAgICAgIHJlbmRlckluZm8oKVxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxyXG4gIHdpbmRvdy5zb2xvU2tpcCA9IHNvbG9Ta2lwXHJcbiAgd2luZG93LnNvbG9SZXN0YXJ0ID0gc29sb1Jlc3RhcnRcclxuICB3aW5kb3cuc29sb1BhdXNlID0gc29sb1BhdXNlXHJcbiAgd2luZG93LmdlbmVyYXRlUGVybWFsaW5rID0gZ2VuZXJhdGVQZXJtYWxpbmtcclxuXHJcbiAgc29sb0lEID0gcXMoJ3NvbG8nKVxyXG4gIGlmIG5vdCBzb2xvSUQ/XHJcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6IG5vIHNvbG8gcXVlcnkgcGFyYW1ldGVyXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic29sb2lkXCIpLnZhbHVlID0gc29sb0lEXHJcblxyXG4gIHFzRmlsdGVycyA9IHFzKCdmaWx0ZXJzJylcclxuICBpZiBxc0ZpbHRlcnM/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBxc0ZpbHRlcnNcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250cm9sc1wiKS5jaGVja2VkID0gcXMoJ2NvbnRyb2xzJyk/XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoaWRldGl0bGVzXCIpLmNoZWNrZWQgPSBxcygnaGlkZXRpdGxlcycpP1xyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuXHJcbiAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgIHNvbG9Db21tYW5kKHBrdClcclxuXHJcbiAgcHJlcGFyZUNhc3QoKVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIG9waW5pb25zOlxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXHJcbiAgICBsaWtlOiB0cnVlXHJcbiAgICBtZWg6IHRydWVcclxuXHJcbiAgb3Bpbmlvbk9yZGVyOiBbJ2xpa2UnLCAnbWVoJywgJ2JsZWgnLCAnaGF0ZSddICMgYWx3YXlzIGluIHRoaXMgc3BlY2lmaWMgb3JkZXJcclxuXHJcbiAgdGFnczpcclxuICAgIG5zZnc6IFwiTlNGV1wiXHJcblxyXG4gICAgYmFzczogXCJCYXNzXCJcclxuICAgIGRhbmNlOiBcIkRhbmNlXCJcclxuXHJcbiAgICBiZXQ6IFwiQkVUXCJcclxuICAgIGNtdDogXCJDTVRcIlxyXG4gICAgdmgxOiBcIlZIMVwiXHJcblxyXG4gICAgXCI3MHNcIjogXCI3MHNcIlxyXG4gICAgXCI4MHNcIjogXCI4MHNcIlxyXG4gICAgZGlzY286IFwiRGlzY29cIlxyXG4gICAgc291bHRyYWluOiBcIlNvdWxUcmFpblwiXHJcblxyXG4iXX0=
