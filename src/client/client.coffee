player = null
socket = null
playing = false
serverEpoch = null

endedTimer = null

qs = (name) ->
  url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  results = regex.exec(url);
  if not results or not results[2]
    return null
  return decodeURIComponent(results[2].replace(/\+/g, ' '))

# autoplay video
onPlayerReady = (event) ->
  event.target.playVideo()

# when video ends
onPlayerStateChange = (event) ->
  if endedTimer?
    clearTimeout(endedTimer)
    endedTimer = null

  videoData = player.getVideoData()
  if videoData? and videoData.title?
    console.log "Title: #{videoData.title}"
    window.document.title = "#{videoData.title} - [[MTV]]"

  if event.data == 0
    console.log "ENDED"
    endedTimer = setTimeout( ->
      playing = false
    , 2000)

play = (id, startSeconds = null, endSeconds = null) ->
  console.log "Playing: #{id}"
  opts = {
    videoId: id
  }
  if startSeconds? and (startSeconds >= 0)
    opts.startSeconds = startSeconds
  if endSeconds? and (endSeconds >= 1)
    opts.endSeconds = endSeconds
  player.loadVideoById(opts)
  playing = true

sendReady = ->
  console.log "Ready"
  user = qs('user')
  socket.emit 'ready', { user: user }

tick = ->
  if not playing and player?
    sendReady()

window.onYouTubePlayerAPIReady = ->
  console.log "onYouTubePlayerAPIReady"

  player = new YT.Player 'player', {
    width: '100%'
    height: '100%'
    videoId: 'AB7ykOfAgIA' # MTV loading screen, this will be replaced almost immediately
    playerVars: { 'autoplay': 1, 'controls': 0 }
    events: {
      onReady: onPlayerReady
      onStateChange: onPlayerStateChange
    }
  }

  socket = io()
  socket.on 'play', (pkt) ->
    console.log pkt
    play(pkt.id, pkt.start, pkt.end)

  socket.on 'server', (server) ->
    if serverEpoch? and (serverEpoch != server.epoch)
      console.log "Server epoch changed! The server must have rebooted. Requesting fresh video..."
      sendReady()
    serverEpoch = server.epoch

  setInterval(tick, 5000)
