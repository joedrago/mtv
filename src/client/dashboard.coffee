socket = null

lastClicked = null

renderEntries = (domID, firstTitle, restTitle, entries, isMap) ->
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

  for e, entryIndex in entries
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

    if firstTitle?
      if (entryIndex == 0)
        html += """
          <div class="firstTitle">#{firstTitle}</div>
          <div class="previewContainer"><img class="preview" src="#{e.thumb}"></div>
        """
      else if (entryIndex == 1)
        html += """
          <div class="restTitle">#{restTitle}</div>
        """
    html += """
      <div> * <a target="_blank" href="#{url}">#{title}</a> <span class="user">(#{e.user}#{extraInfo})</span></div>

    """
  document.getElementById(domID).innerHTML = html


showList = (domID, firstTitle, restTitle, url, isMap = false) ->
  # document.getElementById('main').innerHTML = ""
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
      if (@readyState == 4) and (@status == 200)
         # Typical action to be performed when the document is ready:
         try
           entries = JSON.parse(xhttp.responseText)
           renderEntries(domID, firstTitle, restTitle, entries, isMap)
         catch
           document.getElementById("main").innerHTML = "Error!"
  xhttp.open("GET", url, true)
  xhttp.send()

showHistory = ->
  showList('main', "Now Playing:", "History:", "/info/history")
  lastClicked = showHistory

showQueue = ->
  showList('main', "Up Next:", "Queue:", "/info/queue")
  lastClicked = showQueue

showBoth = ->
  document.getElementById('main').innerHTML = """
    <div id="mainl"></div>
    <div id="mainr"></div>
  """
  showList('mainl', "Now Playing:", "History:", "/info/history")
  showList('mainr', "Up Next:", "Queue:", "/info/queue")
  lastClicked = showBoth

showPlaylist = ->
  showList('main', null, null, "/info/playlist", true)
  lastClicked = showPlaylist

showStats = ->
  html = ""
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
    if (@readyState == 4) and (@status == 200)
       # Typical action to be performed when the document is ready:
       try
          entries = JSON.parse(xhttp.responseText)
          m = entries
          entries = []
          for k, v of m
            entries.push v

          userCounts = {}
          for e in entries
            userCounts[e.user] ?= 0
            userCounts[e.user] += 1

          userList = Object.keys(userCounts)
          userList.sort (a, b) ->
            if userCounts[a] < userCounts[b]
              return 1
            if userCounts[a] > userCounts[b]
              return -1
            return 0

          html += """
            <div class="statsheader">Songs by User:</div>
          """
          for user in userList
            html += """
              <div> * #{user}: #{userCounts[user]}</div>
            """

          # html = "<pre>" + JSON.stringify(userCounts, null, 2) + "</pre>"

       catch
         html = "Error!"
    document.getElementById("main").innerHTML = html
  xhttp.open("GET", "/info/playlist", true)
  xhttp.send()

  lastClicked = showStats

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

processHash = ->
  currentHash = window.location.hash
  switch currentHash
    when '#queue'
      showQueue()
    when '#all'
      showPlaylist()
    when '#both'
      showBoth()
    when '#stats'
      showStats()
    else
      showHistory()

init = ->
  window.showHistory = showHistory
  window.showQueue = showQueue
  window.showPlaylist = showPlaylist
  window.showBoth = showBoth
  window.showStats = showStats
  window.onhashchange = processHash

  processHash()

  socket = io()
  socket.on 'cast', (pkt) ->
    beginCast(pkt)

  socket.on 'play', (pkt) ->
    if lastClicked?
      lastClicked()

  window.__onGCastApiAvailable = (isAvailable) ->
    console.log "__onGCastApiAvailable fired: #{isAvailable}"
    castPlayer = new CastPlayer
    if isAvailable
      castPlayer.initializeCastPlayer()

  console.log "initialized!"

window.onload = init
