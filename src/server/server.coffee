express = require 'express'
bodyParser = require 'body-parser'
fs = require 'fs'


DEBUG_HACKS = false

sockets = {}
playlist = {}
queue = []
lastPlayed = null

loadPlaylist = ->
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
  return

savePlaylist = ->
  fs.writeFileSync("playlist.json", JSON.stringify(playlist, null, 2))

play = (e) ->
  for socketId, socket of sockets
    socket.emit 'play', {
      id: e.id
      start: e.start
      end: e.end
    }
  lastPlayed = e
  return

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

  return {
    id: id
    start: startTime
    end: endTime
  }

run = (args, user) ->
  if args.length < 1
    return "MTV: No command given."

  switch args[0]

    when 'what', 'whatisthis', 'who', 'whodis'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      url = "https://youtu.be/#{lastPlayed.id}"
      params = ""
      if lastPlayed.start >= 0
        params += if params.length == 0 then "?" else "&"
        params += "start=#{lastPlayed.start}"
      if lastPlayed.end >= 0
        params += if params.length == 0 then "?" else "&"
        params += "end=#{lastPlayed.end}"
      return "MTV: Currently playing one of #{lastPlayed.user}'s songs: #{url}#{params}"

    when 'play'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: play: invalid argument"
      play(e)
      return "MTV: Playing #{e.id}"

    when 'add'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: add: invalid argument"
      if playlist[e.id]?
        return "MTV: Already in pool: #{e.id}"
      e.user = user
      playlist[e.id] = e
      savePlaylist()
      return "MTV: Added to pool: #{e.id}"

    when 'queue', 'q'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: queue: invalid argument"
      queue.unshift(e)
      if playlist[e.id]?
        return "MTV: Queued next (already in pool): #{e.id}"
      else
        e.user = user
        playlist[e.id] = e
        savePlaylist()
        return "MTV: Queued next and added to pool: #{e.id}"

    when 'shuffle'
      queue = []
      e = playNext()
      return "MTV: Shuffled and playing a fresh song: #{e.id}"

    when 'remove', 'delete', 'del'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: remove: invalid argument"
      if playlist[e.id]?
        delete playlist[e.id]
        savePlaylist()
        return "MTV: Deleted #{e.id} from shuffled pool."
      else
        return "MTV: #{e.id} is already not in the shuffled pool."

    when 'next', 'skip'
      e = playNext()
      return "MTV: Playing #{e.id}"

  return "MTV: unknown command #{args[0]}"

main = ->
  argv = process.argv.slice(2)
  if argv.length > 0
    console.log "Debug hacks enabled."
    DEBUG_HACKS = true

  loadPlaylist()

  app = express()
  http = require('http').createServer(app)

  io = require('socket.io')(http)
  io.on 'connection', (socket) ->
    sockets[socket.id] = socket

    socket.on 'ready', (msg) ->
      playNext()

    socket.on 'disconnect', ->
      if sockets[socket.id]?
        delete sockets[socket.id]

  app.get '/', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/client.html", "utf8")
    # html = html.replace(/!PLAYERID!/, pid)
    # html = html.replace(/!TABLEID!/, tid)
    res.send(html)

  app.use(bodyParser.json())
  app.post '/cmd', (req, res) ->
    console.log req.body
    if req.body? && req.body.cmd?
      args = req.body.cmd.split(/\s+/g)
      user = req.body.user
      user ?= 'Anonymous'
      response = run(args, user)
      console.log "CMD: #{response}"
      res.send(response)
      return
    res.send("MTV: wat")

  app.use(express.static('web'))

  http.listen 3003, ->
    console.log('listening on *:3003')

module.exports = main
