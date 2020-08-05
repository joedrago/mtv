player = null
socket = null
playing = false

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
  if event.data == 0
    # player.loadVideoById('PBwAxmrE194')
    console.log "Playing: false"
    playing = false

play = (id) ->
  console.log "Playing: #{id}"
  player.loadVideoById(id)
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
    events: {
      onReady: onPlayerReady
      onStateChange: onPlayerStateChange
    }
  }

  socket = io()
  socket.on 'play', (pkt) ->
    console.log pkt
    play(pkt.id)

  setInterval(tick, 3000)
