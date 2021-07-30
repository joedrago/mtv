constants = require '../constants'
Clipboard = require 'clipboard'
filters = require '../filters'

socket = null

player = null
endedTimer = null
playing = false
soloUnshuffled = []
soloQueue = []
soloTickTimeout = null
soloVideo = null
soloError = null
soloCount = 0
soloLabels = null
soloMirror = false

endedTimer = null
overTimers = []

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

  document.getElementById('list').innerHTML = ""

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

calcShareURL = (mirror) ->
  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  if mirror
    params.set("mirror", 1)
    params.delete("filters")
  else
    params.delete("solo")
    params.set("filters", params.get("filters").trim())
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  mtvURL = baseURL + "?" + querystring
  return mtvURL

startCast = ->
  console.log "start cast!"

  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  if params.get("mirror")?
    params.delete("filters")
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  baseURL = baseURL.replace(/solo$/, "")
  mtvURL = baseURL + "watch?" + querystring
  console.log "We're going here: #{mtvURL}"
  chrome.cast.requestSession (e) ->
    castSession = e
    castSession.sendMessage(DASHCAST_NAMESPACE, { url: mtvURL, force: true })
  , onError

# autoplay video
onPlayerReady = (event) ->
  event.target.playVideo()
  startHere()

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

calcLabel = (pkt) ->
  console.log "soloLabels(1): ", soloLabels
  if not soloLabels?
    soloLabels = await getData("/info/labels")
  company = null
  if soloLabels?
    company = soloLabels[pkt.nickname]
  if not company?
    company = pkt.nickname.charAt(0).toUpperCase() + pkt.nickname.slice(1)
    company += " Records"
  return company

showInfo = (pkt) ->
  overElement = document.getElementById("over")
  overElement.style.display = "none"
  for t in overTimers
    clearTimeout(t)
  overTimers = []

  artist = pkt.artist
  artist = artist.replace(/^\s+/, "")
  artist = artist.replace(/\s+$/, "")
  title = pkt.title
  title = title.replace(/^\s+/, "")
  title = title.replace(/\s+$/, "")
  html = "#{artist}\n&#x201C;#{title}&#x201D;"
  if soloID?
    company = await calcLabel(pkt)
    html += "\n#{company}"
    if soloMirror
      html += "\nMirror Mode"
    else
      html += "\nHere Mode"
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
  if not player?
    return
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
    pkt = {
      id: soloID
      cmd: 'info'
      info: info
    }
    socket.emit 'solo', pkt
    soloCommand(pkt)

soloPlay = (restart = false) ->
  if not player?
    return
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

soloTick = ->
  if not player?
    return

  if not soloID? or soloError or soloMirror
    return

  console.log "soloTick()"
  if not playing and player?
    soloPlay()
    return

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

startHere = ->
  showWatchLink()

  if not player?
    document.getElementById('solovideocontainer').style.display = 'block'
    document.getElementById('outer').classList.add('fadey')
    player = new YT.Player 'mtv-player', {
      width: '100%'
      height: '100%'
      videoId: 'AB7ykOfAgIA' # MTV loading screen, this will be replaced almost immediately
      playerVars: { 'autoplay': 1, 'enablejsapi': 1, 'controls': 1 }
      events: {
        onReady: onPlayerReady
        onStateChange: onPlayerStateChange
      }
    }
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

  if soloTickTimeout?
    clearInterval(soloTickTimeout)
  soloTickTimeout = setInterval(soloTick, 5000)
  soloQueue = []
  soloPlay()
  if soloMirror and soloVideo
    play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end)

calcPermalink = ->
  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  mtvURL = baseURL + "?" + querystring
  return mtvURL

generatePermalink = ->
  console.log "generatePermalink()"
  window.location = calcPermalink()

formChanged = ->
  console.log "Form changed!"
  history.replaceState('here', '', calcPermalink())

soloSkip = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'skip'
  }
  soloPlay()

soloRestart = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'restart'
  }
  soloPlay(true)

soloPause = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'pause'
  }
  pauseInternal()

renderInfo = ->
  if not soloInfo? or not soloInfo.current?
    return

  tagsString = Object.keys(soloInfo.current.tags).sort().join(', ')
  company = await calcLabel(soloInfo.current)

  html = "<div class=\"infocounts\">Track #{soloInfo.index} / #{soloInfo.count}</div>"
  # html += "<div class=\"infoheading\">Current: [<span class=\"youtubeid\">#{soloInfo.current.id}</span>]</div>"
  if not player?
    html += "<div class=\"infothumb\"><a href=\"https://youtu.be/#{encodeURIComponent(soloInfo.current.id)}\"><img width=320 height=180 src=\"#{soloInfo.current.thumb}\"></a></div>"
  html += "<div class=\"infocurrent infoartist\">#{soloInfo.current.artist}</div>"
  html += "<div class=\"infotitle\">\"#{soloInfo.current.title}\"</div>"
  html += "<div class=\"infolabel\">#{company}</div>"
  html += "<div class=\"infotags\">&nbsp;#{tagsString}&nbsp;</div>"
  if soloInfo.next?
    html += "<span class=\"infoheading nextvideo\">Next:</span> "
    html += "<span class=\"infoartist nextvideo\">#{soloInfo.next.artist}</span>"
    html += "<span class=\"nextvideo\"> - </span>"
    html += "<span class=\"infotitle nextvideo\">\"#{soloInfo.next.title}\"</span>"
  else
    html += "<span class=\"infoheading nextvideo\">Next:</span> "
    html += "<span class=\"inforeshuffle nextvideo\">(...Reshuffle...)</span>"
  document.getElementById('info').innerHTML = html

clipboardEdit = ->
  html = "<a class=\"cbutto copied\" onclick=\"return false\">Copied!</a>"
  document.getElementById('clipboard').innerHTML = html
  setTimeout ->
    renderClipboard()
  , 2000

renderClipboard = ->
  if not soloInfo? or not soloInfo.current?
    return

  html = "<a class=\"cbutto\" data-clipboard-text=\"#mtv edit #{soloInfo.current.id} \" onclick=\"clipboardEdit(); return false\">Edit</a>"
  document.getElementById('clipboard').innerHTML = html
  new Clipboard('.cbutto')

clipboardMirror = ->
  html = "<a class=\"mbutto copied\" onclick=\"return false\">Copied!</a>"
  document.getElementById('cbmirror').innerHTML = html
  setTimeout ->
    renderClipboardMirror()
  , 2000

renderClipboardMirror = ->
  if not soloInfo? or not soloInfo.current?
    return

  html = "<a class=\"mbutto\"onclick=\"clipboardMirror(); return false\">Mirror</a>"
  document.getElementById('cbmirror').innerHTML = html
  new Clipboard '.mbutto', {
    text: ->
      return calcShareURL(true)
  }

shareClipboard = (mirror) ->
  document.getElementById('list').innerHTML = """
    <div class=\"sharecopied\">Copied to clipboard:</div>
    <div class=\"shareurl\">#{calcShareURL(mirror)}</div>
  """

showList = ->
  document.getElementById('list').innerHTML = "Please wait..."

  filterString = document.getElementById('filters').value;
  list = await filters.generateList(filterString, true)
  if not list?
    document.getElementById('list').innerHTML = "Error. Sorry."
    return

  html = "<div class=\"listcontainer\">"
  html += "<div class=\"infocounts\">#{list.length} videos:</div>"
  for e in list
    html += "<div>"
    html += "<span class=\"infoartist nextvideo\">#{e.artist}</span>"
    html += "<span class=\"nextvideo\"> - </span>"
    html += "<span class=\"infotitle nextvideo\">\"#{e.title}\"</span>"
    html += "</div>\n"

  html += "</div>"

  document.getElementById('list').innerHTML = html

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

pauseInternal = ->
  if player?
    if player.getPlayerState() == 2
      player.playVideo()
    else
      player.pauseVideo()

soloCommand = (pkt) ->
  if pkt.id != soloID
    return
  console.log "soloCommand: ", pkt
  switch pkt.cmd
    when 'skip'
      soloPlay()
    when 'restart'
      soloPlay(true)
    when 'pause'
      pauseInternal()
    when 'info'
      if pkt.info?
        console.log "NEW INFO!: ", pkt.info
        soloInfo = pkt.info
        await renderInfo()
        renderClipboard()
        renderClipboardMirror()
        if soloMirror
          soloVideo = pkt.info.current
          if soloVideo?
            if not player?
              console.log "no player yet"
            play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end)
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
  document.getElementById("mirror").checked = false
  document.getElementById('filtersection').style.display = 'block'
  document.getElementById('mirrornote').style.display = 'none'
  generatePermalink()

loadPlaylist = ->
  combo = document.getElementById("loadname")
  selected = combo.options[combo.selectedIndex]
  selectedName = selected.value
  if not selectedName?
    return
  selectedName = selectedName.trim()
  if selectedName.length < 1
    return
  if not confirm("Are you sure you want to load '#{selectedName}'?")
    return
  discordToken = localStorage.getItem('token')
  playlistPayload = {
    token: discordToken
    action: "load"
    loadname: selectedName
  }
  socket.emit 'userplaylist', playlistPayload

deletePlaylist = ->
  combo = document.getElementById("loadname")
  selected = combo.options[combo.selectedIndex]
  selectedName = selected.value
  if not selectedName?
    return
  selectedName = selectedName.trim()
  if selectedName.length < 1
    return
  if not confirm("Are you sure you want to load '#{selectedName}'?")
    return
  discordToken = localStorage.getItem('token')
  playlistPayload = {
    token: discordToken
    action: "del"
    delname: selectedName
  }
  socket.emit 'userplaylist', playlistPayload

savePlaylist = ->
  outputName = document.getElementById("savename").value
  outputName = outputName.trim()
  outputFilters = document.getElementById("filters").value
  if outputName.length < 1
    return
  if not confirm("Are you sure you want to save '#{outputName}'?")
    return
  discordToken = localStorage.getItem('token')
  playlistPayload = {
    token: discordToken
    action: "save"
    savename: outputName
    filters: outputFilters
  }
  socket.emit 'userplaylist', playlistPayload

requestUserPlaylists = ->
  discordToken = localStorage.getItem('token')
  playlistPayload = {
    token: discordToken
    action: "list"
  }
  socket.emit 'userplaylist', playlistPayload

receiveUserPlaylist = (pkt) ->
  console.log "receiveUserPlaylist", pkt
  if pkt.list?
    combo = document.getElementById("loadname")
    combo.options.length = 0
    pkt.list.sort (a, b) ->
      a.toLowerCase().localeCompare(b.toLowerCase())
    for name in pkt.list
      isSelected = (name == pkt.selected)
      combo.options[combo.options.length] = new Option(name, name, false, isSelected)
    if pkt.list.length == 0
      combo.options[combo.options.length] = new Option("None", "")
  if pkt.loadname?
    document.getElementById("savename").value = pkt.loadname
  if pkt.filters?
    document.getElementById("filters").value = pkt.filters
  formChanged()

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
    requestUserPlaylists()
  else
    discordTag = null
    discordNickname = null
    discordToken = null

    redirectURL = String(window.location).replace(/#.*$/, "") + "oauth"
    loginLink = "https://discord.com/api/oauth2/authorize?client_id=#{window.CLIENT_ID}&redirect_uri=#{encodeURIComponent(redirectURL)}&response_type=code&scope=identify"
    html = """
      <div class="loginhint">(Login on <a href="/" target="_blank">Dashboard</a>)</div>
    """
    document.getElementById("loadarea")?.style.display = "none"
    document.getElementById("savearea")?.style.display = "none"
  document.getElementById("identity").innerHTML = html
  if lastClicked?
    lastClicked()

youtubeReady = false
window.onYouTubePlayerAPIReady = ->
  if youtubeReady
    return
  youtubeReady = true

  console.log "onYouTubePlayerAPIReady"
  setTimeout ->
    finishInit()
  , 0

finishInit = ->
  window.clipboardEdit = clipboardEdit
  window.clipboardMirror = clipboardMirror
  window.deletePlaylist = deletePlaylist
  window.formChanged = formChanged
  window.loadPlaylist = loadPlaylist
  window.logout = logout
  window.newSoloID = newSoloID
  window.savePlaylist = savePlaylist
  window.setOpinion = setOpinion
  window.shareClipboard = shareClipboard
  window.showList = showList
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.soloPause = soloPause
  window.soloRestart = soloRestart
  window.soloSkip = soloSkip
  window.startCast = startCast
  window.startHere = startHere

  updateSoloID(qs('solo'))

  qsFilters = qs('filters')
  if qsFilters?
    document.getElementById("filters").value = qsFilters

  soloMirror = qs('mirror')?
  document.getElementById("mirror").checked = soloMirror
  if soloMirror
    document.getElementById('filtersection').style.display = 'none'
    document.getElementById('mirrornote').style.display = 'block'

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

  socket.on 'userplaylist', (pkt) ->
    receiveUserPlaylist(pkt)

  prepareCast()

  new Clipboard '.share', {
    text: (trigger) ->
      mirror = false
      if trigger.value.match(/Mirror/i)
        mirror = true
      return calcShareURL(mirror)
  }

  if launchOpen
    showWatchForm()
  else
    showWatchLink()


setTimeout ->
  # somehow we missed this event, just kick it manually
  if not youtubeReady
    console.log "kicking Youtube..."
    window.onYouTubePlayerAPIReady()
, 3000
