filterDatabase = null
filterOpinions = {}

filterServerOpinions = null
filterGetUserFromNickname = null
iso8601 = require 'iso8601-duration'

now = ->
  return Math.floor(Date.now() / 1000)

parseDuration = (s) ->
  return iso8601.toSeconds(iso8601.parse(s))

setServerDatabases = (db, opinions, getUserFromNickname) ->
  filterDatabase = db
  filterServerOpinions = opinions
  filterGetUserFromNickname = getUserFromNickname

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

cacheOpinions = (filterUser) ->
  if not filterOpinions[filterUser]?
    filterOpinions[filterUser] = await getData("/info/opinions?user=#{encodeURIComponent(filterUser)}")
    if not filterOpinions[filterUser]?
      soloFatalError("Cannot get user opinions for #{filterUser}")

generateList = (filterString, sortByArtist = false) ->
  soloFilters = null
  if filterString? and (filterString.length > 0)
    soloFilters = []
    rawFilters = filterString.split(/\r?\n/)
    for filter in rawFilters
      filter = filter.trim()
      if filter.length > 0
        soloFilters.push filter
    if soloFilters.length == 0
      # No filters
      soloFilters = null
  console.log "Filters:", soloFilters
  if filterDatabase?
    console.log "Using cached database."
  else
    console.log "Downloading database..."
    filterDatabase = await getData("/info/playlist")
    if not filterDatabase?
      return null

  soloUnshuffled = []
  if soloFilters?
    for id, e of filterDatabase
      e.allowed = false
      e.skipped = false

    allAllowed = true
    for filter in soloFilters
      pieces = filter.split(/ +/)

      property = "allowed"
      if pieces[0] == "skip"
        property = "skipped"
        pieces.shift()
      if pieces.length == 0
        continue
      if property == "allowed"
        allAllowed = false

      substring = pieces.slice(1).join(" ")

      negated = false
      if matches = pieces[0].match(/^!(.+)$/)
        negated = true
        pieces[0] = matches[1]

      command = pieces[0].toLowerCase()
      switch command
        when 'artist', 'band'
          substring = substring.toLowerCase()
          filterFunc = (e, s) -> e.artist.toLowerCase().indexOf(s) != -1
        when 'title', 'song'
          substring = substring.toLowerCase()
          filterFunc = (e, s) -> e.title.toLowerCase().indexOf(s) != -1
        when 'added'
          filterFunc = (e, s) -> e.nickname == s
        when 'untagged'
          filterFunc = (e, s) -> Object.keys(e.tags).length == 0
        when 'tag'
          substring = substring.toLowerCase()
          filterFunc = (e, s) -> e.tags[s] == true
        when 'recent', 'since'
          console.log "parsing '#{substring}'"
          try
            durationInSeconds = parseDuration(substring)
          catch someException
            # soloFatalError("Cannot parse duration: #{substring}")
            console.log "Duration parsing exception: #{someException}"
            return null

          console.log "Duration [#{substring}] - #{durationInSeconds}"
          since = now() - durationInSeconds
          filterFunc = (e, s) -> e.added > since
        when 'love', 'like', 'bleh', 'hate'
          filterOpinion = command
          filterUser = substring
          if filterServerOpinions
            filterUser = filterGetUserFromNickname(filterUser)
            filterFunc = (e, s) -> filterServerOpinions[e.id]?[filterUser] == filterOpinion
          else
            await cacheOpinions(filterUser)
            filterFunc = (e, s) -> filterOpinions[filterUser]?[e.id] == filterOpinion
        when 'none'
          filterOpinion = undefined
          filterUser = substring
          if filterServerOpinions
            filterUser = filterGetUserFromNickname(filterUser)
            filterFunc = (e, s) -> filterServerOpinions[e.id]?[filterUser] == filterOpinion
          else
            await cacheOpinions(filterUser)
            filterFunc = (e, s) -> filterOpinions[filterUser]?[e.id] == filterOpinion
        when 'full'
          substring = substring.toLowerCase()
          filterFunc = (e, s) ->
            full = e.artist.toLowerCase() + " - " + e.title.toLowerCase()
            full.indexOf(s) != -1
        when 'id', 'ids'
          idLookup = {}
          for id in pieces.slice(1)
            idLookup[id] = true
          filterFunc = (e, s) -> idLookup[e.id]
        else
          # skip this filter
          continue

      for id, e of filterDatabase
        isMatch = filterFunc(e, substring)
        if negated
          isMatch = !isMatch
        if isMatch
          e[property] = true

    for id, e of filterDatabase
      if (e.allowed or allAllowed) and not e.skipped
        soloUnshuffled.push e
  else
    # Queue it all up
    for id, e of filterDatabase
      soloUnshuffled.push e

  if sortByArtist
    soloUnshuffled.sort (a, b) ->
      if a.artist.toLowerCase() < b.artist.toLowerCase()
        return -1
      if a.artist.toLowerCase() > b.artist.toLowerCase()
        return 1
      if a.title.toLowerCase() < b.title.toLowerCase()
        return -1
      if a.title.toLowerCase() > b.title.toLowerCase()
        return 1
      return 0
  return soloUnshuffled

module.exports =
  setServerDatabases: setServerDatabases
  generateList: generateList
