(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var init, playlistId, processConvert, qs, redirectError, socket;

socket = null;

playlistId = null;

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

redirectError = function(reason) {
  document.getElementById('main').innerHTML = `ERROR: ${reason}`;
};

processConvert = function(convertPlaylistData) {
  var i, id, len, playlistOutput, url;
  playlistOutput = "";
  if (convertPlaylistData != null) {
    if (Array.isArray(convertPlaylistData)) {
      playlistOutput = "un";
      for (i = 0, len = convertPlaylistData.length; i < len; i++) {
        id = convertPlaylistData[i];
        playlistOutput += ` ${id}`;
      }
    }
    if (playlistOutput.length > 0) {
      playlistOutput = `ordered\n${playlistOutput}\n`;
    }
    url = `/play?solo=new&filters=${encodeURIComponent(playlistOutput)}`;
    window.location = url;
  } else {
    //document.getElementById("main").innerHTML = url
    return redirectError("No convert data. Are you logged into MTV?");
  }
};

init = function() {
  var discordToken;
  discordToken = localStorage.getItem('token');
  if (discordToken == null) {
    return redirectError("You must be logged in on <a href=\"/\">the Dashboard</a> to use this feature.");
  }
  playlistId = qs('list');
  if (playlistId == null) {
    return redirectError("No list detected?");
  }
  socket = io();
  socket.on('connect', function() {
    if (playlistId != null) {
      console.log("emitting convertplaylist");
      return socket.emit('convertplaylist', {
        token: discordToken,
        list: playlistId
      });
    }
  });
  return socket.on('convertplaylist', function(pkt) {
    return processConvert(pkt);
  });
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L3JlZGlyZWN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQUEsRUFBQSxFQUFBLGFBQUEsRUFBQTs7QUFBQSxNQUFBLEdBQVM7O0FBRVQsVUFBQSxHQUFhOztBQUViLEVBQUEsR0FBSyxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ0wsTUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0VBQUUsR0FBQSxHQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDdEIsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixNQUF4QjtFQUNQLEtBQUEsR0FBUSxJQUFJLE1BQUosQ0FBVyxNQUFBLEdBQVMsSUFBVCxHQUFnQixtQkFBM0I7RUFDUixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYO0VBQ1YsSUFBRyxDQUFJLE9BQUosSUFBZSxDQUFJLE9BQU8sQ0FBQyxDQUFELENBQTdCO0FBQ0UsV0FBTyxLQURUOztBQUVBLFNBQU8sa0JBQUEsQ0FBbUIsT0FBTyxDQUFDLENBQUQsQ0FBRyxDQUFDLE9BQVgsQ0FBbUIsS0FBbkIsRUFBMEIsR0FBMUIsQ0FBbkI7QUFQSjs7QUFTTCxhQUFBLEdBQWdCLFFBQUEsQ0FBQyxNQUFELENBQUE7RUFDZCxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDLENBQUEsT0FBQSxDQUFBLENBQVUsTUFBVixDQUFBO0FBRDlCOztBQUloQixjQUFBLEdBQWlCLFFBQUEsQ0FBQyxtQkFBRCxDQUFBO0FBQ2pCLE1BQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsY0FBQSxFQUFBO0VBQUUsY0FBQSxHQUFpQjtFQUNqQixJQUFHLDJCQUFIO0lBQ0UsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLG1CQUFkLENBQUg7TUFDRSxjQUFBLEdBQWlCO01BQ2pCLEtBQUEscURBQUE7O1FBQ0UsY0FBQSxJQUFrQixFQUFBLENBQUEsQ0FBSSxFQUFKLENBQUE7TUFEcEIsQ0FGRjs7SUFLQSxJQUFHLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLENBQTNCO01BQ0UsY0FBQSxHQUFpQixDQUFBLFNBQUEsQ0FBQSxDQUFZLGNBQVosQ0FBQSxFQUFBLEVBRG5COztJQUdBLEdBQUEsR0FBTSxDQUFBLHVCQUFBLENBQUEsQ0FBMEIsa0JBQUEsQ0FBbUIsY0FBbkIsQ0FBMUIsQ0FBQTtJQUNOLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLElBVnBCO0dBQUEsTUFBQTs7QUFhRSxXQUFPLGFBQUEsQ0FBYywyQ0FBZCxFQWJUOztBQUZlOztBQW9CakIsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0FBQ1AsTUFBQTtFQUFFLFlBQUEsR0FBZSxZQUFZLENBQUMsT0FBYixDQUFxQixPQUFyQjtFQUNmLElBQU8sb0JBQVA7QUFDRSxXQUFPLGFBQUEsQ0FBYywrRUFBZCxFQURUOztFQUdBLFVBQUEsR0FBYSxFQUFBLENBQUcsTUFBSDtFQUNiLElBQU8sa0JBQVA7QUFDRSxXQUFPLGFBQUEsQ0FBYyxtQkFBZCxFQURUOztFQUdBLE1BQUEsR0FBUyxFQUFBLENBQUE7RUFFVCxNQUFNLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsUUFBQSxDQUFBLENBQUE7SUFDbkIsSUFBRyxrQkFBSDtNQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksMEJBQVo7YUFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLGlCQUFaLEVBQStCO1FBQUUsS0FBQSxFQUFPLFlBQVQ7UUFBdUIsSUFBQSxFQUFNO01BQTdCLENBQS9CLEVBRkY7O0VBRG1CLENBQXJCO1NBS0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxpQkFBVixFQUE2QixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQzNCLGNBQUEsQ0FBZSxHQUFmO0VBRDJCLENBQTdCO0FBaEJLOztBQW1CUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInNvY2tldCA9IG51bGxcclxuXHJcbnBsYXlsaXN0SWQgPSBudWxsXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybClcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5yZWRpcmVjdEVycm9yID0gKHJlYXNvbikgLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbicpLmlubmVySFRNTCA9IFwiRVJST1I6ICN7cmVhc29ufVwiXHJcbiAgcmV0dXJuXHJcblxyXG5wcm9jZXNzQ29udmVydCA9IChjb252ZXJ0UGxheWxpc3REYXRhKSAtPlxyXG4gIHBsYXlsaXN0T3V0cHV0ID0gXCJcIlxyXG4gIGlmIGNvbnZlcnRQbGF5bGlzdERhdGE/XHJcbiAgICBpZiBBcnJheS5pc0FycmF5KGNvbnZlcnRQbGF5bGlzdERhdGEpXHJcbiAgICAgIHBsYXlsaXN0T3V0cHV0ID0gXCJ1blwiXHJcbiAgICAgIGZvciBpZCBpbiBjb252ZXJ0UGxheWxpc3REYXRhXHJcbiAgICAgICAgcGxheWxpc3RPdXRwdXQgKz0gXCIgI3tpZH1cIlxyXG5cclxuICAgIGlmIHBsYXlsaXN0T3V0cHV0Lmxlbmd0aCA+IDBcclxuICAgICAgcGxheWxpc3RPdXRwdXQgPSBcIm9yZGVyZWRcXG4je3BsYXlsaXN0T3V0cHV0fVxcblwiXHJcblxyXG4gICAgdXJsID0gXCIvcGxheT9zb2xvPW5ldyZmaWx0ZXJzPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHBsYXlsaXN0T3V0cHV0KX1cIlxyXG4gICAgd2luZG93LmxvY2F0aW9uID0gdXJsXHJcbiAgICAjZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLmlubmVySFRNTCA9IHVybFxyXG4gIGVsc2VcclxuICAgIHJldHVybiByZWRpcmVjdEVycm9yKFwiTm8gY29udmVydCBkYXRhLiBBcmUgeW91IGxvZ2dlZCBpbnRvIE1UVj9cIilcclxuXHJcbiAgcmV0dXJuXHJcblxyXG5cclxuaW5pdCA9IC0+XHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBpZiBub3QgZGlzY29yZFRva2VuP1xyXG4gICAgcmV0dXJuIHJlZGlyZWN0RXJyb3IoXCJZb3UgbXVzdCBiZSBsb2dnZWQgaW4gb24gPGEgaHJlZj1cXFwiL1xcXCI+dGhlIERhc2hib2FyZDwvYT4gdG8gdXNlIHRoaXMgZmVhdHVyZS5cIilcclxuXHJcbiAgcGxheWxpc3RJZCA9IHFzKCdsaXN0JylcclxuICBpZiBub3QgcGxheWxpc3RJZD9cclxuICAgIHJldHVybiByZWRpcmVjdEVycm9yKFwiTm8gbGlzdCBkZXRlY3RlZD9cIilcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgaWYgcGxheWxpc3RJZD9cclxuICAgICAgY29uc29sZS5sb2cgXCJlbWl0dGluZyBjb252ZXJ0cGxheWxpc3RcIlxyXG4gICAgICBzb2NrZXQuZW1pdCAnY29udmVydHBsYXlsaXN0JywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBsaXN0OiBwbGF5bGlzdElkIH1cclxuXHJcbiAgc29ja2V0Lm9uICdjb252ZXJ0cGxheWxpc3QnLCAocGt0KSAtPlxyXG4gICAgcHJvY2Vzc0NvbnZlcnQocGt0KVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIl19
