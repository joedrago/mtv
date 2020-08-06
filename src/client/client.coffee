player = null
socket = null
playing = false

endedTimer = null

escapeHtml = (t) ->
    return t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")

# autoplay video
onPlayerReady = (event) ->
  event.target.playVideo()

# when video ends
onPlayerStateChange = (event) ->
  if endedTimer?
    clearTimeout(endedTimer)
    endedTimer = null

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

tick = ->
  if not playing and player?
    console.log "Ready"
    socket.emit 'ready', {}

window.onYouTubePlayerAPIReady = ->
  console.log "onYouTubePlayerAPIReady"

  player = new YT.Player 'player', {
    width: '100%'
    height: '100%'
    videoId: 'xpmQK_uPDpg' # nyan cat, this will be replaced almost immediately
    playerVars: { 'autoplay': 1, 'controls': 1 }
    events: {
      onReady: onPlayerReady
      onStateChange: onPlayerStateChange
    }
  }

  socket = io()
  socket.on 'play', (pkt) ->
    console.log pkt
    play(pkt.id, pkt.start, pkt.end)

  setInterval(tick, 5000)
