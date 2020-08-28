Bottleneck = require 'bottleneck'
express = require 'express'
bodyParser = require 'body-parser'
iso8601 = require 'iso8601-duration'
fs = require 'fs'
https = require 'https'
ytdl = require 'ytdl-core'

limiter = new Bottleneck {
  maxConcurrent: 5
}

now = ->
  return Math.floor(Date.now() / 1000)

serverEpoch = now()
secrets = null
sockets = {}
playlist = {}
queue = []
history = []
lastPlayedTimeout = null
lastPlayedTime = now()
lastPlayedDuration = 1
lastPlayed = null
isCasting = {}
isPlaying = {}
playingName = {}
opinions = {}

load = ->
  if fs.existsSync("playlist.json")
    loadedList = JSON.parse(fs.readFileSync("playlist.json", 'utf8'))

    playlist = {}
    for id, p of loadedList
      if typeof p == 'boolean'
        p =
          id: id
          user: 'Anonymous'
          start: -1
          end: -1
      playlist[id] = p

  if fs.existsSync("state.json")
    state = JSON.parse(fs.readFileSync("state.json", 'utf8'))
    for id in state.queue
      if playlist[id]?
        queue.push playlist[id]
    for id in state.history
      if playlist[id]?
        history.push playlist[id]
  if fs.existsSync("opinions.json")
    opinions = JSON.parse(fs.readFileSync("opinions.json", 'utf8'))
  return

savePlaylist = ->
  fs.writeFileSync("playlist.json", JSON.stringify(playlist, null, 2))

saveOpinions = ->
  fs.writeFileSync("opinions.json", JSON.stringify(opinions, null, 2))

refreshDashboards = ->
  for sid, soc of sockets
    soc.emit 'refresh', {}

saveState = ->
  savedQueue = []
  for e in queue
    savedQueue.push e.id
  savedHistory = []
  for e in history
    savedHistory.push e.id
  state =
    history: savedHistory
    queue: savedQueue
  fs.writeFileSync("state.json", JSON.stringify(state, null, 2))
  console.log "Saved State: (#{savedQueue.length} in queue, #{savedHistory.length} in history)"

isAnyoneCasting = ->
  for sid, soc of sockets
    if isCasting[sid]
      return true
  return false

calcOther = ->
  names = []
  count = 0
  for sid, soc of sockets
    if isPlaying[sid]
      count += 1
    if playingName[sid]? and playingName[sid].length > 0
      names.push playingName[sid]
  names.sort()

  other =
    playing: count
    names: names
  return other

updateCasts = (id = null) ->
  if lastPlayed == null
    return

  if not isAnyoneCasting()
    return

  ytdl.getInfo(lastPlayed.id).then (info) ->
    available = ytdl.filterFormats(info.formats, 'audioandvideo')
    if available.length > 0
      url = available[0].url
      for sid, soc of sockets
        if (id != null) and (id != sid)
          continue

        soc.emit 'cast', {
          url: url
          start: lastPlayed.start
        }

autoPlayNext = ->
  e = playNext()
  console.log "autoPlayNext: #{JSON.stringify(e, null, 2)}"

play = (e) ->
  lastPlayedTime = now()
  for socketId, socket of sockets
    socket.emit 'play', {
      id: e.id
      start: e.start
      end: e.end
    }
  lastPlayed = e
  lastPlayed.countPlay ?= 0
  lastPlayed.countPlay += 1
  history.unshift(e)
  while history.length > 20
    history.pop()
  updateCasts()
  saveState()
  savePlaylist()

  console.log "Playing: #{e.title} [#{e.id}]"
  startTime = e.start
  if startTime < 0
    startTime = 0
  endTime = e.end
  if endTime < 0
    endTime = e.duration
  lastPlayedDuration = endTime - startTime
  if lastPlayedDuration > e.duration
    lastPlayedDuration = e.duration - startTime
  # sanity check?
  if lastPlayedDuration < 20
    lastPlayedDuration = e.duration

  if lastPlayedTimeout?
    clearTimeout(lastPlayedTimeout)
    lastPlayedTimeout = null
  lastPlayedTimeout = setTimeout(autoPlayNext, (lastPlayedDuration + 3) * 1000)
  console.log "Play: [#{e.title}] [#{lastPlayedDuration} seconds]"
  return

parseDuration = (s) ->
  return iso8601.toSeconds(iso8601.parse(s))

getYoutubeData = (e) ->
  limiter.schedule ->
    e.id = e.id.replace(/\?.+$/, "")
    console.log "Looking up: #{e.id}"
    return new Promise (resolve, reject) ->
      url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&key=#{secrets.youtube}&id=#{e.id}"
      req = https.request url, (res) ->
        rawJSON = ""
        res.on 'data', (chunk) ->
          rawJSON += chunk
        res.on 'error', ->
          console.log "Error [#{e.id}]"
          resolve()
        res.on 'end', ->
          data = null
          try
            data = JSON.parse(rawJSON)
          catch
            console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
            return
          console.log "looking up #{e.id}"
          saved = false
          if data.items? and (data.items.length > 0)
            # console.log JSON.stringify(data, null, 2)
            if data.items[0].snippet? and data.items[0].snippet.title? and data.items[0].snippet.thumbnails? and data.items[0].contentDetails.duration?
              chosenThumb = null
              for thumbType, thumb of data.items[0].snippet.thumbnails
                if not chosenThumb?
                  chosenThumb = thumb
                  continue
                if thumbType == 'medium'
                  chosenThumb = thumb
                  break
                if chosenThumb.height < thumb.height
                  chosenThumb = thumb
              thumbUrl = null
              if chosenThumb?
                thumbUrl = chosenThumb.url
              if not thumbUrl?
                thumbUrl = '/unknown.png'

              e.title = data.items[0].snippet.title
              e.thumb = thumbUrl
              e.duration = parseDuration(data.items[0].contentDetails.duration)
              console.log "Found title [#{e.id}]: #{e.title}"
              savePlaylist()
              saved = true
          if not saved
            console.log "Nope [#{e.id}]"
          resolve()
      req.end()

playNext = ->
  if queue.length < 1
    unshuffled = []
    for k,v of playlist
      unshuffled.push(v)
    if unshuffled.length > 0
      queue = [ unshuffled.shift() ]
      for i, index in unshuffled
        j = Math.floor(Math.random() * (index + 1))
        queue.push(queue[j])
        queue[j] = i

  if queue.length < 1
    console.log "Nothing to play!"
    return null

  e = queue.shift()
  console.log e
  play(e)
  return e

# parses strings like 1h30m20s to seconds
getLetterTime = (timeString) ->
  totalSeconds = 0
  timeValues =
    's': 1
    'm': 1 * 60
    'h': 1 * 60 * 60
    'd': 1 * 60 * 60 * 24
    'w': 1 * 60 * 60 * 24 * 7

  # expand to "1 h 30 m 20 s" and split
  timeString = timeString.replace(/([smhdw])/g, ' $1 ').trim()
  timePairs = timeString.split(' ')

  for i in [0...timePairs.length] by 2
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs[i + 1] || 's']
  return totalSeconds

# parses strings like 1:30:20 to seconds
getColonTime = (timeString) ->
  totalSeconds = 0
  timeValues = [
    1
    1 * 60
    1 * 60 * 60
    1 * 60 * 60 * 24
    1 * 60 * 60 * 24 * 7
  ]
  timePairs = timeString.split(':')
  for i in [0...timePairs.length]
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs.length - i - 1]

  return totalSeconds

getTime = (timeString) ->
  if not timeString?
    return 0
  if timeString.match(/^(\d+[smhdw]?)+$/)
    return getLetterTime(timeString)
  if timeString.match(/^(\d+:?)+$/)
    return getColonTime(timeString)
  return 0

entryFromArg = (arg) ->
  if not arg?
    return null
  arg = String(arg)

  id = null
  startTime = -1
  endTime = -1

  try
    url = new URL(arg)
  catch
    url = null
    id = arg

  if not id? and (url.hostname == 'youtu.be')
    id = url.pathname.replace(/^\//, "")

  if not id? and url.hostname.match(/youtube.com$/)
    v = url.searchParams.get('v')
    if v?
      id = v

  if url?
    t = url.searchParams.get('t')
    if t?
      startTime = getTime(t)

    t = url.searchParams.get('start')
    if t?
      startTime = getTime(t)

    t = url.searchParams.get('end')
    if t?
      endTime = getTime(t)

  if not id?
    return null

  if id.match(/\?/)
    return null

  return {
    id: id
    start: startTime
    end: endTime
  }

prettyDuration = (duration) ->
  str = ""
  hours = Math.floor(duration / 3600)
  if hours > 0
    duration -= hours * 3600
    str += "#{hours}h"
  minutes = Math.floor(duration / 60)
  if minutes > 0
    duration -= minutes * 60
    str += "#{minutes}m"
  if (duration > 0) or (str.length == 0)
    str += "#{duration}s"
  return str

calcEntryStrings = (e) ->
  url = "https://youtu.be/#{e.id}"
  params = ""
  if e.start >= 0
    params += if params.length == 0 then "?" else "&"
    params += "start=#{e.start}"
  if e.end >= 0
    params += if params.length == 0 then "?" else "&"
    params += "end=#{e.end}"
  if e.title?
    title = "#{e.title} "
  else
    title = " "
  url = "#{url}#{params}"

  opinionString = ""
  for feeling, count of e.opinions
    opinionString += ", #{count} #{feeling}#{if count == 1 then "" else "s"}"
  return {
    title: title
    url: url
    description: "**#{title}** `[#{e.user}, #{url}#{opinionString}, #{prettyDuration(e.duration)}]`"
  }

updateOpinion = (e) ->
  o = {}
  if opinions[e.id]?
    for user, feeling of opinions[e.id]
      o[feeling] ?= 0
      o[feeling] += 1
  e.opinions = o
  return

updateOpinions = (entries, isMap) ->
  if isMap
    for k, v of entries
      updateOpinion(v)
  else
    for e in entries
      updateOpinion(e)
  return

run = (args, user) ->
  if args.length < 1
    return "MTV: No command given."

  switch args[0]

    when 'help', 'commands'
      return "MTV: Legal commands: `who`, `add`, `queue`, `remove`, `skip`, `like`, `meh`, `hate`, `none`"

    when 'here', 'watching', 'web', 'website'
      other = calcOther()
      nameString = ""
      if other.playing == 0
        return "MTV: [Here] Nobody is watching via the website."
      anonCount = other.playing - other.names.length
      if other.names.length > 0
        nameString = ""
        for name in other.names
          if nameString.length > 0
            nameString += ", "
          nameString += "`#{name}`"
      if anonCount > 0
        if nameString.length > 0
          nameString += " + "
        nameString += "**#{anonCount}** anonymous"
      return "MTV: [Here] Watching via the website: #{nameString}"

    when 'what', 'whatisthis', 'who', 'whodis', 'why'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      strs = calcEntryStrings(lastPlayed)
      return "MTV: Playing #{strs.description}"

    when 'like', 'meh', 'hate', 'none'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      opinions[lastPlayed.id] ?= {}
      if args[0] == 'none'
        if opinions[lastPlayed.id][user]?
          delete opinions[lastPlayed.id][user]
      else
        opinions[lastPlayed.id][user] = args[0]
      updateOpinion(lastPlayed)
      strs = calcEntryStrings(lastPlayed)
      saveOpinions()
      refreshDashboards()
      return "MTV: Playing #{strs.description}"

    when 'add'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: add: invalid argument"
      if playlist[e.id]?
        strs = calcEntryStrings(playlist[e.id])
        return "MTV: Already in pool: #{strs.description}"
      e.user = user
      playlist[e.id] = e
      getYoutubeData(e)
      savePlaylist()
      return "MTV: Added to pool: #{e.id}"

    when 'queue', 'q'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: queue: invalid argument"
      if playlist[e.id]?
        queue.unshift(playlist[e.id])
        strs = calcEntryStrings(playlist[e.id])
        ret = "MTV: Queued next (already in pool) #{strs.description}"
      else
        e.user = user
        playlist[e.id] = e
        queue.unshift(playlist[e.id])
        getYoutubeData(e)
        savePlaylist()
        ret = "MTV: Queued next and added to pool: #{e.id}"
      saveState()
      setTimeout(->
        refreshDashboards()
      , 3000)
      return ret

    when 'shuffle'
      queue = []
      e = playNext()
      strs = calcEntryStrings(e)
      refreshDashboards()
      return "MTV: Shuffled and playing a fresh song #{strs.description}"

    when 'remove', 'delete', 'del'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: remove: invalid argument"
      if playlist[e.id]?
        delete playlist[e.id]
        savePlaylist()
        title = e.title
        if not title?
          title = e.id
        return "MTV: Deleted #{title} from shuffled pool."
      else
        return "MTV: #{e.id} is already not in the shuffled pool."

    when 'next', 'skip'
      if lastPlayed?
        lastPlayed.countSkip ?= 0
        lastPlayed.countSkip += 1
      e = playNext()
      strs = calcEntryStrings(e)
      return "MTV: Playing #{strs.description}"

  return "MTV: unknown command #{args[0]}"

findMissingYoutubeInfo = ->
  console.log "Checking for missing Youtube info..."
  missingTitleCount = 0
  for k,v of playlist
    if not v.title? or not v.thumb? or not v.duration?
      getYoutubeData(v)
      missingTitleCount += 1
  console.log "Found #{missingTitleCount} missing Youtube info."

sanitizeUsername = (name) ->
  if name?
    name = name.replace(/[^a-zA-Z0-9 ]/g, "")
    name = name.replace(/ +/g, " ")
    name = name.replace(/^ */, "")
    name = name.replace(/ *$/, "")
    if name.length == 0
      return undefined
    name = name.substring(0, 16)
  return name

main = (argv) ->
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  if not secrets.youtube? or not secrets.cmd?
    console.error "Bad secrets: " + JSON.stringify(secrets)
    return

  console.log "Secrets:"
  console.log JSON.stringify(secrets, null, 2)

  load()

  await findMissingYoutubeInfo()
  setInterval( ->
    findMissingYoutubeInfo()
  , 60 * 1000)

  # attempt to restart whatever was just playing
  if history.length > 0
    queue.unshift(history.shift())
  playNext()

  app = express()
  http = require('http').createServer(app)

  io = require('socket.io')(http)
  io.on 'connection', (socket) ->
    sockets[socket.id] = socket

    socket.emit('server', { epoch: serverEpoch })

    socket.on 'ready', (msg) ->
      # console.log "received ready"
      needsRefresh = false
      if not isPlaying[socket.id]
        isPlaying[socket.id] = true
        needsRefresh = true

      username = sanitizeUsername(msg.user)
      if playingName[socket.id] != username
        if username?
          playingName[socket.id] = username
        else
          delete playingName[socket.id]
        needsRefresh = true

      if needsRefresh
        refreshDashboards()

      if lastPlayed?
        # Give fresh watchers something to watch until the next song hits
        startTime = lastPlayed.start + (now() - lastPlayedTime)
        endTime = lastPlayed.end
        if endTime == -1
          endTime = lastPlayed.duration

        # console.log "endTime #{endTime} startTime #{startTime}"
        if (endTime - startTime) > 5
          socket.emit 'play', {
            id: lastPlayed.id
            start: startTime
            end: endTime
          }

    socket.on 'disconnect', ->
      if sockets[socket.id]?
        delete sockets[socket.id]
      if isCasting[socket.id]?
        delete isCasting[socket.id]
      if playingName[socket.id]?
        delete playingName[socket.id]
      if isPlaying[socket.id]?
        delete isPlaying[socket.id]
        refreshDashboards()

    socket.on 'castready', (msg) ->
      console.log "castready!"
      if msg.id?
        isCasting[msg.id] = true
        updateCasts(msg.id)

  app.get '/', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/dashboard.html", "utf8")
    res.send(html)

  app.get '/stream', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/client.html", "utf8")
    res.send(html)

  app.get '/watch', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/client.html", "utf8")
    res.send(html)

  app.get '/info/playlist', (req, res) ->
    updateOpinions(playlist, true)
    res.type('application/json')
    res.send(JSON.stringify(playlist, null, 2))

  app.get '/info/queue', (req, res) ->
    updateOpinions(queue)
    res.type('application/json')
    res.send(JSON.stringify(queue, null, 2))

  app.get '/info/history', (req, res) ->
    updateOpinions(history)
    res.type('application/json')
    res.send(JSON.stringify(history, null, 2))

  app.get '/info/other', (req, res) ->
    other = calcOther()
    res.type('application/json')
    res.send(JSON.stringify(other, null, 2))

  app.use(bodyParser.json())
  app.post '/cmd', (req, res) ->
    console.log req.body
    if req.body? && req.body.cmd?
      if req.body.secret != secrets.cmd
        res.send("MTV: bad secret")
        return

      args = req.body.cmd.split(/\s+/g)
      user = req.body.user
      user ?= 'Anonymous'
      response = run(args, user)
      console.log "CMD: #{response}"
      res.send(response)
      return
    res.send("MTV: wat")

  app.use(express.static('web'))

  http.listen 3003, '127.0.0.1', ->
    console.log('listening on 127.0.0.1:3003')

module.exports = main
