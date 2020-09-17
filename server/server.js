// Generated by CoffeeScript 2.5.1
(function() {
  var Bottleneck, autoPlayNext, bodyParser, calcEntryStrings, calcOther, calcUserInfo, dashboardsRefreshNeeded, entryFromArg, express, findMissingYoutubeInfo, fs, getColonTime, getLetterTime, getTime, getYoutubeData, history, https, isAnyoneCasting, isCasting, isPlaying, iso8601, lastPlayed, lastPlayedDuration, lastPlayedTime, lastPlayedTimeout, limiter, load, main, now, opinions, parseDuration, play, playNext, playingName, playlist, prettyDuration, queue, refreshDashboards, refreshDashboardsIfNeeded, requestDashboardRefresh, run, sanitizeUsername, saveOpinions, savePlaylist, saveState, secrets, serverEpoch, sockets, updateCasts, updateOpinion, updateOpinions, ytdl;

  Bottleneck = require('bottleneck');

  express = require('express');

  bodyParser = require('body-parser');

  iso8601 = require('iso8601-duration');

  fs = require('fs');

  https = require('https');

  ytdl = require('ytdl-core');

  limiter = new Bottleneck({
    maxConcurrent: 5
  });

  now = function() {
    return Math.floor(Date.now() / 1000);
  };

  serverEpoch = now();

  secrets = null;

  sockets = {};

  playlist = {};

  queue = [];

  history = [];

  lastPlayedTimeout = null;

  lastPlayedTime = now();

  lastPlayedDuration = 1;

  lastPlayed = null;

  isCasting = {};

  isPlaying = {};

  playingName = {};

  opinions = {};

  dashboardsRefreshNeeded = false;

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

  requestDashboardRefresh = function() {
    return dashboardsRefreshNeeded = true;
  };

  refreshDashboardsIfNeeded = function() {
    if (dashboardsRefreshNeeded) {
      // console.log "refreshDashboardsIfNeeded(): refreshing..."
      dashboardsRefreshNeeded = false;
      return refreshDashboards();
    }
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

  calcOther = function() {
    var count, names, other, sid, soc;
    names = [];
    count = 0;
    for (sid in sockets) {
      soc = sockets[sid];
      if (isPlaying[sid]) {
        count += 1;
      }
      if ((playingName[sid] != null) && playingName[sid].length > 0) {
        names.push(playingName[sid]);
      }
    }
    names.sort();
    other = {
      playing: count,
      names: names
    };
    return other;
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

  autoPlayNext = function() {
    var e;
    e = playNext();
    return console.log(`autoPlayNext: ${JSON.stringify(e, null, 2)}`);
  };

  play = function(e) {
    var endTime, socket, socketId, startTime;
    lastPlayedTime = now();
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
    console.log(`Playing: ${e.title} [${e.id}]`);
    startTime = e.start;
    if (startTime < 0) {
      startTime = 0;
    }
    endTime = e.end;
    if (endTime < 0) {
      endTime = e.duration;
    }
    lastPlayedDuration = endTime - startTime;
    if (lastPlayedDuration > e.duration) {
      lastPlayedDuration = e.duration - startTime;
    }
    // sanity check?
    if (lastPlayedDuration < 20) {
      lastPlayedDuration = e.duration;
    }
    if (lastPlayedTimeout != null) {
      clearTimeout(lastPlayedTimeout);
      lastPlayedTimeout = null;
    }
    lastPlayedTimeout = setTimeout(autoPlayNext, (lastPlayedDuration + 3) * 1000);
    console.log(`Play: [${e.title}] [${lastPlayedDuration} seconds]`);
  };

  parseDuration = function(s) {
    return iso8601.toSeconds(iso8601.parse(s));
  };

  getYoutubeData = function(e) {
    return limiter.schedule(function() {
      e.id = e.id.replace(/\?.+$/, "");
      console.log(`Looking up: ${e.id}`);
      return new Promise(function(resolve, reject) {
        var req, url;
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&key=${secrets.youtube}&id=${e.id}`;
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
              if ((data.items[0].snippet != null) && (data.items[0].snippet.title != null) && (data.items[0].snippet.thumbnails != null) && (data.items[0].contentDetails.duration != null)) {
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
                e.duration = parseDuration(data.items[0].contentDetails.duration);
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

  prettyDuration = function(duration) {
    var hours, minutes, str;
    str = "";
    hours = Math.floor(duration / 3600);
    if (hours > 0) {
      duration -= hours * 3600;
      str += `${hours}h`;
    }
    minutes = Math.floor(duration / 60);
    if (minutes > 0) {
      duration -= minutes * 60;
      str += `${minutes}m`;
    }
    if ((duration > 0) || (str.length === 0)) {
      str += `${duration}s`;
    }
    return str;
  };

  calcEntryStrings = function(e) {
    var actualDuration, count, endTime, feeling, opinionString, params, ref, startTime, title, url;
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
    startTime = e.start;
    if (startTime < 0) {
      startTime = 0;
    }
    endTime = e.end;
    if (endTime < 0) {
      endTime = e.duration;
    }
    actualDuration = endTime - startTime;
    opinionString = "";
    ref = e.opinions;
    for (feeling in ref) {
      count = ref[feeling];
      opinionString += `, ${count} ${feeling}${count === 1 ? "" : "s"}`;
    }
    return {
      title: title,
      url: url,
      description: `**${title}** \`[${e.user}, ${prettyDuration(actualDuration)}${opinionString}]\``
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

  calcUserInfo = function(user) {
    var base, base1, base2, base3, e, feeling, incoming, k, name1, otherUser, outgoing, ref, userInfo;
    userInfo = {
      added: [],
      opinions: {},
      otherOpinions: {
        incoming: {},
        outgoing: {}
      },
      otherTotals: {
        incoming: {},
        outgoing: {}
      }
    };
    incoming = userInfo.otherOpinions.incoming;
    outgoing = userInfo.otherOpinions.outgoing;
    for (k in playlist) {
      e = playlist[k];
      if (e.user === user) {
        userInfo.added.push(e);
        if (opinions[e.id] != null) {
          ref = opinions[e.id];
          for (otherUser in ref) {
            feeling = ref[otherUser];
            if (incoming[otherUser] == null) {
              incoming[otherUser] = {};
            }
            if ((base = incoming[otherUser])[feeling] == null) {
              base[feeling] = 0;
            }
            incoming[otherUser][feeling] += 1;
            if ((base1 = userInfo.otherTotals.incoming)[feeling] == null) {
              base1[feeling] = 0;
            }
            userInfo.otherTotals.incoming[feeling] += 1;
          }
        }
      }
      if (opinions[e.id] != null) {
        if (opinions[e.id][user] != null) {
          feeling = opinions[e.id][user];
          if (userInfo.opinions[feeling] == null) {
            userInfo.opinions[feeling] = [];
          }
          userInfo.opinions[feeling].push(e);
          if (outgoing[name1 = e.user] == null) {
            outgoing[name1] = {};
          }
          if ((base2 = outgoing[e.user])[feeling] == null) {
            base2[feeling] = 0;
          }
          outgoing[e.user][feeling] += 1;
          if ((base3 = userInfo.otherTotals.outgoing)[feeling] == null) {
            base3[feeling] = 0;
          }
          userInfo.otherTotals.outgoing[feeling] += 1;
        }
      }
    }
    return userInfo;
  };

  run = function(args, user) {
    var anonCount, cmd, e, l, len, name, name1, nameString, other, ref, ret, strs, title;
    cmd = 'who';
    if (args.length > 0) {
      cmd = args[0];
      cmd = cmd.replace(/^ +/, "");
      cmd = cmd.replace(/ +$/, "");
      if (cmd.length === 0) {
        cmd = 'who';
      }
    }
    // Sanitize command
    cmd = cmd.replace(/[^a-zA-Z0-9]/g, "");
    switch (cmd) {
      case 'help':
      case 'commands':
        return "MTV: Legal commands: `who`, `add`, `queue`, `remove`, `skip`, `like`, `meh`, `hate`, `none`";
      case 'here':
      case 'watching':
      case 'web':
      case 'website':
        other = calcOther();
        nameString = "";
        if (other.playing === 0) {
          return "MTV: [Here] Nobody is watching via the website.";
        }
        anonCount = other.playing - other.names.length;
        if (other.names.length > 0) {
          nameString = "";
          ref = other.names;
          for (l = 0, len = ref.length; l < len; l++) {
            name = ref[l];
            if (nameString.length > 0) {
              nameString += ", ";
            }
            nameString += `\`${name}\``;
          }
        }
        if (anonCount > 0) {
          if (nameString.length > 0) {
            nameString += " + ";
          }
          nameString += `**${anonCount}** anonymous`;
        }
        return `MTV: [Here] Watching via the website: ${nameString}`;
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
      case 'link':
      case 'url':
      case 'where':
        if (lastPlayed === null) {
          return "MTV: I have no idea what's playing.";
        }
        strs = calcEntryStrings(lastPlayed);
        return `MTV: ${strs.url}`;
      case 'like':
      case 'meh':
      case 'hate':
      case 'none':
        if (lastPlayed === null) {
          return "MTV: I have no idea what's playing.";
        }
        if (opinions[name1 = lastPlayed.id] == null) {
          opinions[name1] = {};
        }
        if (cmd === 'none') {
          if (opinions[lastPlayed.id][user] != null) {
            delete opinions[lastPlayed.id][user];
          }
        } else {
          opinions[lastPlayed.id][user] = cmd;
        }
        updateOpinion(lastPlayed);
        strs = calcEntryStrings(lastPlayed);
        saveOpinions();
        requestDashboardRefresh();
        return `MTV: Playing ${strs.description}`;
      case 'add':
        e = entryFromArg(args[1]);
        if (e == null) {
          return "MTV: add: invalid argument";
        }
        if (playlist[e.id] != null) {
          strs = calcEntryStrings(playlist[e.id]);
          return `MTV: Already in pool: ${strs.description}`;
        }
        e.user = user;
        playlist[e.id] = e;
        getYoutubeData(e);
        savePlaylist();
        return `MTV: Added to pool: ${e.id}`;
      case 'queue':
      case 'q':
        e = entryFromArg(args[1]);
        if (e == null) {
          return "MTV: queue: invalid argument";
        }
        if (playlist[e.id] != null) {
          queue.unshift(playlist[e.id]);
          strs = calcEntryStrings(playlist[e.id]);
          ret = `MTV: Queued next (already in pool) ${strs.description}`;
        } else {
          e.user = user;
          playlist[e.id] = e;
          queue.unshift(playlist[e.id]);
          getYoutubeData(e);
          savePlaylist();
          ret = `MTV: Queued next and added to pool: ${e.id}`;
        }
        saveState();
        setTimeout(function() {
          return requestDashboardRefresh();
        }, 3000);
        return ret;
      case 'shuffle':
        queue = [];
        e = playNext();
        strs = calcEntryStrings(e);
        requestDashboardRefresh();
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
          strs = calcEntryStrings(lastPlayed);
          ret = `MTV: Skipped ${strs.description}`;
        }
        e = playNext();
        if (ret == null) {
          ret = "MTV: Skipped unknown song";
        }
        return ret;
    }
    return `MTV: unknown command ${cmd}`;
  };

  findMissingYoutubeInfo = function() {
    var k, missingTitleCount, v;
    console.log("Checking for missing Youtube info...");
    missingTitleCount = 0;
    for (k in playlist) {
      v = playlist[k];
      if ((v.title == null) || (v.thumb == null) || (v.duration == null)) {
        getYoutubeData(v);
        missingTitleCount += 1;
      }
    }
    return console.log(`Found ${missingTitleCount} missing Youtube info.`);
  };

  sanitizeUsername = function(name) {
    if (name != null) {
      name = name.replace(/[^a-zA-Z0-9 ]/g, "");
      name = name.replace(/ +/g, " ");
      name = name.replace(/^ */, "");
      name = name.replace(/ *$/, "");
      if (name.length === 0) {
        return void 0;
      }
      name = name.substring(0, 16);
    }
    return name;
  };

  main = async function(argv) {
    var app, http, io;
    secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
    if ((secrets.youtube == null) || (secrets.cmd == null)) {
      console.error("Bad secrets: " + JSON.stringify(secrets));
      return;
    }
    console.log("Secrets:");
    console.log(JSON.stringify(secrets, null, 2));
    load();
    await findMissingYoutubeInfo();
    setInterval(function() {
      return findMissingYoutubeInfo();
    }, 60 * 1000);
    setInterval(function() {
      return refreshDashboardsIfNeeded();
    }, 5 * 1000);
    // attempt to restart whatever was just playing
    if (history.length > 0) {
      queue.unshift(history.shift());
    }
    playNext();
    app = express();
    http = require('http').createServer(app);
    io = require('socket.io')(http);
    io.on('connection', function(socket) {
      sockets[socket.id] = socket;
      socket.emit('server', {
        epoch: serverEpoch
      });
      socket.on('ready', function(msg) {
        var endTime, needsRefresh, startTime, username;
        // console.log "received ready"
        needsRefresh = false;
        if (!isPlaying[socket.id]) {
          isPlaying[socket.id] = true;
          needsRefresh = true;
        }
        username = sanitizeUsername(msg.user);
        if (playingName[socket.id] !== username) {
          if (username != null) {
            playingName[socket.id] = username;
          } else {
            delete playingName[socket.id];
          }
          needsRefresh = true;
        }
        if (needsRefresh) {
          requestDashboardRefresh();
        }
        if (lastPlayed != null) {
          // Give fresh watchers something to watch until the next song hits
          startTime = lastPlayed.start + (now() - lastPlayedTime);
          endTime = lastPlayed.end;
          if (endTime === -1) {
            endTime = lastPlayed.duration;
          }
          // console.log "endTime #{endTime} startTime #{startTime}"
          if ((endTime - startTime) > 5) {
            return socket.emit('play', {
              id: lastPlayed.id,
              start: startTime,
              end: endTime
            });
          }
        }
      });
      socket.on('disconnect', function() {
        if (sockets[socket.id] != null) {
          delete sockets[socket.id];
        }
        if (isCasting[socket.id] != null) {
          delete isCasting[socket.id];
        }
        if (playingName[socket.id] != null) {
          delete playingName[socket.id];
        }
        if (isPlaying[socket.id] != null) {
          delete isPlaying[socket.id];
          return requestDashboardRefresh();
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
    app.get('/info/user', function(req, res) {
      var userInfo;
      if ((req.query != null) && (req.query.user != null)) {
        userInfo = calcUserInfo(req.query.user);
        res.type('application/json');
        return res.send(JSON.stringify(userInfo, null, 2));
      } else {
        return res.send("supply a user");
      }
    });
    app.get('/info/other', function(req, res) {
      var other;
      other = calcOther();
      res.type('application/json');
      return res.send(JSON.stringify(other, null, 2));
    });
    app.use(bodyParser.json());
    app.post('/cmd', function(req, res) {
      var args, response, user;
      console.log(req.body);
      if ((req.body != null) && (req.body.cmd != null)) {
        if (req.body.secret !== secrets.cmd) {
          res.send("MTV: bad secret");
          return;
        }
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
