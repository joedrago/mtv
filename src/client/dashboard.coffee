socket = null

renderEntries = (entries, isMap) ->
  html = ""

  if isMap
    console.log entries
    m = entries
    entries = []
    for k, v of m
      entries.push v

    # This is the "all" list, sort it
    entries.sort (a, b) ->
      if a.title < b.title
        return -1
      if a.title > b.title
        return 1
      return 0

  for e in entries
    title = e.title
    if not title?
      title = e.id
    params = ""
    if e.start >= 0
      params += if params.length == 0 then "?" else "&"
      params += "start=#{e.start}"
    if e.end >= 0
      params += if params.length == 0 then "?" else "&"
      params += "end=#{e.end}"
    url = "https://youtu.be/#{e.id}#{params}"
    extraInfo = ""
    if e.countPlay?
      extraInfo += ", #{e.countPlay} play#{if e.countPlay == 1 then "" else "s"}"
    if e.countSkip?
      extraInfo += ", #{e.countSkip} skip#{if e.countSkip == 1 then "" else "s"}"
    html += """
      <div> * <a target="_blank" href="#{url}">#{title}</a> <span class="user">(#{e.user}#{extraInfo})</span></div>

    """
  document.getElementById("main").innerHTML = html


showList = (url, isMap = false) ->
  document.getElementById('main').innerHTML = ""
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
      if (@readyState == 4) and (@status == 200)
         # Typical action to be performed when the document is ready:
         try
           entries = JSON.parse(xhttp.responseText)
           renderEntries(entries, isMap)
         catch
           document.getElementById("main").innerHTML = "Error!"
  xhttp.open("GET", url, true)
  xhttp.send()

showHistory = -> showList("/info/history")
showQueue = -> showList("/info/queue")
showPlaylist = -> showList("/info/playlist", true)

class CastPlayer
  constructor: ->
    @remotePlayer = null
    @remotePlayerController = null

  initializeCastPlayer: ->
    options =
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    cast.framework.CastContext.getInstance().setOptions(options)
    @remotePlayer = new cast.framework.RemotePlayer()
    @remotePlayerController = new cast.framework.RemotePlayerController(@remotePlayer)
    @remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, @switchPlayer.bind(this))

  switchPlayer: ->
    sessionState = cast.framework.CastContext.getInstance().getSessionState()
    if sessionState != cast.framework.SessionState.SESSION_STARTED
      console.log "Session ended!"
      return

    console.log "Session starting!"
    socket.emit 'castready', { id: socket.id }

beginCast = (pkt) ->
  console.log "CAST:", pkt

  sessionState = cast.framework.CastContext.getInstance().getSessionState()
  if sessionState != cast.framework.SessionState.SESSION_STARTED
    console.log "No session; skipping beginCast"
    return

  console.log "Starting cast!"
  castSession = cast.framework.CastContext.getInstance().getCurrentSession()
  mediaInfo = new chrome.cast.media.MediaInfo(pkt.url, 'video/mp4')
  request = new chrome.cast.media.LoadRequest(mediaInfo)
  if pkt.start > 0
    request.currentTime = pkt.start
  castSession.loadMedia(request)

init = ->
  window.showHistory = showHistory
  window.showQueue = showQueue
  window.showPlaylist = showPlaylist

  showHistory()

  socket = io()
  socket.on 'cast', (pkt) ->
    beginCast(pkt)

  window.__onGCastApiAvailable = (isAvailable) ->
    console.log "__onGCastApiAvailable fired: #{isAvailable}"
    castPlayer = new CastPlayer
    if isAvailable
      castPlayer.initializeCastPlayer()

  console.log "initialized!"

window.onload = init
