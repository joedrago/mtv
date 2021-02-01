socket = null

lastClicked = null
lastUser = null

opinionOrder = ['like', 'meh', 'bleh', 'hate'] # always in this specific order

secondsToTime = (t) ->
  units = [
    { suffix: "h", factor: 3600, skip: true }
    { suffix: "m", factor: 60, skip: false }
    { suffix: "s", factor: 1, skip: false }
  ]

  str = ""
  for unit in units
    u = Math.floor(t / unit.factor)
    if (u > 0) or not unit.skip
      t -= u * unit.factor
      if str.length > 0
        str += ":"
        if u < 10
          str += "0"
      str += String(u)
  return str

prettyDuration = (e) ->
  startTime = e.start
  if startTime < 0
    startTime = 0
  endTime = e.end
  if endTime < 0
    endTime = e.duration
  return "#{secondsToTime(startTime)}-#{secondsToTime(endTime)}"

renderEntries = (firstTitle, restTitle, entries, isMap, sortList = false, showPlayCounts = false) ->
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
      if a.title.toLowerCase() < b.title.toLowerCase()
        return -1
      if a.title.toLowerCase() > b.title.toLowerCase()
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
    if (e.start != -1) or  (e.end != -1)
      extraInfo += ", #{prettyDuration(e)}"
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
  return html


showList = (firstTitle, restTitle, url, isMap = false) ->
  return new Promise (resolve, reject) ->
    xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = ->
        if (@readyState == 4) and (@status == 200)
           # Typical action to be performed when the document is ready:
           try
             entries = JSON.parse(xhttp.responseText)
             resolve(renderEntries(firstTitle, restTitle, entries, isMap))
           catch
             resolve("Error")
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

showPlaying = ->
  document.getElementById('main').innerHTML = await showList("Now Playing:", "History:", "/info/history")
  updateOther()
  lastClicked = showPlaying

showQueue = ->
  document.getElementById('main').innerHTML = await showList("Up Next:", "Queue:", "/info/queue")
  updateOther()
  lastClicked = showQueue

showBoth = ->
  leftSide = await showList("Now Playing:", "History:", "/info/history")
  rightSide = await showList("Up Next:", "Queue:", "/info/queue")
  document.getElementById('main').innerHTML = """
    <div id="mainl">#{leftSide}</div>
    <div id="mainr">#{rightSide}</div>
  """
  updateOther()
  lastClicked = showBoth

showPlaylist = ->
  document.getElementById('main').innerHTML = await showList(null, null, "/info/playlist", true)
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
        userInfo = JSON.parse(xhttp.responseText)
      catch
        document.getElementById("main").innerHTML = "Error!"
        return

      html = """
        <div class="statsheader">User: #{lastUser}</div>
      """

      listHTML = ""

      sortedFeelings = []
      for feeling in opinionOrder
        if userInfo.opinions[feeling]?
          sortedFeelings.push feeling

      for feeling in sortedFeelings
        listHTML += """
          <div class="restTitle">#{feeling.charAt(0).toUpperCase() + feeling.slice(1)}:</div>
          <div id="user#{feeling}"></div>
        """

      if userInfo.added.length > 0
        listHTML += """
          <div class="restTitle">Added:</div>
          <div id="useradded"></div>
        """

      if listHTML.length == 0
        listHTML += """
          <div class="restTitle">(No info on this user)</div>
        """
      else
        hasIncomingOpinions = Object.keys(userInfo.otherTotals.incoming).length > 0
        hasOutgoingOpinions = Object.keys(userInfo.otherTotals.outgoing).length > 0

        if hasIncomingOpinions or hasOutgoingOpinions
          html += """
            <div class="restTitle">Opinion Stats:</div>
            <ul>
          """

          if hasIncomingOpinions
            html += """
              <li>Incoming Totals:</li><ul>
            """
            for feeling in opinionOrder
              if userInfo.otherTotals.incoming[feeling]?
                html += """
                  <li>#{feeling}: #{userInfo.otherTotals.incoming[feeling]}</li>
                """
            html += """
              </ul>
            """

            html += """
              <li>Incoming by user:</li><ul>
            """
            for name, incoming of userInfo.otherOpinions.incoming
              html += """
                <li><a href="#user/#{encodeURIComponent(name)}">#{name}</a></li><ul>
              """
              for feeling in opinionOrder
                if incoming[feeling]?
                  html += """
                    <li>#{feeling}: #{incoming[feeling]}</li>
                  """
              html += """
                </ul>
              """
            html += """
              </ul>
            """

          if hasOutgoingOpinions
            html += """
              <li>Outgoing:</li>
              <ul>
            """
            for feeling in opinionOrder
              if userInfo.otherTotals.outgoing[feeling]?
                html += """
                  <li>#{feeling}: #{userInfo.otherTotals.outgoing[feeling]}</li>
                """
            html += """
              </ul>
            """

            html += """
              <li>Outgoing by user:</li><ul>
            """
            for name, outgoing of userInfo.otherOpinions.outgoing
              html += """
                <li><a href="#user/#{encodeURIComponent(name)}">#{name}</a></li><ul>
              """
              for feeling in opinionOrder
                if outgoing[feeling]?
                  html += """
                    <li>#{feeling}: #{outgoing[feeling]}</li>
                  """
              html += """
                </ul>
              """
            html += """
              </ul>
            """

          html += """
            </ul>
          """


      html += listHTML
      document.getElementById("main").innerHTML = html

      setTimeout ->
        for feeling, list of userInfo.opinions
          document.getElementById("user#{feeling}").innerHTML = renderEntries(null, null, userInfo.opinions[feeling], false, true, true)
        if userInfo.added.length > 0
          document.getElementById("useradded").innerHTML = renderEntries(null, null, userInfo.added, false, true, true)
      , 0

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
      showPlaying()

init = ->
  window.showPlaying = showPlaying
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
