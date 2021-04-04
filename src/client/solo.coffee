constants = require '../constants'

socket = null

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast'

soloID = null
soloInfo = {}

castAvailable = false
castSession = null

opinionOrder = constants.opinionOrder

now = ->
  return Math.floor(Date.now() / 1000)

pageEpoch = now()

qs = (name) ->
  url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  results = regex.exec(url);
  if not results or not results[2]
    return null
  return decodeURIComponent(results[2].replace(/\+/g, ' '))

showWatchForm = ->
  document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'block'
  document.getElementById('castbutton').style.display = 'inline-block'
  document.getElementById("userinput").focus()

showWatchLink = ->
  document.getElementById('aslink').style.display = 'inline-block'
  document.getElementById('asform').style.display = 'none'

onInitSuccess = ->
  console.log "Cast available!"
  castAvailable = true

onError = (message) ->

sessionListener = (e) ->
  castSession = e

sessionUpdateListener = (isAlive) ->
  if not isAlive
    castSession = null

prepareCast = ->
  if not chrome.cast or not chrome.cast.isAvailable
    if now() < (pageEpoch + 10) # give up after 10 seconds
      window.setTimeout(prepareCast, 100)
    return

  sessionRequest = new chrome.cast.SessionRequest('5C3F0A3C') # Dashcast
  apiConfig = new chrome.cast.ApiConfig sessionRequest, sessionListener, ->
  chrome.cast.initialize(apiConfig, onInitSuccess, onError)

startCast = ->
  console.log "start cast!"

  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  baseURL = baseURL.replace(/solo$/)
  mtvURL = baseURL + "watch?" + querystring
  console.log "We're going here: #{mtvURL}"
  chrome.cast.requestSession (e) ->
    castSession = e
    castSession.sendMessage(DASHCAST_NAMESPACE, { url: mtvURL, force: true })
  , onError

generatePermalink = ->
  console.log "generatePermalink()"

  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  mtvURL = baseURL + "?" + querystring
  console.log "We're going here: #{mtvURL}"
  window.location = mtvURL

soloSkip = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'skip'
  }

soloRestart = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'restart'
  }

soloPause = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'pause'
  }

renderInfo = ->
  if not soloInfo? or not soloInfo.current?
    return

  html = "<div class=\"infocounts\">Track #{soloInfo.index} / #{soloInfo.count}</div>"
  html += "<div class=\"infoheading\">Current:</div>"
  html += "<div class=\"infoartist\">#{soloInfo.current.artist}</div>"
  html += "<div class=\"infotitle\">\"#{soloInfo.current.title}\"</div>"
  if soloInfo.next?
    html += "<div class=\"infoheading\">Next:</div>"
    html += "<div class=\"infoartist\">#{soloInfo.next.artist}</div>"
    html += "<div class=\"infotitle\">\"#{soloInfo.next.title}\"</div>"
  else
    html += "<div class=\"infoheading\">Next:</div>"
    html += "<div class=\"inforeshuffle\">(...Reshuffle...)</div>"
  document.getElementById('info').innerHTML = html

soloCommand = (pkt) ->
  if pkt.id != soloID
    return
  console.log "soloCommand: ", pkt
  switch pkt.cmd
    when 'info'
      if pkt.info?
        console.log "NEW INFO!: ", pkt.info
        soloInfo = pkt.info
        renderInfo()

init = ->
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.startCast = startCast
  window.soloSkip = soloSkip
  window.soloRestart = soloRestart
  window.soloPause = soloPause
  window.generatePermalink = generatePermalink

  soloID = qs('solo')
  if not soloID?
    document.body.innerHTML = "ERROR: no solo query parameter"
    return
  document.getElementById("soloid").value = soloID

  qsFilters = qs('filters')
  if qsFilters?
    document.getElementById("filters").value = qsFilters

  document.getElementById("controls").checked = qs('controls')?
  document.getElementById("hidetitles").checked = qs('hidetitles')?

  socket = io()

  socket.on 'connect', ->
    if soloID?
      socket.emit 'solo', { id: soloID }

  socket.on 'solo', (pkt) ->
    soloCommand(pkt)

  prepareCast()

window.onload = init
