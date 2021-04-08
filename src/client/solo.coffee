constants = require '../constants'

socket = null

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast'

soloID = null
soloInfo = {}

discordToken = null
discordTag = null
discordNickname = null

castAvailable = false
castSession = null

launchOpen = (localStorage.getItem('launch') == "true")
console.log "launchOpen: #{launchOpen}"

opinionOrder = []
for o in constants.opinionOrder
  opinionOrder.push o
opinionOrder.push('none')

randomString = ->
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

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
  document.getElementById("filters").focus()
  launchOpen = true
  localStorage.setItem('launch', 'true')

showWatchLink = ->
  document.getElementById('aslink').style.display = 'inline-block'
  document.getElementById('asform').style.display = 'none'
  launchOpen = false
  localStorage.setItem('launch', 'false')

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
  baseURL = baseURL.replace(/solo$/, "")
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
  # html += "<div class=\"infoheading\">Current: [<span class=\"youtubeid\">#{soloInfo.current.id}</span>]</div>"
  html += "<div class=\"infothumb\"><a href=\"https://youtu.be/#{encodeURIComponent(soloInfo.current.id)}\"><img width=320 height=180 src=\"#{soloInfo.current.thumb}\"></a></div>"
  html += "<div class=\"infocurrent infoartist\">#{soloInfo.current.artist}</div>"
  html += "<div class=\"infotitle\">\"#{soloInfo.current.title}\"</div>"
  if soloInfo.next?
    html += "<span class=\"infoheading nextvideo\">Next:</span> "
    html += "<span class=\"infoartist nextvideo\">#{soloInfo.next.artist}</span>"
    html += "<span class=\"nextvideo\"> - </span>"
    html += "<span class=\"infotitle nextvideo\">\"#{soloInfo.next.title}\"</span>"
  else
    html += "<div class=\"infoheading nextvideo\">Next:</div>"
    html += "<div class=\"inforeshuffle nextvideo\">(...Reshuffle...)</div>"
  document.getElementById('info').innerHTML = html

clearOpinion = ->
  document.getElementById('opinions').innerHTML = ""

updateOpinion = (pkt) ->
  if not soloInfo? or not soloInfo.current? or not (pkt.id == soloInfo.current.id)
    return

  html = ""
  for o in opinionOrder by -1
    capo = o.charAt(0).toUpperCase() + o.slice(1)
    classes = "obutto"
    if o == pkt.opinion
      classes += " chosen"
    html += """
      <a class="#{classes}" onclick="setOpinion('#{o}'); return false;">#{capo}</a>
    """
  document.getElementById('opinions').innerHTML = html

setOpinion = (opinion) ->
  if not discordToken? or not soloInfo? or not soloInfo.current? or not soloInfo.current.id?
    return

  socket.emit 'opinion', { token: discordToken, id: soloInfo.current.id, set: opinion }

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
        clearOpinion()
        if discordToken? and soloInfo.current? and soloInfo.current.id?
          socket.emit 'opinion', { token: discordToken, id: soloInfo.current.id }

updateSoloID = (newSoloID) ->
  soloID = newSoloID
  if not soloID?
    document.body.innerHTML = "ERROR: no solo query parameter"
    return
  document.getElementById("soloid").value = soloID
  if socket?
    socket.emit 'solo', { id: soloID }

newSoloID = ->
  updateSoloID(randomString())
  generatePermalink()

logout = ->
  document.getElementById("identity").innerHTML = "Logging out..."
  localStorage.removeItem('token')
  discordToken = null
  sendIdentity()

sendIdentity = ->
  discordToken = localStorage.getItem('token')
  identityPayload = {
    token: discordToken
  }
  console.log "Sending identify: ", identityPayload
  socket.emit 'identify', identityPayload

receiveIdentity = (pkt) ->
  console.log "identify response:", pkt
  if pkt.disabled
    console.log "Discord auth disabled."
    document.getElementById("identity").innerHTML = ""
    return

  if pkt.tag? and (pkt.tag.length > 0)
    discordTag = pkt.tag
    discordNicknameString = ""
    if pkt.nickname?
      discordNickname = pkt.nickname
      discordNicknameString = " (#{discordNickname})"
    html = """
      #{discordTag}#{discordNicknameString} - [<a onclick="logout()">Logout</a>]
    """
  else
    discordTag = null
    discordNickname = null
    discordToken = null

    redirectURL = String(window.location).replace(/#.*$/, "") + "oauth"
    loginLink = "https://discord.com/api/oauth2/authorize?client_id=#{window.CLIENT_ID}&redirect_uri=#{encodeURIComponent(redirectURL)}&response_type=code&scope=identify"
    html = """
      <div class="loginhint">(Login on <a href="/" target="_blank">Dashboard</a>)</div>
    """
  document.getElementById("identity").innerHTML = html
  if lastClicked?
    lastClicked()

init = ->
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.startCast = startCast
  window.soloSkip = soloSkip
  window.soloRestart = soloRestart
  window.soloPause = soloPause
  window.generatePermalink = generatePermalink
  window.newSoloID = newSoloID
  window.logout = logout
  window.setOpinion = setOpinion

  updateSoloID(qs('solo'))

  qsFilters = qs('filters')
  if qsFilters?
    document.getElementById("filters").value = qsFilters

  document.getElementById("controls").checked = qs('controls')?
  document.getElementById("hidetitles").checked = qs('hidetitles')?

  socket = io()

  socket.on 'connect', ->
    if soloID?
      socket.emit 'solo', { id: soloID }
      sendIdentity()

  socket.on 'solo', (pkt) ->
    soloCommand(pkt)

  socket.on 'identify', (pkt) ->
    receiveIdentity(pkt)

  socket.on 'opinion', (pkt) ->
    updateOpinion(pkt)

  prepareCast()

  if launchOpen
    showWatchForm()
  else
    showWatchLink()

window.onload = init
