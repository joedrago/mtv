constants = require '../constants'
Clipboard = require 'clipboard'
filters = require '../filters'
Player = require './player'

socket = null

player = null
endedTimer = null
playing = false
soloUnshuffled = []
soloQueue = []
soloIndex = 0
soloTickTimeout = null
soloVideo = null
soloError = null
soloCount = 0
soloLabels = null
soloMirror = false

lastPlayedID = null

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

launchOpen = false # (localStorage.getItem('launch') == "true")
console.log "launchOpen: #{launchOpen}"

addEnabled = true
exportEnabled = false

isTesla = false
tapTimeout = null

currentPlaylistName = null

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

onTapShow = ->
  console.log "onTapShow"

  outer = document.getElementById('outer')
  if tapTimeout?
    clearTimeout(tapTimeout)
    tapTimeout = null
    outer.style.opacity = 0
  else
    outer.style.opacity = 1
    tapTimeout = setTimeout ->
      console.log "tapTimeout!"
      outer.style.opacity = 0
      tapTimeout = null
    , 10000


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
  document.getElementById('aslive').style.display = 'none'
  document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'block'
  document.getElementById('castbutton').style.display = 'inline-block'
  document.getElementById('playcontrols').style.display = 'block'
  document.getElementById("filters").focus()
  launchOpen = true
  localStorage.setItem('launch', 'true')

showWatchLink = ->
  document.getElementById('aslink').style.display = 'inline-block'
  document.getElementById('asform').style.display = 'none'
  document.getElementById('aslive').style.display = 'none'
  document.getElementById('playcontrols').style.display = 'block'
  launchOpen = false
  localStorage.setItem('launch', 'false')

  document.getElementById('list').innerHTML = ""

showWatchLive = ->
  document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'none'
  document.getElementById('aslive').style.display = 'block'
  document.getElementById('playcontrols').style.display = 'none'
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

calcPerma = ->
  combo = document.getElementById("loadname")
  selected = combo.options[combo.selectedIndex]
  selectedName = selected.value
  if not discordNickname? or (selectedName.length == 0)
    return ""
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  baseURL = baseURL.replace(/play$/, "p")
  mtvURL = baseURL + "/#{encodeURIComponent(discordNickname)}/#{encodeURIComponent(selectedName)}"
  return mtvURL

calcShareURL = (mirror) ->
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  if mirror
    baseURL = baseURL.replace(/play$/, "m")
    return baseURL + "/" + encodeURIComponent(soloID)

  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  params.set("solo", "new")
  params.set("filters", params.get("filters").trim())
  params.delete("savename")
  params.delete("loadname")
  querystring = params.toString()
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
  baseURL = baseURL.replace(/play$/, "cast")
  mtvURL = baseURL + "?" + querystring
  console.log "We're going here: #{mtvURL}"
  chrome.cast.requestSession (e) ->
    castSession = e
    castSession.sendMessage(DASHCAST_NAMESPACE, { url: mtvURL, force: true })
  , onError

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
  if not player?
    return
  console.log "Playing: #{id}"

  lastPlayedID = id
  player.play(id, startSeconds, endSeconds)
  playing = true

  showInfo(pkt)

soloInfoBroadcast = ->
  if socket? and soloID? and soloVideo? and not soloMirror
    nextVideo = null
    if soloIndex < soloQueue.length - 1
      nextVideo = soloQueue[soloIndex+1]
    info =
      current: soloVideo
      next: nextVideo
      index: soloIndex + 1
      count: soloCount

    console.log "Broadcast: ", info
    pkt = {
      id: soloID
      cmd: 'info'
      info: info
    }
    socket.emit 'solo', pkt
    soloCommand(pkt)

soloPlay = (delta = 1) ->
  if not player?
    return
  if soloError or soloMirror
    return

  if not soloVideo? or (soloQueue.length == 0) or ((soloIndex + delta) > (soloQueue.length - 1))
    console.log "Reshuffling..."
    soloQueue = [ soloUnshuffled[0] ]
    for i, index in soloUnshuffled
      continue if index == 0
      j = Math.floor(Math.random() * (index + 1))
      soloQueue.push(soloQueue[j])
      soloQueue[j] = i
    soloIndex = 0
  else
    soloIndex += delta

  if soloIndex < 0
    soloIndex = 0
  soloVideo = soloQueue[soloIndex]

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

  console.log "soloTick()"

  if soloID?
    # Solo!
    if soloError or soloMirror
      return
    if not playing and player?
      soloPlay()
      return

  else
    # Live!

    if not playing
      sendReady()
      return
    user = qs('user')
    sfw = false
    if qs('sfw')
      sfw = true
    socket.emit 'playing', { user: user, sfw: sfw }

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

mediaButtonsReady = false
listenForMediaButtons = ->
  if mediaButtonsReady
    return

  if not window.navigator?.mediaSession?
    setTimeout(->
      listenForMediaButtons()
    , 1000)
    return

  mediaButtonsReady = true
  window.navigator.mediaSession.setActionHandler 'previoustrack', ->
    soloPrev()
  window.navigator.mediaSession.setActionHandler 'nexttrack', ->
    soloSkip()
  console.log "Media Buttons ready."

renderPlaylistName = ->
  if not currentPlaylistName?
    document.getElementById('playlistname').innerHTML = ""
    document.title = "MTV Solo"
    return
  document.getElementById('playlistname').innerHTML = currentPlaylistName
  document.title = "MTV Solo: #{currentPlaylistName}"

sendReady = ->
  console.log "Ready"
  user = qs('user')
  sfw = false
  if qs('sfw')
    sfw = true
  socket.emit 'ready', { user: user, sfw: sfw }

startHere = ->
  if not player?
    document.getElementById('solovideocontainer').style.display = 'block'
    document.getElementById('outer').classList.add('corner')
    if isTesla
      onTapShow()
    else
      document.getElementById('outer').classList.add('fadey')

    player = new Player('#mtv-player')
    player.ended = (event) ->
      playing = false
    player.play('AB7ykOfAgIA') # MTV Loading...

  if soloID?
    # Solo Mode!

    showWatchLink()

    filterString = qs('filters')
    soloUnshuffled = await filters.generateList(filterString)
    if not soloUnshuffled?
      soloFatalError("Cannot get solo database!")
      return

    if soloUnshuffled.length == 0
      soloFatalError("No matching songs in the filter!")
      return
    soloCount = soloUnshuffled.length

    soloQueue = []
    soloPlay()
    if soloMirror and soloVideo
      play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end)
  else
    # Live Mode!
    showWatchLive()
    sendReady()

  if soloTickTimeout?
    clearInterval(soloTickTimeout)
  soloTickTimeout = setInterval(soloTick, 5000)

  document.getElementById("quickmenu").style.display = "none"
  listenForMediaButtons()

  if isTesla
    document.getElementById('tapshow').style.display = "block"

sprinkleFormQS = (params) ->
  userQS = qs('user')
  if userQS?
    params.set('user', userQS)
  sfwQS = qs('sfw')
  if sfwQS?
    params.set('sfw', sfwQS)

calcPermalink = ->
  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  params.delete("loadname")
  params.delete("savename")
  if not params.get('solo')
    params.delete('solo')
  if not params.get('filters')
    params.delete('filters')
  if currentPlaylistName?
    params.set("name", currentPlaylistName)
  sprinkleFormQS(params)
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  querystring = params.toString()
  if querystring.length > 0
    querystring = "?" + querystring
  mtvURL = baseURL + querystring
  return mtvURL

generatePermalink = ->
  console.log "generatePermalink()"
  window.location = calcPermalink()

formChanged = ->
  console.log "Form changed!"
  history.replaceState('here', '', calcPermalink())
  renderPlaylistName()

soloSkip = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'skip'
  }
  soloPlay()

soloPrev = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'prev'
  }
  soloPlay(-1)

soloRestart = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'restart'
  }
  soloPlay(0)

soloPause = ->
  socket.emit 'solo', {
    id: soloID
    cmd: 'pause'
  }
  pauseInternal()

renderInfo = (info, isLive = false) ->
  if not info? or not info.current?
    return

  console.log info

  if isLive
    tagsString = null
    company = await info.current.company
  else
    tagsString = Object.keys(info.current.tags).sort().join(', ')
    company = await calcLabel(info.current)

  html = ""
  if not isLive
    html += "<div class=\"infocounts\">Track #{info.index} / #{info.count}</div>"

  if not player?
    html += "<div class=\"infothumb\"><a href=\"https://youtu.be/#{encodeURIComponent(info.current.id)}\"><img width=320 height=180 src=\"#{info.current.thumb}\"></a></div>"
  html += "<div class=\"infocurrent infoartist\">#{info.current.artist}</div>"
  html += "<div class=\"infotitle\">\"#{info.current.title}\"</div>"
  html += "<div class=\"infolabel\">#{company}</div>"
  if not isLive
    html += "<div class=\"infotags\">&nbsp;#{tagsString}&nbsp;</div>"
    if info.next?
      html += "<span class=\"infoheading nextvideo\">Next:</span> "
      html += "<span class=\"infoartist nextvideo\">#{info.next.artist}</span>"
      html += "<span class=\"nextvideo\"> - </span>"
      html += "<span class=\"infotitle nextvideo\">\"#{info.next.title}\"</span>"
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

onAdd = ->
  if not soloInfo?.current?
    return

  vid = soloInfo.current
  filterString = String(document.getElementById('filters').value).trim()
  if filterString.length > 0
    filterString += "\n"
  filterString += "id #{vid.id} # #{vid.artist} - #{vid.title}\n"
  document.getElementById("filters").value = filterString
  formChanged()

  html = "<a class=\"cbutto copied\" onclick=\"return false\">Added!</a>"
  document.getElementById('add').innerHTML = html
  setTimeout ->
    renderAdd()
  , 2000

renderAdd = ->
  if not soloInfo? or not soloInfo.current? or not addEnabled
    return

  html = "<a class=\"cbutto\" onclick=\"onAdd(); return false\">Add</a>"
  document.getElementById('add').innerHTML = html

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

sharePerma = (mirror) ->
  document.getElementById('list').innerHTML = """
    <div class=\"sharecopied\">Copied to clipboard:</div>
    <div class=\"shareurl\">#{calcPerma()}</div>
  """

showList = ->
  document.getElementById('list').innerHTML = "Please wait..."

  filterString = document.getElementById('filters').value
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

showExport = ->
  document.getElementById('list').innerHTML = "Please wait..."

  filterString = document.getElementById('filters').value
  list = await filters.generateList(filterString, true)
  if not list?
    document.getElementById('list').innerHTML = "Error. Sorry."
    return

  exportedPlaylists = ""
  ids = []
  playlistIndex = 1
  for e in list
    if ids.length >= 50
      exportedPlaylists += """
        <a target="_blank" href="https://www.youtube.com/watch_videos?video_ids=#{ids.join(',')}">Exported Playlist #{playlistIndex} (#{ids.length})</a><br>
      """
      playlistIndex += 1
      ids = []
    ids.push e.id
  if ids.length > 0
    exportedPlaylists += """
      <a target="_blank" href="https://www.youtube.com/watch_videos?video_ids=#{ids.join(',')}">Exported Playlist #{playlistIndex} (#{ids.length})</a><br>
    """

  document.getElementById('list').innerHTML = """
    <div class=\"listcontainer\">
      #{exportedPlaylists}
    </div>
  """

clearOpinion = ->
  document.getElementById('opinions').innerHTML = ""

updateOpinion = (pkt) ->
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
  if not discordToken? or not lastPlayedID?
    return

  socket.emit 'opinion', { token: discordToken, id: lastPlayedID, set: opinion }

pauseInternal = ->
  if player?
    player.togglePause()

soloCommand = (pkt) ->
  if pkt.id != soloID
    return
  console.log "soloCommand: ", pkt
  switch pkt.cmd
    when 'prev'
      soloPlay(-1)
    when 'skip'
      soloPlay(1)
    when 'restart'
      soloPlay(0)
    when 'pause'
      pauseInternal()
    when 'info'
      if pkt.info?
        console.log "NEW INFO!: ", pkt.info
        soloInfo = pkt.info
        await renderInfo(soloInfo, false)
        renderAdd()
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

loadPlaylist = ->
  combo = document.getElementById("loadname")
  selected = combo.options[combo.selectedIndex]
  selectedName = selected.value
  currentFilters = document.getElementById("filters").value
  if not selectedName?
    return
  selectedName = selectedName.trim()
  if selectedName.length < 1
    return
  if currentFilters.length > 0
    if not confirm("Are you sure you want to load '#{selectedName}'?")
      return
  discordToken = localStorage.getItem('token')
  playlistPayload = {
    token: discordToken
    action: "load"
    loadname: selectedName
  }
  currentPlaylistName = selectedName
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
  currentPlaylistName = outputName
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

goLive = ->
  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  params.delete("solo")
  params.delete("filters")
  params.delete("savename")
  params.delete("loadname")
  sprinkleFormQS(params)
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  mtvURL = baseURL + "?" + querystring
  console.log "goLive: #{mtvURL}"
  window.location = mtvURL

goSolo = ->
  form = document.getElementById('asform')
  formData = new FormData(form)
  params = new URLSearchParams(formData)
  params.set("solo", "new")
  sprinkleFormQS(params)
  querystring = params.toString()
  baseURL = window.location.href.split('#')[0].split('?')[0] # oof hacky
  mtvURL = baseURL + "?" + querystring
  console.log "goSolo: #{mtvURL}"
  window.location = mtvURL

window.onload = ->
  window.clipboardEdit = clipboardEdit
  window.clipboardMirror = clipboardMirror
  window.deletePlaylist = deletePlaylist
  window.formChanged = formChanged
  window.goLive = goLive
  window.goSolo = goSolo
  window.loadPlaylist = loadPlaylist
  window.logout = logout
  window.onAdd = onAdd
  window.onTapShow = onTapShow
  window.savePlaylist = savePlaylist
  window.setOpinion = setOpinion
  window.shareClipboard = shareClipboard
  window.sharePerma = sharePerma
  window.showExport = showExport
  window.showList = showList
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.showWatchLive = showWatchLive
  window.soloPause = soloPause
  window.soloPrev = soloPrev
  window.soloRestart = soloRestart
  window.soloSkip = soloSkip
  window.startCast = startCast
  window.startHere = startHere

  autostart = qs('start')?

  # addEnabled = qs('add')?
  # console.log "Add Enabled: #{addEnabled}"

  userAgent = navigator.userAgent
  if userAgent? and String(userAgent).match(/Tesla\/20/)
    isTesla = true

  if isTesla
    document.getElementById('outer').classList.add('tesla')

  currentPlaylistName = qs('name')
  if currentPlaylistName?
    document.getElementById("savename").value = currentPlaylistName

  exportEnabled = qs('export')?
  console.log "Export Enabled: #{exportEnabled}"
  if exportEnabled
    document.getElementById('export').innerHTML = """
      <input class="fsub" type="submit" value="Export" onclick="event.preventDefault(); showExport();" title="Export lists into clickable playlists">
    """

  soloIDQS = qs('solo')
  if soloIDQS?
    # initialize solo mode
    updateSoloID(soloIDQS)

    if launchOpen
      showWatchForm()
    else
      showWatchLink()
  else
    # live mode
    showWatchLive()

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

  socket.on 'play', (pkt) ->
    if player? and not soloID?
      play(pkt, pkt.id, pkt.start, pkt.end)
      clearOpinion()
      if discordToken? and pkt.id?
        socket.emit 'opinion', { token: discordToken, id: pkt.id }
      renderInfo({
        current: pkt
      }, true)

  prepareCast()

  if autostart
    console.log "AUTO START"
    document.getElementById('info').innerHTML = "AUTO START"
    startHere()

  new Clipboard '.share', {
    text: (trigger) ->
      if trigger.value.match(/Perma/i)
        return calcPerma()
      mirror = false
      if trigger.value.match(/Mirror/i)
        mirror = true
      return calcShareURL(mirror)
  }
