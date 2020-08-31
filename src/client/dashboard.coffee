socket = null

lastClicked = null
lastUser = null

renderEntries = (domID, firstTitle, restTitle, entries, isMap, sortList = false) ->
  html = ""

  if isMap
    # console.log entries
    m = entries
    entries = []
    for k, v of m
      entries.push v

    # This is the "all" list, sort it
    sortList = true

  if sortList
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

    if e.opinions?
      for feeling, count of e.opinions
        extraInfo += ", #{count} #{feeling}#{if count == 1 then "" else "s"}"

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

updateOther = ->
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
      if (@readyState == 4) and (@status == 200)
         # Typical action to be performed when the document is ready:
         try
          other = JSON.parse(xhttp.responseText)
          console.log other
          nameString = ""
          if other.names? and (other.names.length > 0)
            nameString = ""
            for name in other.names
              if nameString.length > 0
                nameString += ", "
              nameString += name
            remainingCount = other.playing - other.names.length
            if remainingCount > 0
              nameString += " + #{remainingCount} anon"
            nameString = ": #{nameString}"

          document.getElementById("playing").innerHTML = "(#{other.playing} Watching#{nameString})"
         catch
           # nothing?
  xhttp.open("GET", "/info/other", true)
  xhttp.send()

showHistory = ->
  showList('main', "Now Playing:", "History:", "/info/history")
  updateOther()
  lastClicked = showHistory

showQueue = ->
  showList('main', "Up Next:", "Queue:", "/info/queue")
  updateOther()
  lastClicked = showQueue

showBoth = ->
  document.getElementById('main').innerHTML = """
    <div id="mainl"></div>
    <div id="mainr"></div>
  """
  showList('mainl', "Now Playing:", "History:", "/info/history")
  showList('mainr', "Up Next:", "Queue:", "/info/queue")
  updateOther()
  lastClicked = showBoth

showPlaylist = ->
  showList('main', null, null, "/info/playlist", true)
  updateOther()
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

          totalDuration = 0

          userCounts = {}
          for e in entries
            userCounts[e.user] ?= 0
            userCounts[e.user] += 1
            startTime = e.start
            if startTime < 0
              startTime = 0
            endTime = e.end
            if endTime < 0
              endTime = e.duration
            duration = endTime - startTime
            totalDuration += duration

          userList = Object.keys(userCounts)
          userList.sort (a, b) ->
            if userCounts[a] < userCounts[b]
              return 1
            if userCounts[a] > userCounts[b]
              return -1
            return 0

          totalDurationString = ""
          timeUnits = [
            { name: 'day', factor: 3600 * 24 }
            { name: 'hour', factor: 3600 }
            { name: 'min', factor: 60 }
            { name: 'second', factor: 1 }
          ]
          for unit in timeUnits
            if totalDuration >= unit.factor
              amt = Math.floor(totalDuration / unit.factor)
              totalDuration -= amt * unit.factor
              if totalDurationString.length != 0
                totalDurationString += ", "
              totalDurationString += "#{amt} #{unit.name}#{if amt == 1 then "" else "s"}"

          html += """
            <div class="statsheader">Basic Stats:</div>
            <div>Total Songs: #{entries.length}</div>
            <div>Total Duration: #{totalDurationString}</div>

            <div>&nbsp;</div>
            <div class="statsheader">Songs by User:</div>
          """
          for user in userList
            html += """
              <div> * <a href="#user/#{encodeURIComponent(user)}">#{user}</a>: #{userCounts[user]}</div>
            """

          # html = "<pre>" + JSON.stringify(userCounts, null, 2) + "</pre>"

       catch
         html = "Error!"
    document.getElementById("main").innerHTML = html
  xhttp.open("GET", "/info/playlist", true)
  xhttp.send()

  updateOther()
  lastClicked = showStats

showUser = ->
  html = ""
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
    if (@readyState == 4) and (@status == 200)
       # Typical action to be performed when the document is ready:
       try
          entries = JSON.parse(xhttp.responseText)

          html = ""

          sortedFeelings = Object.keys(entries.opinions).sort()
          for feeling in sortedFeelings
            html += """
              <div class="restTitle">#{feeling.charAt(0).toUpperCase() + feeling.slice(1)}:</div>
              <div id="user#{feeling}"></div>
            """

          if entries.added.length > 0
            html += """
              <div class="restTitle">Added:</div>
              <div id="useradded"></div>
            """

          if html.length == 0
            html += """
              <div class="restTitle">(No info on this user)</div>
            """

          html = """
            <div class="statsheader">User: #{lastUser}</div>
          """ + html

          document.getElementById("main").innerHTML = html

          setTimeout ->
            for feeling, list of entries.opinions
              renderEntries("user#{feeling}", null, null, entries.opinions[feeling], false, true)
            if entries.added.length > 0
              renderEntries("useradded", null, null, entries.added, false, true)
          , 0
       catch
         html = "Error!"
  xhttp.open("GET", "/info/user?user=#{encodeURIComponent(lastUser)}", true)
  xhttp.send()

  updateOther()
  lastClicked = showUser

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

showWatchForm = ->
  document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'inline-block'
  document.getElementById("userinput").focus()

showWatchLink = ->
  document.getElementById('aslink').style.display = 'inline-block'
  document.getElementById('asform').style.display = 'none'

processHash = ->
  currentHash = window.location.hash
  if matches = currentHash.match(/^#user\/(.+)/)
    lastUser = decodeURIComponent(matches[1])
    showUser()
    return
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
  window.showUser = showUser
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.onhashchange = processHash

  processHash()

  socket = io()
  socket.on 'cast', (pkt) ->
    beginCast(pkt)

  socket.on 'play', (pkt) ->
    if lastClicked?
      lastClicked()

  socket.on 'refresh', (pkt) ->
    if lastClicked?
      lastClicked()

  window.__onGCastApiAvailable = (isAvailable) ->
    console.log "__onGCastApiAvailable fired: #{isAvailable}"
    castPlayer = new CastPlayer
    if isAvailable
      castPlayer.initializeCastPlayer()

  console.log "initialized!"

window.onload = init
