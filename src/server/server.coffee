express = require 'express'
fs = require 'fs'

DEBUG_HACKS = false

sockets = {}
playlist = {}
queue = []
lastId = ""

loadPlaylist = ->
  if fs.existsSync("playlist.json")
    playlist = JSON.parse(fs.readFileSync("playlist.json", 'utf8'))

savePlaylist = ->
  fs.writeFileSync("playlist.json", JSON.stringify(playlist, null, 2))

play = (id) ->
  for socketId, socket of sockets
    socket.emit 'play', {
      id: id
    }
  lastId = id
  return

playNext = ->
  if queue.length < 1
    unshuffled = Object.keys(playlist)
    if unshuffled.length > 0
      queue = [ unshuffled.shift() ]
      for i, index in unshuffled
        j = Math.floor(Math.random() * (index + 1))
        queue.push(queue[j])
        queue[j] = i

  if queue.length < 1
    console.log "Nothing to play!"
    return null

  nextId = queue.shift()
  play(nextId)
  return nextId

idFromArg = (arg) ->
  if not arg?
    return null
  arg = String(arg)

  try
    url = new URL(arg)
  catch
    return arg

  console.log url

  if url.hostname == 'youtu.be'
    return url.pathname.replace(/^\//, "")

  if url.hostname.match(/youtube.com$/)
    v = url.searchParams.get('v')
    console.log "v: #{v}"
    if v?
      return v

  return null

run = (args) ->
  if args.length < 1
    return "MTV: No command given."

  switch args[0]

    when 'what', 'whatisthis', 'who'
      return "MTV: Currently Playing https://youtu.be/#{lastId}"

    when 'play'
      id = idFromArg(args[1])
      if not id?
        return "MTV: play: invalid argument"
      play(id)
      return "MTV: Playing #{id}"

    when 'add'
      id = idFromArg(args[1])
      if not id?
        return "MTV: add: invalid argument"
      playlist[id] = true
      savePlaylist()
      return "MTV: Added to pool: #{id}"

    when 'queue', 'q'
      id = idFromArg(args[1])
      if not id?
        return "MTV: queue: invalid argument"
      queue.unshift(id)
      playlist[id] = true
      savePlaylist()
      return "MTV: Queued next and added to pool: #{id}"

    when 'shuffle'
      queue = []
      id = playNext()
      return "MTV: Shuffled and playing a fresh song: #{id}"

    when 'remove', 'delete', 'del'
      id = idFromArg(args[1])
      if not id?
        return "MTV: remove: invalid argument"
      if playlist[id]?
        delete playlist[id]
        savePlaylist()
        return "MTV: Deleted #{id} from shuffled pool."
      else
        return "MTV: #{id} is already not in the shuffled pool."

    when 'next', 'skip'
      id = playNext()
      return "MTV: Playing #{id}"

  return "MTV: unknown command #{args[0]}"

main = ->
  argv = process.argv.slice(2)
  if argv.length > 0
    console.log "Debug hacks enabled."
    DEBUG_HACKS = true

  loadPlaylist()
  # playlist['mczmFWlWPOI'] = true
  # playlist['EQzvQO2LcA4'] = true

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

  app.get '/cmd', (req, res) ->
    if req.query.cmd?
      args = req.query.cmd.split(/\s+/g)
      response = run(args)
      console.log "CMD: #{response}"
      res.send(response)
      return
    res.send("MTV: wat")

  app.use(express.static('web'))

  http.listen 3003, ->
    console.log('listening on *:3003')

module.exports = main
