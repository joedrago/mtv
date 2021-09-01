player = null
socket = null
playing = false
serverEpoch = null

filters = require '../filters'

iso8601 = require 'iso8601-duration'

soloID = null
soloLabels = {}
soloUnshuffled = []
soloQueue = []
soloVideo = null
soloCount = 0
soloShowTimeout = null
soloError = false
soloMirror = false

endedTimer = null
overTimers = []

opinionOrder = ['love', 'like', 'meh', 'bleh', 'hate'] # always in this specific order

parseDuration = (s) ->
  return iso8601.toSeconds(iso8601.parse(s))

now = ->
  return Math.floor(Date.now() / 1000)

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
  finishInit()

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

showInfo = (pkt) ->
  console.log pkt

  overElement = document.getElementById("over")
  overElement.style.display = "none"
  for t in overTimers
    clearTimeout(t)
  overTimers = []

  if showTitles
    artist = pkt.artist
    artist = artist.replace(/^\s+/, "")
    artist = artist.replace(/\s+$/, "")
    title = pkt.title
    title = title.replace(/^\s+/, "")
    title = title.replace(/\s+$/, "")
    html = "#{artist}\n&#x201C;#{title}&#x201D;"
    if soloID?
      company = soloLabels[pkt.nickname]
      if not company?
        company = pkt.nickname.charAt(0).toUpperCase() + pkt.nickname.slice(1)
        company += " Records"
      html += "\n#{company}"
      if soloMirror
        html += "\nMirror Mode"
      else
        html += "\nSolo Mode"
    else
      html += "\n#{pkt.company}"
      feelings = []
      for o in opinionOrder
        if pkt.opinions[o]?
          feelings.push o
      if feelings.length == 0
        html += "\nNo Opinions"
      else
        for feeling in feelings
          list = pkt.opinions[feeling]
          list.sort()
          html += "\n#{feeling.charAt(0).toUpperCase() + feeling.slice(1)}: #{list.join(', ')}"
    overElement.innerHTML = html

    overTimers.push setTimeout ->
      fadeIn(overElement, 1000)
    , 3000
    overTimers.push setTimeout ->
      fadeOut(overElement, 1000)
    , 15000

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

  showInfo(pkt)

sendReady = ->
  console.log "Ready"
  user = qs('user')
  sfw = false
  if qs('sfw')
    sfw = true
  socket.emit 'ready', { user: user, sfw: sfw }

tick = ->
  if soloID?
    return

  if not playing and player?
    sendReady()
    return

  user = qs('user')
  sfw = false
  if qs('sfw')
    sfw = true
  socket.emit 'playing', { user: user, sfw: sfw }

# ---------------------------------------------------------------------------------------
# Solo Mode Engine

soloFatalError = (reason) ->
  console.log "soloFatalError: #{reason}"
  document.body.innerHTML = "ERROR: #{reason}"
  soloError = true

getData = (url) ->
  return new Promise (resolve, reject) ->
    xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = ->
        if (@readyState == 4) and (@status == 200)
           # Typical action to be performed when the document is ready:
           try
             entries = JSON.parse(xhttp.responseText)
             resolve(entries)
           catch
             resolve(null)
    xhttp.open("GET", url, true)
    xhttp.send()

soloTick = ->
  if not soloID? or soloError or soloMirror
    return

  console.log "soloTick()"
  if not playing and player?
    soloPlay()
    return

soloEnding = ->
  showInfo(soloVideo)

soloInfoBroadcast = ->
  if socket? and soloID? and soloVideo? and not soloMirror
    nextVideo = null
    if soloQueue.length > 0
      nextVideo = soloQueue[0]
    info =
      current: soloVideo
      next: nextVideo
      index: soloCount - soloQueue.length
      count: soloCount

    console.log "Broadcast: ", info
    socket.emit 'solo',{
      id: soloID
      cmd: 'info'
      info: info
    }

soloPlay = (restart = false) ->
  if soloError or soloMirror
    return

  if not restart or not soloVideo?
    if soloQueue.length == 0
      console.log "Reshuffling..."
      soloQueue = [ soloUnshuffled[0] ]
      for i, index in soloUnshuffled
        continue if index == 0
        j = Math.floor(Math.random() * (index + 1))
        soloQueue.push(soloQueue[j])
        soloQueue[j] = i

    soloVideo = soloQueue.shift()

  console.log soloVideo

  # debug
  # soloVideo.start = 10
  # soloVideo.end = 50
  # soloVideo.duration = 40

  play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end)

  soloInfoBroadcast()

  startTime = soloVideo.start
  if startTime < 0
    startTime = 0
  endTime = soloVideo.end
  if endTime < 0
    endTime = soloVideo.duration
  soloDuration = endTime - startTime
  if soloShowTimeout?
    clearTimeout(soloShowTimeout)
    soloShowTimeout = null
  if soloDuration > 30
    console.log "Showing info again in #{soloDuration - 15} seconds"
    soloShowTimeout = setTimeout(soloEnding, (soloDuration - 15) * 1000)

soloPause = ->
  if player?
    if player.getPlayerState() == 2
      player.playVideo()
    else
      player.pauseVideo()

soloCommand = (pkt) ->
  if not pkt.cmd?
    return
  if pkt.id != soloID
    return

  # console.log "soloCommand: ", pkt

  switch pkt.cmd
    when 'skip'
      soloPlay()
    when 'restart'
      soloPlay(true)
    when 'pause'
      soloPause()
    when 'info'
      if soloMirror
        soloVideo = pkt.info.current
        if soloVideo?
          if not player?
            console.log "no player yet"
          play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end)

  return

soloStartup = ->
  soloLabels = await getData("/info/labels")

  if qs('mirror')
    soloMirror = true
    return

  filterString = qs('filters')
  soloUnshuffled = await filters.generateList(filterString)
  if not soloUnshuffled?
    soloFatalError("Cannot get solo database!")
    return

  if soloUnshuffled.length == 0
    soloFatalError("No matching songs in the filter!")
    return
  soloCount = soloUnshuffled.length

  setInterval(soloTick, 5000)

# ---------------------------------------------------------------------------------------

youtubeReady = false
window.onYouTubePlayerAPIReady = ->
  if youtubeReady
    return
  youtubeReady = true

  console.log "onYouTubePlayerAPIReady"

  showControls = 1
  #if qs('controls')
  #  showControls = 1

  player = new YT.Player 'mtv-player', {
    width: '100%'
    height: '100%'
    videoId: 'AB7ykOfAgIA' # MTV loading screen, this will be replaced almost immediately
    playerVars: { 'autoplay': 1, 'enablejsapi': 1, 'controls': showControls }
    events: {
      onReady: onPlayerReady
      onStateChange: onPlayerStateChange
    }
  }

# called by onPlayerReady
finishInit = ->
  soloID = qs('solo')

  socket = io()

  socket.on 'connect', ->
    if soloID?
      socket.emit 'solo', { id: soloID }
      soloInfoBroadcast()

  if soloID?
    # Solo mode!

    soloStartup()

    socket.on 'solo', (pkt) ->
      if pkt.cmd?
        soloCommand(pkt)
  else
    # Normal MTV mode

    socket.on 'play', (pkt) ->
      # console.log pkt
      play(pkt, pkt.id, pkt.start, pkt.end)

    socket.on 'ending', (pkt) ->
      # console.log pkt
      showInfo(pkt)

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
