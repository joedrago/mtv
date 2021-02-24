player = null
socket = null
playing = false
serverEpoch = null

endedTimer = null
overTimers = []

opinionOrder = ['like', 'meh', 'bleh', 'hate'] # always in this specific order

qs = (name) ->
  url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  results = regex.exec(url);
  if not results or not results[2]
    return null
  return decodeURIComponent(results[2].replace(/\+/g, ' '))

showTitles = true
if qs('hidetitles')
  showTitles = false

fadeIn = (elem, ms) ->
  if not elem?
    return

  elem.style.opacity = 0
  elem.style.filter = "alpha(opacity=0)"
  elem.style.display = "inline-block"
  elem.style.visibility = "visible"

  if ms? and ms > 0
    opacity = 0
    timer = setInterval ->
      opacity += 50 / ms
      if opacity >= 1
        clearInterval(timer)
        opacity = 1

      elem.style.opacity = opacity
      elem.style.filter = "alpha(opacity=" + opacity * 100 + ")"
    , 50
  else
    elem.style.opacity = 1
    elem.style.filter = "alpha(opacity=1)"

fadeOut = (elem, ms) ->
  if not elem?
    return

  if ms? and ms > 0
    opacity = 1
    timer = setInterval ->
      opacity -= 50 / ms
      if opacity <= 0
        clearInterval(timer)
        opacity = 0
        elem.style.display = "none"
        elem.style.visibility = "hidden"
      elem.style.opacity = opacity
      elem.style.filter = "alpha(opacity=" + opacity * 100 + ")"
    , 50
  else
    elem.style.opacity = 0
    elem.style.filter = "alpha(opacity=0)"
    elem.style.display = "none"
    elem.style.visibility = "hidden"

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

play = (pkt, id, startSeconds = null, endSeconds = null) ->
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

  console.log pkt

  overElement = document.getElementById("over")
  overElement.style.display = "none"

  if showTitles
    artist = pkt.artist
    artist = artist.replace(/^\s+/, "")
    artist = artist.replace(/\s+$/, "")
    title = pkt.title
    title = title.replace(/^\s+/, "")
    title = title.replace(/\s+$/, "")
    html = "#{artist}\n\"#{title}\""
    feelings = []
    for o in opinionOrder
      if pkt.opinions[o]?
        feelings.push o
    if feelings.length == 0
      html += "\nNo Opinions"
    else
      for feeling in feelings
        list = pkt.opinions[feeling]
        html += "\n#{feeling.charAt(0).toUpperCase() + feeling.slice(1)}: #{list.join(',')}"
    overElement.innerHTML = html

    for t in overTimers
      clearTimeout(t)
    overTimers = []
    overTimers.push setTimeout ->
      fadeIn(overElement, 1000)
    , 3000
    overTimers.push setTimeout ->
      fadeOut(overElement, 1000)
    , 15000

sendReady = ->
  console.log "Ready"
  user = qs('user')
  sfw = false
  if qs('sfw')
    sfw = true
  socket.emit 'ready', { user: user, sfw: sfw }

tick = ->
  if not playing and player?
    sendReady()
    return

  user = qs('user')
  sfw = false
  if qs('sfw')
    sfw = true
  socket.emit 'playing', { user: user, sfw: sfw }

youtubeReady = false
window.onYouTubePlayerAPIReady = ->
  if youtubeReady
    return
  youtubeReady = true

  console.log "onYouTubePlayerAPIReady"

  showControls = 0
  if qs('controls')
    showControls = 1

  player = new YT.Player 'player', {
    width: '100%'
    height: '100%'
    videoId: 'AB7ykOfAgIA' # MTV loading screen, this will be replaced almost immediately
    playerVars: { 'autoplay': 1, 'controls': showControls }
    events: {
      onReady: onPlayerReady
      onStateChange: onPlayerStateChange
    }
  }

  socket = io()
  socket.on 'play', (pkt) ->
    # console.log pkt
    play(pkt, pkt.id, pkt.start, pkt.end)

  socket.on 'server', (server) ->
    if serverEpoch? and (serverEpoch != server.epoch)
      console.log "Server epoch changed! The server must have rebooted. Requesting fresh video..."
      sendReady()
    serverEpoch = server.epoch

  setInterval(tick, 5000)

setTimeout ->
  # somehow we missed this event, just kick it manually
  if not youtubeReady
    console.log "kicking Youtube..."
    window.onYouTubePlayerAPIReady()
, 3000
