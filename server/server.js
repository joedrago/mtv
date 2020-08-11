// Generated by CoffeeScript 2.5.1
(function() {
  var Bottleneck, DEBUG_HACKS, bodyParser, calcEntryStrings, entryFromArg, express, findMissingTitles, fs, getColonTime, getLetterTime, getTime, getTitle, history, https, isAnyoneCasting, isCasting, lastPlayed, limiter, load, main, opinions, play, playNext, playlist, queue, refreshDashboards, run, saveOpinions, savePlaylist, saveState, secrets, sockets, updateCasts, updateOpinion, updateOpinions, ytdl;

  Bottleneck = require('bottleneck');

  express = require('express');

  bodyParser = require('body-parser');

  fs = require('fs');

  https = require('https');

  ytdl = require('ytdl-core');

  limiter = new Bottleneck({
    maxConcurrent: 5
  });

  DEBUG_HACKS = false;

  secrets = null;

  sockets = {};

  playlist = {};

  queue = [];

  history = [];

  lastPlayed = null;

  isCasting = {};

  opinions = {};

  load = function() {
    var id, l, len, len1, loadedList, m, p, ref, ref1, state;
    if (fs.existsSync("playlist.json")) {
      loadedList = JSON.parse(fs.readFileSync("playlist.json", 'utf8'));
      playlist = {};
      for (id in loadedList) {
        p = loadedList[id];
        if (typeof p === 'boolean') {
          p = {
            id: id,
            user: 'Anonymous',
            start: -1,
            end: -1
          };
        }
        playlist[id] = p;
      }
    }
    if (fs.existsSync("state.json")) {
      state = JSON.parse(fs.readFileSync("state.json", 'utf8'));
      ref = state.queue;
      for (l = 0, len = ref.length; l < len; l++) {
        id = ref[l];
        if (playlist[id] != null) {
          queue.push(playlist[id]);
        }
      }
      ref1 = state.history;
      for (m = 0, len1 = ref1.length; m < len1; m++) {
        id = ref1[m];
        if (playlist[id] != null) {
          history.push(playlist[id]);
        }
      }
    }
    if (fs.existsSync("opinions.json")) {
      opinions = JSON.parse(fs.readFileSync("opinions.json", 'utf8'));
    }
  };

  savePlaylist = function() {
    return fs.writeFileSync("playlist.json", JSON.stringify(playlist, null, 2));
  };

  saveOpinions = function() {
    return fs.writeFileSync("opinions.json", JSON.stringify(opinions, null, 2));
  };

  refreshDashboards = function() {
    var results, sid, soc;
    results = [];
    for (sid in sockets) {
      soc = sockets[sid];
      results.push(soc.emit('refresh', {}));
    }
    return results;
  };

  saveState = function() {
    var e, l, len, len1, m, savedHistory, savedQueue, state;
    savedQueue = [];
    for (l = 0, len = queue.length; l < len; l++) {
      e = queue[l];
      savedQueue.push(e.id);
    }
    savedHistory = [];
    for (m = 0, len1 = history.length; m < len1; m++) {
      e = history[m];
      savedHistory.push(e.id);
    }
    state = {
      history: savedHistory,
      queue: savedQueue
    };
    fs.writeFileSync("state.json", JSON.stringify(state, null, 2));
    return console.log(`Saved State: (${savedQueue.length} in queue, ${savedHistory.length} in history)`);
  };

  isAnyoneCasting = function() {
    var sid, soc;
    for (sid in sockets) {
      soc = sockets[sid];
      if (isCasting[sid]) {
        return true;
      }
    }
    return false;
  };

  updateCasts = function(id = null) {
    if (lastPlayed === null) {
      return;
    }
    if (!isAnyoneCasting()) {
      return;
    }
    return ytdl.getInfo(lastPlayed.id).then(function(info) {
      var available, results, sid, soc, url;
      available = ytdl.filterFormats(info.formats, 'audioandvideo');
      if (available.length > 0) {
        url = available[0].url;
        results = [];
        for (sid in sockets) {
          soc = sockets[sid];
          if ((id !== null) && (id !== sid)) {
            continue;
          }
          results.push(soc.emit('cast', {
            url: url,
            start: lastPlayed.start
          }));
        }
        return results;
      }
    });
  };

  play = function(e) {
    var socket, socketId;
    for (socketId in sockets) {
      socket = sockets[socketId];
      socket.emit('play', {
        id: e.id,
        start: e.start,
        end: e.end
      });
    }
    lastPlayed = e;
    if (lastPlayed.countPlay == null) {
      lastPlayed.countPlay = 0;
    }
    lastPlayed.countPlay += 1;
    history.unshift(e);
    while (history.length > 20) {
      history.pop();
    }
    updateCasts();
    saveState();
    savePlaylist();
  };

  getTitle = function(e) {
    return limiter.schedule(function() {
      e.id = e.id.replace(/\?.+$/, "");
      console.log(`Looking up: ${e.id}`);
      return new Promise(function(resolve, reject) {
        var req, url;
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${secrets.youtube}&id=${e.id}`;
        req = https.request(url, function(res) {
          var rawJSON;
          rawJSON = "";
          res.on('data', function(chunk) {
            return rawJSON += chunk;
          });
          res.on('error', function() {
            console.log(`Error [${e.id}]`);
            return resolve();
          });
          return res.on('end', function() {
            var chosenThumb, data, ref, saved, thumb, thumbType, thumbUrl;
            data = null;
            try {
              data = JSON.parse(rawJSON);
            } catch (error) {
              console.log(`ERROR: Failed to talk to parse JSON: ${rawJSON}`);
              return;
            }
            console.log(`looking up ${e.id}`);
            saved = false;
            if ((data.items != null) && (data.items.length > 0)) {
              // console.log JSON.stringify(data, null, 2)
              if ((data.items[0].snippet != null) && (data.items[0].snippet.title != null) && (data.items[0].snippet.thumbnails != null)) {
                chosenThumb = null;
                ref = data.items[0].snippet.thumbnails;
                for (thumbType in ref) {
                  thumb = ref[thumbType];
                  if (chosenThumb == null) {
                    chosenThumb = thumb;
                    continue;
                  }
                  if (thumbType === 'medium') {
                    chosenThumb = thumb;
                    break;
                  }
                  if (chosenThumb.height < thumb.height) {
                    chosenThumb = thumb;
                  }
                }
                thumbUrl = null;
                if (chosenThumb != null) {
                  thumbUrl = chosenThumb.url;
                }
                if (thumbUrl == null) {
                  thumbUrl = '/unknown.png';
                }
                e.title = data.items[0].snippet.title;
                e.thumb = thumbUrl;
                console.log(`Found title [${e.id}]: ${e.title}`);
                savePlaylist();
                saved = true;
              }
            }
            if (!saved) {
              console.log(`Nope [${e.id}]`);
            }
            return resolve();
          });
        });
        return req.end();
      });
    });
  };

  playNext = function() {
    var e, i, index, j, k, l, len, unshuffled, v;
    if (queue.length < 1) {
      unshuffled = [];
      for (k in playlist) {
        v = playlist[k];
        unshuffled.push(v);
      }
      if (unshuffled.length > 0) {
        queue = [unshuffled.shift()];
        for (index = l = 0, len = unshuffled.length; l < len; index = ++l) {
          i = unshuffled[index];
          j = Math.floor(Math.random() * (index + 1));
          queue.push(queue[j]);
          queue[j] = i;
        }
      }
    }
    if (queue.length < 1) {
      console.log("Nothing to play!");
      return null;
    }
    e = queue.shift();
    console.log(e);
    play(e);
    return e;
  };

  // parses strings like 1h30m20s to seconds
  getLetterTime = function(timeString) {
    var i, l, ref, timePairs, timeValues, totalSeconds;
    totalSeconds = 0;
    timeValues = {
      's': 1,
      'm': 1 * 60,
      'h': 1 * 60 * 60,
      'd': 1 * 60 * 60 * 24,
      'w': 1 * 60 * 60 * 24 * 7
    };
    // expand to "1 h 30 m 20 s" and split
    timeString = timeString.replace(/([smhdw])/g, ' $1 ').trim();
    timePairs = timeString.split(' ');
    for (i = l = 0, ref = timePairs.length; l < ref; i = l += 2) {
      totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs[i + 1] || 's'];
    }
    return totalSeconds;
  };

  // parses strings like 1:30:20 to seconds
  getColonTime = function(timeString) {
    var i, l, ref, timePairs, timeValues, totalSeconds;
    totalSeconds = 0;
    timeValues = [1, 1 * 60, 1 * 60 * 60, 1 * 60 * 60 * 24, 1 * 60 * 60 * 24 * 7];
    timePairs = timeString.split(':');
    for (i = l = 0, ref = timePairs.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
      totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs.length - i - 1];
    }
    return totalSeconds;
  };

  getTime = function(timeString) {
    if (timeString == null) {
      return 0;
    }
    if (timeString.match(/^(\d+[smhdw]?)+$/)) {
      return getLetterTime(timeString);
    }
    if (timeString.match(/^(\d+:?)+$/)) {
      return getColonTime(timeString);
    }
    return 0;
  };

  entryFromArg = function(arg) {
    var endTime, id, startTime, t, url, v;
    if (arg == null) {
      return null;
    }
    arg = String(arg);
    id = null;
    startTime = -1;
    endTime = -1;
    try {
      url = new URL(arg);
    } catch (error) {
      url = null;
      id = arg;
    }
    if ((id == null) && (url.hostname === 'youtu.be')) {
      id = url.pathname.replace(/^\//, "");
    }
    if ((id == null) && url.hostname.match(/youtube.com$/)) {
      v = url.searchParams.get('v');
      if (v != null) {
        id = v;
      }
    }
    if (url != null) {
      t = url.searchParams.get('t');
      if (t != null) {
        startTime = getTime(t);
      }
      t = url.searchParams.get('start');
      if (t != null) {
        startTime = getTime(t);
      }
      t = url.searchParams.get('end');
      if (t != null) {
        endTime = getTime(t);
      }
    }
    if (id == null) {
      return null;
    }
    if (id.match(/\?/)) {
      return null;
    }
    return {
      id: id,
      start: startTime,
      end: endTime
    };
  };

  calcEntryStrings = function(e) {
    var count, feeling, opinionString, params, ref, title, url;
    url = `https://youtu.be/${e.id}`;
    params = "";
    if (e.start >= 0) {
      params += params.length === 0 ? "?" : "&";
      params += `start=${e.start}`;
    }
    if (e.end >= 0) {
      params += params.length === 0 ? "?" : "&";
      params += `end=${e.end}`;
    }
    if (e.title != null) {
      title = `${e.title} `;
    } else {
      title = " ";
    }
    url = `${url}${params}`;
    opinionString = "";
    ref = e.opinions;
    for (feeling in ref) {
      count = ref[feeling];
      opinionString += `, ${count} ${feeling}${count === 1 ? "" : "s"}`;
    }
    return {
      title: title,
      url: url,
      description: `**${title}** \`[${e.user}, ${url}${opinionString}]\``
    };
  };

  updateOpinion = function(e) {
    var feeling, o, ref, user;
    o = {};
    if (opinions[e.id] != null) {
      ref = opinions[e.id];
      for (user in ref) {
        feeling = ref[user];
        if (o[feeling] == null) {
          o[feeling] = 0;
        }
        o[feeling] += 1;
      }
    }
    e.opinions = o;
  };

  updateOpinions = function(entries, isMap) {
    var e, k, l, len, v;
    if (isMap) {
      for (k in entries) {
        v = entries[k];
        updateOpinion(v);
      }
    } else {
      for (l = 0, len = entries.length; l < len; l++) {
        e = entries[l];
        updateOpinion(e);
      }
    }
  };

  run = function(args, user) {
    var e, name, strs, title;
    if (args.length < 1) {
      return "MTV: No command given.";
    }
    switch (args[0]) {
      case 'help':
      case 'commands':
        return "MTV: Legal commands: `who`, `add`, `queue`, `remove`, `skip`, `like`, `meh`, `hate`, `none`";
      case 'what':
      case 'whatisthis':
      case 'who':
      case 'whodis':
      case 'why':
        if (lastPlayed === null) {
          return "MTV: I have no idea what's playing.";
        }
        strs = calcEntryStrings(lastPlayed);
        return `MTV: Playing ${strs.description}`;
      case 'like':
      case 'meh':
      case 'hate':
      case 'none':
        if (lastPlayed === null) {
          return "MTV: I have no idea what's playing.";
        }
        if (opinions[name = lastPlayed.id] == null) {
          opinions[name] = {};
        }
        if (args[0] === 'none') {
          if (opinions[lastPlayed.id][user] != null) {
            delete opinions[lastPlayed.id][user];
          }
        } else {
          opinions[lastPlayed.id][user] = args[0];
        }
        updateOpinion(lastPlayed);
        strs = calcEntryStrings(lastPlayed);
        saveOpinions();
        refreshDashboards();
        return `MTV: Playing ${strs.description}`;
      case 'add':
        e = entryFromArg(args[1]);
        if (e == null) {
          return "MTV: add: invalid argument";
        }
        if (playlist[e.id] != null) {
          return `MTV: Already in pool: ${e.id}`;
        }
        e.user = user;
        playlist[e.id] = e;
        getTitle(e);
        savePlaylist();
        return `MTV: Added to pool: ${e.id}`;
      case 'queue':
      case 'q':
        e = entryFromArg(args[1]);
        if (e == null) {
          return "MTV: queue: invalid argument";
        }
        queue.unshift(e);
        if (playlist[e.id] != null) {
          strs = calcEntryStrings(playlist[e.id]);
          return `MTV: Queued next (already in pool) ${strs.description}`;
        } else {
          e.user = user;
          playlist[e.id] = e;
          getTitle(e);
          savePlaylist();
          return `MTV: Queued next and added to pool: ${e.id}`;
        }
        saveState();
        refreshDashboards();
        break;
      case 'shuffle':
        queue = [];
        e = playNext();
        strs = calcEntryStrings(e);
        refreshDashboards();
        return `MTV: Shuffled and playing a fresh song ${strs.description}`;
      case 'remove':
      case 'delete':
      case 'del':
        e = entryFromArg(args[1]);
        if (e == null) {
          return "MTV: remove: invalid argument";
        }
        if (playlist[e.id] != null) {
          delete playlist[e.id];
          savePlaylist();
          title = e.title;
          if (title == null) {
            title = e.id;
          }
          return `MTV: Deleted ${title} from shuffled pool.`;
        } else {
          return `MTV: ${e.id} is already not in the shuffled pool.`;
        }
        break;
      case 'next':
      case 'skip':
        if (lastPlayed != null) {
          if (lastPlayed.countSkip == null) {
            lastPlayed.countSkip = 0;
          }
          lastPlayed.countSkip += 1;
        }
        e = playNext();
        strs = calcEntryStrings(e);
        return `MTV: Playing ${strs.description}`;
    }
    return `MTV: unknown command ${args[0]}`;
  };

  findMissingTitles = function() {
    var k, missingTitleCount, v;
    console.log("Checking for missing titles...");
    missingTitleCount = 0;
    for (k in playlist) {
      v = playlist[k];
      if ((v.title == null) || (v.thumb == null)) {
        getTitle(v);
        missingTitleCount += 1;
      }
    }
    return console.log(`Found ${missingTitleCount} missing a title.`);
  };

  main = function() {
    var app, argv, http, io;
    argv = process.argv.slice(2);
    if (argv.length > 0) {
      console.log("Debug hacks enabled.");
      DEBUG_HACKS = true;
    }
    secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
    if ((secrets.stream == null) || (secrets.youtube == null)) {
      console.error("Bad secrets: " + JSON.stringify(secrets));
      return;
    }
    console.log("Secrets:");
    console.log(JSON.stringify(secrets, null, 2));
    load();
    findMissingTitles();
    setInterval(function() {
      return findMissingTitles();
    }, 60 * 1000);
    app = express();
    http = require('http').createServer(app);
    io = require('socket.io')(http);
    io.on('connection', function(socket) {
      sockets[socket.id] = socket;
      socket.on('ready', function(msg) {
        console.log(`ready: ${JSON.stringify(msg)}`);
        if (msg.secret === secrets.stream) {
          // Only the client with the secret gets to control the queue
          return playNext();
        } else if ((lastPlayed != null) && msg.fresh) {
          // Give fresh watchers something to watch until the next song hits
          return socket.emit('play', {
            id: lastPlayed.id,
            start: lastPlayed.start,
            end: lastPlayed.end
          });
        }
      });
      socket.on('disconnect', function() {
        if (sockets[socket.id] != null) {
          delete sockets[socket.id];
        }
        if (isCasting[socket.id] != null) {
          return delete isCasting[socket.id];
        }
      });
      return socket.on('castready', function(msg) {
        console.log("castready!");
        if (msg.id != null) {
          isCasting[msg.id] = true;
          return updateCasts(msg.id);
        }
      });
    });
    app.get('/', function(req, res) {
      var html;
      html = fs.readFileSync(`${__dirname}/../web/dashboard.html`, "utf8");
      return res.send(html);
    });
    app.get('/stream', function(req, res) {
      var html;
      html = fs.readFileSync(`${__dirname}/../web/client.html`, "utf8");
      return res.send(html);
    });
    app.get('/watch', function(req, res) {
      var html;
      html = fs.readFileSync(`${__dirname}/../web/client.html`, "utf8");
      return res.send(html);
    });
    app.get('/info/playlist', function(req, res) {
      updateOpinions(playlist, true);
      res.type('application/json');
      return res.send(JSON.stringify(playlist, null, 2));
    });
    app.get('/info/queue', function(req, res) {
      updateOpinions(queue);
      res.type('application/json');
      return res.send(JSON.stringify(queue, null, 2));
    });
    app.get('/info/history', function(req, res) {
      updateOpinions(history);
      res.type('application/json');
      return res.send(JSON.stringify(history, null, 2));
    });
    app.use(bodyParser.json());
    app.post('/cmd', function(req, res) {
      var args, response, user;
      console.log(req.body);
      if ((req.body != null) && (req.body.cmd != null)) {
        args = req.body.cmd.split(/\s+/g);
        user = req.body.user;
        if (user == null) {
          user = 'Anonymous';
        }
        response = run(args, user);
        console.log(`CMD: ${response}`);
        res.send(response);
        return;
      }
      return res.send("MTV: wat");
    });
    app.use(express.static('web'));
    return http.listen(3003, '127.0.0.1', function() {
      return console.log('listening on 127.0.0.1:3003');
    });
  };

  module.exports = main;

}).call(this);
