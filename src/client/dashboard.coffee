constants = require '../constants'
filters = require '../filters'

socket = null

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast'

lastClicked = null
lastUser = null
lastTag = null
discordTag = null
discordNickname = null
discordToken = null
lastPlayed = null

searchEnabled = false
searchSubstring = ""

downloadCache = {}
cacheEnabled = {
  "/info/playlist": true
}

castAvailable = false
castSession = null

rawMode = false
rawModeTag = ""

opinionOrder = constants.opinionOrder
opinionButtonOrder = []
for o in constants.opinionOrder
  opinionButtonOrder.push o
opinionButtonOrder.push('none')

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

SORT_NONE = 0
SORT_ARTIST_TITLE = 1
SORT_ADDED = 2

renderEntries = (firstTitle, restTitle, entries, isMap, sortMethod = SORT_NONE, tagFilter = null) ->
  html = ""

  if isMap
    # console.log entries
    m = entries
    entries = []
    for k, v of m
      entries.push v

  switch sortMethod
    when SORT_ARTIST_TITLE
      entries.sort (a, b) ->
        if a.artist.toLowerCase() < b.artist.toLowerCase()
          return -1
        if a.artist.toLowerCase() > b.artist.toLowerCase()
          return 1
        if a.title.toLowerCase() < b.title.toLowerCase()
          return -1
        if a.title.toLowerCase() > b.title.toLowerCase()
          return 1
        return 0
    when SORT_ADDED
      entries.sort (a, b) ->
        if a.added > b.added
          return -1
        if a.added < b.added
          return 1
        if a.artist.toLowerCase() < b.artist.toLowerCase()
          return -1
        if a.artist.toLowerCase() > b.artist.toLowerCase()
          return 1
        if a.title.toLowerCase() < b.title.toLowerCase()
          return -1
        if a.title.toLowerCase() > b.title.toLowerCase()
          return 1
        return 0

  if not firstTitle? and not restTitle? and tagFilter?
    html += """
      <div class="restTitle">Tag: #{tagFilter}</div>
    """

  lowercaseSearch = searchSubstring.toLowerCase()

  for e, entryIndex in entries
    if tagFilter? and not e.tags[tagFilter]?
      continue

    artist = e.artist
    if not artist?
      artist = "Unknown"
    title = e.title
    if not title?
      title = e.id

    if searchEnabled and (lowercaseSearch.length > 0)
      if (artist.toLowerCase().indexOf(lowercaseSearch) == -1) and (title.toLowerCase().indexOf(lowercaseSearch) == -1)
        continue

    params = ""
    if e.start >= 0
      params += if params.length == 0 then "?" else "&"
      params += "start=#{e.start}"
    if e.end >= 0
      params += if params.length == 0 then "?" else "&"
      params += "end=#{e.end}"

    idInfo = filters.calcIdInfo(e.id)
    if not idInfo?
      continue
    url = idInfo.url + params

    extraInfo = ""
    tags = []
    for tag of e.tags
      extraInfo += ", #{tag}"
      tags.push tag
    if tags.length > 0
      tagString = " - <span class=\"rawtags\">" + tags.join("</span>, <span class=\"rawtags\">") + "</span>"
    else
      tagString = ""
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

    if discordTag
      actions = "" # " [ Do stuff as #{discordTag} ]"
    else
      actions = ""

    switch rawMode
      when "edit"
        html += """
          <div><span class=\"selectall\">#mtv edit #{e.id} COMMANDHERE</span> # <a target="_blank" href="#{url}"><span class="entryartist">#{artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="#{url}"><span class="entrytitle">#{title}</span></a>#{tagString}</div>
        """
      when "solo"
        html += """
          <div>id #{e.id} # <a target="_blank" href="#{url}">#{artist} - #{title}</a></div>
        """
      when "tag"
        html += """
          <div><span class=\"selectall\">#mtv edit #{e.id} tag #{rawModeTag}</span> | <a target="_blank" href="#{url}"><span class="entryartist">#{artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="#{url}"><span class="entrytitle">#{title}</span></a>#{tagString}</div>
        """
      else
        html += """
          <div> * <a target="_blank" href="#{url}"><span class="entryartist">#{artist}</span></a><span class="entrymiddle"> - </span><a target="_blank" href="#{url}"><span class="entrytitle">#{title}</span></a> <span class="user">(#{e.nickname}#{extraInfo})</span>#{actions}</div>

        """
  return html


showList = (firstTitle, restTitle, url, isMap = false, sortMethod = SORT_NONE, tagFilter = null) ->
  return new Promise (resolve, reject) ->
    if downloadCache[url]?
      console.log "Using cache: #{url}"
      resolve(renderEntries(firstTitle, restTitle, downloadCache[url], isMap, sortMethod, tagFilter))
      return
    console.log "Downloading: #{url}"
    xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = ->
        if (@readyState == 4) and (@status == 200)
           # Typical action to be performed when the document is ready:
           try
             entries = JSON.parse(xhttp.responseText)
             if cacheEnabled[url]
               downloadCache[url] = entries
             resolve(renderEntries(firstTitle, restTitle, entries, isMap, sortMethod, tagFilter))
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

          document.getElementById("playing").innerHTML = "#{other.playing} Watching#{nameString}"
          lastPlayed = other.current
          if discordToken?
            socket.emit 'opinion', { token: discordToken, id: lastPlayed.id }
        catch
          # nothing?
  xhttp.open("GET", "/info/other", true)
  xhttp.send()

showPlaying = ->
  enableSearch(false)
  document.getElementById('main').innerHTML = await showList("Now Playing:", "History:", "/info/history")
  updateOther()
  lastClicked = showPlaying

showQueue = ->
  enableSearch(false)
  document.getElementById('main').innerHTML = await showList("Up Next:", "Queue:", "/info/queue")
  updateOther()
  lastClicked = showQueue

showBoth = ->
  enableSearch(false)
  leftSide = await showList("Now Playing:", "History:", "/info/history")
  rightSide = await showList("Up Next:", "Queue:", "/info/queue")
  document.getElementById('main').innerHTML = """
    <div id="mainl">#{leftSide}</div>
    <div id="mainr">#{rightSide}</div>
  """
  updateOther()
  lastClicked = showBoth

enableSearch = (enabled) ->
  searchEnabled = enabled
  if enabled
    document.getElementById('search').style.display = 'block'
    searchSubstring = document.getElementById('searchinput').value
  else
    document.getElementById('search').style.display = 'none'
    searchSubstring = ""


searchChanged = ->
  if not searchEnabled
    return
  if not downloadCache["/info/playlist"]?
    return
  searchSubstring = document.getElementById('searchinput').value
  document.getElementById('main').innerHTML = await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE)

showPlaylist = ->
  enableSearch(true)
  downloadCache["/info/playlist"] = null # don't cache if they click on All
  document.getElementById('main').innerHTML = await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE)
  updateOther()
  lastClicked = showPlaylist

showRecent = ->
  enableSearch(false)
  document.getElementById('main').innerHTML = await showList(null, null, "/info/playlist", true, SORT_ADDED)
  updateOther()
  lastClicked = showRecent

showTag = ->
  enableSearch(false)
  document.getElementById('main').innerHTML = await showList(null, null, "/info/playlist", true, SORT_ARTIST_TITLE, lastTag)
  updateOther()
  lastClicked = showTag

showLists = ->
  html = ""
  xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = ->
    if (@readyState == 4) and (@status == 200)
       # Typical action to be performed when the document is ready:
       try
          entries = JSON.parse(xhttp.responseText)
          entries.sort (a, b) ->
            if a.nickname < b.nickname
              return -1
            if a.nickname > b.nickname
              return 1
            if a.name.toLowerCase() < b.name.toLowerCase()
              return -1
            if a.name.toLowerCase() > b.name.toLowerCase()
              return 1
            return 0

          html += """
            <div>&nbsp;</div>
            <div class="statsheader">Public User Playlists:</div>
          """

          lastNickname = null
          for e in entries
            if lastNickname? and (lastNickname != e.nickname)
              html += """
                <div>&nbsp;</div>
              """
            html += """
              <div> * <a href="/p/#{encodeURIComponent(e.nickname)}/#{encodeURIComponent(e.name)}"><span class="entryartist">#{e.nickname}</span></a><span class="entrymiddle"> - </span><a href="/p/#{encodeURIComponent(e.nickname)}/#{encodeURIComponent(e.name)}"><span class="entrytitle">#{e.name}</span></a></div>
            """
            lastNickname = e.nickname

       catch
         html = "Error!"
    document.getElementById("main").innerHTML = html
  xhttp.open("GET", "/info/userplaylists", true)
  xhttp.send()

  updateOther()
  lastClicked = showLists

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
          tagCounts = {}
          for e in entries
            userCounts[e.nickname] ?= 0
            userCounts[e.nickname] += 1
            startTime = e.start
            if startTime < 0
              startTime = 0
            endTime = e.end
            if endTime < 0
              endTime = e.duration
            duration = endTime - startTime
            totalDuration += duration

            for tagName of e.tags
              tagCounts[tagName] ?= 0
              tagCounts[tagName] += 1

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

          html += """
            <div>&nbsp;</div>
            <div class="statsheader">Songs by Tag:</div>
          """
          tagNames = Object.keys(tagCounts).sort()
          for tagName in tagNames
            html += """
              <div> * <a href="#tag/#{encodeURIComponent(tagName)}">#{tagName}</a>: #{tagCounts[tagName]}</div>
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
  document.getElementById('search').style.display = 'none'
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
          document.getElementById("user#{feeling}").innerHTML = renderEntries(null, null, userInfo.opinions[feeling], false, SORT_ARTIST_TITLE)
        if userInfo.added.length > 0
          document.getElementById("useradded").innerHTML = renderEntries(null, null, userInfo.added, false, SORT_ARTIST_TITLE)
      , 0

  xhttp.open("GET", "/info/user?user=#{encodeURIComponent(lastUser)}", true)
  xhttp.send()

  updateOther()
  lastClicked = showUser

updateOpinion = (pkt) ->
  if not discordTag? or not lastPlayed?
    document.getElementById('remote').innerHTML = ""
    return

  html = """
    <div class="opinionname">
  """
  for o in opinionButtonOrder by -1
    capo = o.charAt(0).toUpperCase() + o.slice(1)
    classes = "obutto"
    if o == pkt.opinion
      classes += " chosen"
    html += """
      <a class="#{classes}" onclick="setOpinion('#{o}'); return false;">#{capo}</a>
    """
  html += " - <span class=\"entryartist\">#{lastPlayed.artist}</span> - <span class=\"entrytitle\">#{lastPlayed.title}</span></div>"
  document.getElementById('opinions').innerHTML = html

setOpinion = (opinion) ->
  if not discordToken? or not lastPlayed? or not lastPlayed.id?
    return

  socket.emit 'opinion', { token: discordToken, id: lastPlayed.id, set: opinion, src: "dashboard" }

showWatchForm = ->
  # document.getElementById('aslink').style.display = 'none'
  document.getElementById('asform').style.display = 'block'
  document.getElementById('castbutton').style.display = 'inline-block'
  document.getElementById("userinput").focus()

showWatchLink = ->
  # document.getElementById('aslink').style.display = 'inline-block'
  document.getElementById('asform').style.display = 'none'

processHash = ->
  currentHash = window.location.hash
  if matches = currentHash.match(/^#user\/(.+)/)
    lastUser = decodeURIComponent(matches[1])
    showUser()
    return
  if matches = currentHash.match(/^#tag\/(.+)/)
    lastTag = decodeURIComponent(matches[1])
    showTag()
    return
  switch currentHash
    when '#queue'
      showQueue()
    when '#all'
      showPlaylist()
    when '#recent'
      showRecent()
    when '#both'
      showBoth()
    when '#lists'
      showLists()
    when '#stats'
      showStats()
    else
      showPlaying()

logout = ->
  document.getElementById("identity").innerHTML = "Logging out..."
  localStorage.removeItem('token')
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
      [<a href="#{loginLink}">Login</a>]
    """
  document.getElementById("identity").innerHTML = html
#  if lastClicked?
#    lastClicked()

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
  mtvURL = baseURL + "watch?" + querystring
  console.log "We're going here: #{mtvURL}"
  chrome.cast.requestSession (e) ->
    castSession = e
    castSession.sendMessage(DASHCAST_NAMESPACE, { url: mtvURL, force: true })
  , onError

init = ->
  window.logout = logout
  window.onhashchange = processHash
  window.showBoth = showBoth
  window.showPlaying = showPlaying
  window.showPlaylist = showPlaylist
  window.showQueue = showQueue
  window.showLists = showLists
  window.showStats = showStats
  window.showUser = showUser
  window.showWatchForm = showWatchForm
  window.showWatchLink = showWatchLink
  window.startCast = startCast
  window.setOpinion = setOpinion
  window.searchChanged = searchChanged

  rawMode = qs('raw')
  if rawMode?
    if matches = rawMode.match(/^tag_(.+)/)
      rawMode = "tag"
      rawModeTag = matches[1]

  token = qs('token')
  if token?
    localStorage.setItem('token', token)
    window.location = '/'
    return

  processHash()

  socket = io()

  socket.on 'connect', ->
    # switch which line is commented here to allow identity on the dash
    sendIdentity()
    # document.getElementById("identity").innerHTML = ""

  socket.on 'play', (pkt) ->
    if lastClicked?
      lastClicked()

  socket.on 'refresh', (pkt) ->
    if lastClicked?
      lastClicked()

  socket.on 'identify', (pkt) ->
    receiveIdentity(pkt)

  socket.on 'opinion', (pkt) ->
    updateOpinion(pkt)

  prepareCast()

window.onload = init
