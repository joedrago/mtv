(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var init, renderEntries, showHistory, showList, showPlaylist, showQueue;

renderEntries = function(entries, isMap) {
  var e, html, i, k, len, m, params, title, url, v;
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
    html += `<div> * <a target="_blank" href="${url}">${title}</a> <span class="user">(${e.user})</span></div>
`;
  }
  return document.getElementById("main").innerHTML = html;
};

showList = function(url, isMap = false) {
  var xhttp;
  document.getElementById('main').innerHTML = "history";
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
  return showList("/info/history");
};

showQueue = function() {
  return showList("/info/queue");
};

showPlaylist = function() {
  return showList("/info/playlist", true);
};

init = function() {
  window.showHistory = showHistory;
  window.showQueue = showQueue;
  window.showPlaylist = showPlaylist;
  showHistory();
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2Rhc2hib2FyZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLElBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUE7O0FBQUEsYUFBQSxHQUFnQixRQUFBLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBO0VBQUUsSUFBQSxHQUFPO0VBRVAsSUFBRyxLQUFIO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0lBQ0EsQ0FBQSxHQUFJO0lBQ0osT0FBQSxHQUFVO0lBQ1YsS0FBQSxNQUFBOztNQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtJQURGLENBSEo7O0lBT0ksT0FBTyxDQUFDLElBQVIsQ0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNYLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsS0FBZjtBQUNFLGVBQU8sQ0FBQyxFQURWOztNQUVBLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsS0FBZjtBQUNFLGVBQU8sRUFEVDs7QUFFQSxhQUFPO0lBTEksQ0FBYixFQVJGOztFQWVBLEtBQUEseUNBQUE7O0lBQ0UsS0FBQSxHQUFRLENBQUMsQ0FBQztJQUNWLElBQU8sYUFBUDtNQUNFLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FEWjs7SUFFQSxNQUFBLEdBQVM7SUFDVCxJQUFHLENBQUMsQ0FBQyxLQUFGLElBQVcsQ0FBZDtNQUNFLE1BQUEsSUFBYSxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFwQixHQUEyQixHQUEzQixHQUFvQztNQUM5QyxNQUFBLElBQVUsQ0FBQSxNQUFBLENBQUEsQ0FBUyxDQUFDLENBQUMsS0FBWCxDQUFBLEVBRlo7O0lBR0EsSUFBRyxDQUFDLENBQUMsR0FBRixJQUFTLENBQVo7TUFDRSxNQUFBLElBQWEsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBcEIsR0FBMkIsR0FBM0IsR0FBb0M7TUFDOUMsTUFBQSxJQUFVLENBQUEsSUFBQSxDQUFBLENBQU8sQ0FBQyxDQUFDLEdBQVQsQ0FBQSxFQUZaOztJQUdBLEdBQUEsR0FBTSxDQUFBLGlCQUFBLENBQUEsQ0FBb0IsQ0FBQyxDQUFDLEVBQXRCLENBQUEsQ0FBQSxDQUEyQixNQUEzQixDQUFBO0lBQ04sSUFBQSxJQUFRLENBQUEsaUNBQUEsQ0FBQSxDQUM2QixHQUQ3QixDQUFBLEVBQUEsQ0FBQSxDQUNxQyxLQURyQyxDQUFBLHlCQUFBLENBQUEsQ0FDc0UsQ0FBQyxDQUFDLElBRHhFLENBQUE7QUFBQTtFQVpWO1NBZ0JBLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEM7QUFsQzlCOztBQXFDaEIsUUFBQSxHQUFXLFFBQUEsQ0FBQyxHQUFELEVBQU0sUUFBUSxLQUFkLENBQUE7QUFDWCxNQUFBO0VBQUUsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxTQUFoQyxHQUE0QztFQUM1QyxLQUFBLEdBQVEsSUFBSSxjQUFKLENBQUE7RUFDUixLQUFLLENBQUMsa0JBQU4sR0FBMkIsUUFBQSxDQUFBLENBQUE7QUFDN0IsUUFBQTtJQUFNLElBQUcsQ0FBQyxJQUFDLENBQUEsVUFBRCxLQUFlLENBQWhCLENBQUEsSUFBdUIsQ0FBQyxJQUFDLENBQUEsTUFBRCxLQUFXLEdBQVosQ0FBMUI7QUFFRzs7UUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsWUFBakI7ZUFDVixhQUFBLENBQWMsT0FBZCxFQUF1QixLQUF2QixFQUZGO09BR0EsYUFBQTtlQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEMsU0FEOUM7T0FMSDs7RUFEdUI7RUFRM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLEVBQWtCLEdBQWxCLEVBQXVCLElBQXZCO1NBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBQTtBQVpTOztBQWNYLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtTQUFHLFFBQUEsQ0FBUyxlQUFUO0FBQUg7O0FBQ2QsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO1NBQUcsUUFBQSxDQUFTLGFBQVQ7QUFBSDs7QUFDWixZQUFBLEdBQWUsUUFBQSxDQUFBLENBQUE7U0FBRyxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsSUFBM0I7QUFBSDs7QUFFZixJQUFBLEdBQU8sUUFBQSxDQUFBLENBQUE7RUFDTCxNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsWUFBUCxHQUFzQjtFQUV0QixXQUFBLENBQUE7U0FFQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUFQSzs7QUFTUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInJlbmRlckVudHJpZXMgPSAoZW50cmllcywgaXNNYXApIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuXHJcbiAgaWYgaXNNYXBcclxuICAgIGNvbnNvbGUubG9nIGVudHJpZXNcclxuICAgIG0gPSBlbnRyaWVzXHJcbiAgICBlbnRyaWVzID0gW11cclxuICAgIGZvciBrLCB2IG9mIG1cclxuICAgICAgZW50cmllcy5wdXNoIHZcclxuXHJcbiAgICAjIFRoaXMgaXMgdGhlIFwiYWxsXCIgbGlzdCwgc29ydCBpdFxyXG4gICAgZW50cmllcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLnRpdGxlIDwgYi50aXRsZVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlID4gYi50aXRsZVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIGZvciBlIGluIGVudHJpZXNcclxuICAgIHRpdGxlID0gZS50aXRsZVxyXG4gICAgaWYgbm90IHRpdGxlP1xyXG4gICAgICB0aXRsZSA9IGUuaWRcclxuICAgIHBhcmFtcyA9IFwiXCJcclxuICAgIGlmIGUuc3RhcnQgPj0gMFxyXG4gICAgICBwYXJhbXMgKz0gaWYgcGFyYW1zLmxlbmd0aCA9PSAwIHRoZW4gXCI/XCIgZWxzZSBcIiZcIlxyXG4gICAgICBwYXJhbXMgKz0gXCJzdGFydD0je2Uuc3RhcnR9XCJcclxuICAgIGlmIGUuZW5kID49IDBcclxuICAgICAgcGFyYW1zICs9IGlmIHBhcmFtcy5sZW5ndGggPT0gMCB0aGVuIFwiP1wiIGVsc2UgXCImXCJcclxuICAgICAgcGFyYW1zICs9IFwiZW5kPSN7ZS5lbmR9XCJcclxuICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je2UuaWR9I3twYXJhbXN9XCJcclxuICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgIDxkaXY+ICogPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7dGl0bGV9PC9hPiA8c3BhbiBjbGFzcz1cInVzZXJcIj4oI3tlLnVzZXJ9KTwvc3Bhbj48L2Rpdj5cclxuXHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuXHJcbnNob3dMaXN0ID0gKHVybCwgaXNNYXAgPSBmYWxzZSkgLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiaGlzdG9yeVwiXHJcbiAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgIHJlbmRlckVudHJpZXMoZW50cmllcywgaXNNYXApXHJcbiAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IFwiRXJyb3IhXCJcclxuICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICB4aHR0cC5zZW5kKClcclxuXHJcbnNob3dIaXN0b3J5ID0gLT4gc2hvd0xpc3QoXCIvaW5mby9oaXN0b3J5XCIpXHJcbnNob3dRdWV1ZSA9IC0+IHNob3dMaXN0KFwiL2luZm8vcXVldWVcIilcclxuc2hvd1BsYXlsaXN0ID0gLT4gc2hvd0xpc3QoXCIvaW5mby9wbGF5bGlzdFwiLCB0cnVlKVxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LnNob3dIaXN0b3J5ID0gc2hvd0hpc3RvcnlcclxuICB3aW5kb3cuc2hvd1F1ZXVlID0gc2hvd1F1ZXVlXHJcbiAgd2luZG93LnNob3dQbGF5bGlzdCA9IHNob3dQbGF5bGlzdFxyXG5cclxuICBzaG93SGlzdG9yeSgpXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiJdfQ==
