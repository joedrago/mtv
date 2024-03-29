Bottleneck = require 'bottleneck'
express = require 'express'
bodyParser = require 'body-parser'
iso8601 = require 'iso8601-duration'
fs = require 'fs'
https = require 'https'
ytdl = require 'ytdl-core'

winston = require 'winston'
require 'winston-daily-rotate-file'

constants = require '../constants'
filters = require '../filters'
hosting = require './hosting'

MAX_BLOCK_COUNT = 0
YOUTUBE_USER = "YouTube"
AUTOSKIPLIST_COUNT = 3

# ------------------------------------------------------------------------------------------------
# Logging

LOG_LEVELS =
  levels:
    play: 0
    error: 1
    auth: 2
    info: 3
    all: 4
  colors:
    play: 'blue'
    error: 'red'
    auth: 'green'
    info: 'white'
    all: 'white'

logger = winston.createLogger {
  levels: LOG_LEVELS.levels
  transports: [
    new winston.transports.Console {
      level: 'all'
      format: winston.format.json()
    }
    new winston.transports.DailyRotateFile {
      level: 'play',
      format: winston.format.json()
      filename: 'play-%DATE%.log'
      datePattern: 'YYYY-MM'
      zippedArchive: true
    }
  ]
}
winston.addColors(LOG_LEVELS.colors)

# ------------------------------------------------------------------------------------------------

limiter = new Bottleneck {
  maxConcurrent: 5
}

now = ->
  return Math.floor(Date.now() / 1000)

pad = (s, count) ->
  return ("                   " + s).slice(-1 * count)

randomString = ->
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

randomShortString = ->
  return Math.random().toString(36).substring(2, 6).toLowerCase()

# TODO: Switch this sloppy pile of flat maps to a map of objects?
serverEpoch = now()
secrets = null
sockets = {}
playlist = {}
queue = []
history = []
output = []
lastPlayedTimeout = null
lastPlayedTime = now()
lastPlayedDuration = 1
lastPlayed = null
songEndingTimeout = null
nobodyWatchingTimeout = null
isPlaying = {}
playingName = {}
sfwOnly = {}
opinions = {}
dashboardsRefreshNeeded = false
discordEnabled = false
discordIndex = 0
autoskipCount = 0
autoskipTimeout = null
autoskipList = []

userPlaylists = {}

soloSessions = {}
soloInfo = {}

echoNewSong = false
echoEnabled = false

companies = {}
nicknames = {}
ignored = {}
discordAuth = {}

getNickname = (user) ->
  if nicknames[user]?
    return nicknames[user]
  return user

getUserFromNickname = (nickname) ->
  for u, n of nicknames
    if nickname == n
      return u
  return nickname

privacyReplacer = (k, v) ->
  if k == 'user'
    return undefined
  return v

sanitizeTag = (tagName) ->
  tagName = tagName.toLowerCase()
  tagName = tagName.replace(/[^-_a-z0-9]/g, "")
  return tagName

load = ->
  if fs.existsSync("playlist.json")
    loadedList = JSON.parse(fs.readFileSync("playlist.json", 'utf8'))

    playlist = {}
    for id, p of loadedList
      if typeof p == 'boolean'
        p =
          id: id
          user: 'Anonymous'
          start: -1
          end: -1
      playlist[id] = p

  if fs.existsSync("state.json")
    state = JSON.parse(fs.readFileSync("state.json", 'utf8'))
    for id in state.queue
      if playlist[id]?
        queue.push playlist[id]
    for id in state.history
      if playlist[id]?
        history.push playlist[id]
  if fs.existsSync("opinions.json")
    opinions = JSON.parse(fs.readFileSync("opinions.json", 'utf8'))
  if fs.existsSync("companies.json")
    companies = JSON.parse(fs.readFileSync("companies.json", 'utf8'))
  if fs.existsSync("nicknames.json")
    nicknames = JSON.parse(fs.readFileSync("nicknames.json", 'utf8'))
  if fs.existsSync("ignored.json")
    ignored = JSON.parse(fs.readFileSync("ignored.json", 'utf8'))
  if fs.existsSync("auth.json")
    discordAuth = JSON.parse(fs.readFileSync("auth.json", 'utf8'))
  if fs.existsSync("userplaylists.json")
    userPlaylists = JSON.parse(fs.readFileSync("userplaylists.json", 'utf8'))
  return

savePlaylist = ->
  fs.writeFileSync("playlist.json", JSON.stringify(playlist, null, 2))

saveOpinions = ->
  fs.writeFileSync("opinions.json", JSON.stringify(opinions, null, 2))

saveCompanies = ->
  fs.writeFileSync("companies.json", JSON.stringify(companies, null, 2))

saveNicknames = ->
  fs.writeFileSync("nicknames.json", JSON.stringify(nicknames, null, 2))

saveIgnored = ->
  fs.writeFileSync("ignored.json", JSON.stringify(ignored, null, 2))

saveDiscordAuth = ->
  fs.writeFileSync("auth.json", JSON.stringify(discordAuth, null, 2))

saveUserPlaylists = ->
  fs.writeFileSync("userplaylists.json", JSON.stringify(userPlaylists, null, 2))

logOutput = (msg) ->
  output.push msg
  while output.length > 10
    output.shift()
  return

filterObject = (inputObject, propList) ->
  outputObject = {}
  for prop in propList
    outputObject[prop] = inputObject[prop]
  return outputObject

logPlay = (msg) ->
  logUserTag = "Anonymous"
  if msg.token? and discordAuth[msg.token]?
    logUserTag = discordAuth[msg.token].tag
  logger.play 'play', {
    src: msg.cmd
    sid: msg.id
    tag: logUserTag
    t: now()
    video: filterObject(msg.info.current, [
      'added'
      'artist'
      'duration'
      'id'
      'nickname'
      'title'
    ])
  }

refreshDashboards = ->
  for sid, soc of sockets
    soc.emit 'refresh', {}

requestDashboardRefresh = ->
  dashboardsRefreshNeeded = true

refreshDashboardsIfNeeded = ->
  if dashboardsRefreshNeeded
    # console.log "refreshDashboardsIfNeeded(): refreshing..."
    dashboardsRefreshNeeded = false
    refreshDashboards()

soloBroadcast = (sender, msg) ->
  for sid, soc of sockets
    if sid == sender
      continue

    if soloSessions[sid] == msg.id
      soc.emit 'solo', msg
  return

saveState = ->
  savedQueue = []
  for e in queue
    savedQueue.push e.id
  savedHistory = []
  for e in history
    savedHistory.push e.id
  state =
    history: savedHistory
    queue: savedQueue
  fs.writeFileSync("state.json", JSON.stringify(state, null, 2))
  console.log "Saved State: (#{savedQueue.length} in queue, #{savedHistory.length} in history)"

calcOther = ->
  names = []
  count = 0
  for sid, soc of sockets
    if isPlaying[sid]
      count += 1
    if playingName[sid]? and playingName[sid].length > 0
      props = []
      n = getNickname(playingName[sid])
      user = getUserFromNickname(n)
      if nicknames[user]?
        if ignored[getNickname(user)]
          props.push "Ignored"
        else
          props.push "Auto"
      if sfwOnly[sid]
        props.push "SFW"
      if props.length > 0
        n += " (#{props.join(", ")})"
      names.push n
  names.sort()

  other =
    playing: count
    names: names
    solo: Object.keys(soloSessions).length
    current:
      id: lastPlayed.id
      artist: lastPlayed.artist
      title: lastPlayed.title
  return other

logAutoskip = ->
  if autoskipCount > 0
    l = autoskipList.join(", ")
    if autoskipCount > AUTOSKIPLIST_COUNT
      l += ", +#{autoskipCount - AUTOSKIPLIST_COUNT} more"
    # logOutput("MTV: Auto-skipped #{autoskipCount} song#{if autoskipCount == 1 then "" else "s"}: `#{l}`")
  autoskipCount = 0
  autoskipList = []
  return

shouldSkip = (e) ->
  # console.log "shouldSkip: e #{JSON.stringify(e)}"
  if e.tags.nsfw
    # console.log "shouldSkip: sfwOnly #{JSON.stringify(sfwOnly)}"
    for sid, soc of sockets
      if not isPlaying[sid]
        continue
      if sfwOnly[sid]
        console.log "autoskip: #{playingName[sid]} can't watch NSFW content, bailing out."
        return true

  hasOpinionCount = 0
  weakOpinionCount = 0
  for sid, soc of sockets
    if not isPlaying[sid]
      continue
    if playingName[sid]?
      if nicknames[playingName[sid]]?
        # This playingName has a nickname, it must be the user
        user = playingName[sid]
      else
        user = getUserFromNickname(playingName[sid])
        if user == playingName[sid]
          # The nickname provided doesn't map to ID we know, skip them
          continue
      if ignored[getNickname(playingName[sid])]
        # This nickname is explicitly ignored for now
        continue

      feeling = opinions[e.id]?[user]
      if feeling? and constants.badOpinions[feeling]?
        console.log "autoskip: #{user} #{feeling}s this song, skipping."
        return true

      hasOpinionCount += 1
      if not feeling?
        # console.log "autoskip: #{user} has no opinion of this song, bailing out."
        continue
      if constants.weakOpinions[feeling]?
        weakOpinionCount += 1
      if constants.goodOpinions[feeling]?
        # console.log "autoskip: #{user} #{feeling}s this song, bailing out."
        continue # return false

  if (hasOpinionCount > 0) and (hasOpinionCount == weakOpinionCount)
    console.log "autoskip: Everyone (#{weakOpinionCount}) has a weak opinion, skipping."
    return true
  return false

autoskip = ->
  if lastPlayed == null
    console.log "autoskip: lastPlayed is null."
    return

  if shouldSkip(lastPlayed)
    strs = calcEntryStrings(lastPlayed)
    console.log "autoskip: Autoskipped #{strs.description}"

    if autoskipTimeout?
      clearTimeout(autoskipTimeout)
      autoskipTimeout = null
    autoskipTimeout = setTimeout(logAutoskip, 1000)
    autoskipCount += 1
    if autoskipCount <= AUTOSKIPLIST_COUNT
      autoskipList.push("#{strs.artist} - #{strs.title}")

    playNext()
    return

  console.log "autoskip: Nothing to do."
  if echoEnabled and echoNewSong
    echoNewSong = false

    licensingInfo = calcLicensingInfo(lastPlayed)
    artist = licensingInfo.artist
    artist = artist.replace(/^\s+/, "")
    artist = artist.replace(/\s+$/, "")
    title = licensingInfo.title
    title = title.replace(/^\s+/, "")
    title = title.replace(/\s+$/, "")
    logText = "#{artist}\n\"#{title}\"\n#{licensingInfo.company}"
    feelings = []
    for o in constants.opinionOrder
      if licensingInfo.opinions[o]?
        feelings.push o
    if feelings.length == 0
      logText += "\nNo Opinions"
    else
      for feeling in feelings
        list = licensingInfo.opinions[feeling]
        list.sort()
        logText += "\n#{feeling.charAt(0).toUpperCase() + feeling.slice(1)}: #{list.join(', ')}"
    maxLineLength = 0
    for line in logText.split(/\n/)
      if maxLineLength < line.length
        maxLineLength = line.length

    border = "--------------------------------------------------------------".substr(0, maxLineLength)
    logText = "```\n#{border}\n#{logText}\n#{border}```"
    logOutput(logText)

    # logOutput("MTV: Playing: #{strs.description}")
  return

checkAutoskip = ->
  setTimeout ->
    autoskip()
  , 0

songEnding = ->
  if not lastPlayed?
    return
  strs = calcEntryStrings(lastPlayed)
  for socketId, socket of sockets
    pkt = calcLicensingInfo(lastPlayed)
    socket.emit 'ending', pkt

someoneIsWatchingWithAutoskip = ->
  someoneWatching = false
  for sid, soc of sockets
    if isPlaying[sid] and playingName[sid] and not ignored[getNickname(playingName[sid])]
      someoneWatching = true
      break
  return someoneWatching

checkIfEveryoneLeft = ->
  if nobodyWatchingTimeout?
    return

  if not someoneIsWatchingWithAutoskip()
    nobodyWatchingTimeout = setTimeout ->
      if echoEnabled
        echoEnabled = false
        logOutput("MTV: Auto-disabling echo (all autoskippers left)")
      nobodyWatchingTimeout = null
    , 15000


autoPlayNext = ->
  e = playNext()
  console.log "autoPlayNext: #{JSON.stringify(e, null, 2)}"

play = (e) ->
  lastPlayedTime = now()
  lastPlayed = e
  history.unshift(e)
  while history.length > 20
    history.pop()

  if not shouldSkip(lastPlayed)
    console.log e
    pkt = calcLicensingInfo(e)
    pkt.id = e.id
    pkt.start = e.start
    pkt.end = e.end
    for socketId, socket of sockets
      socket.emit 'play', pkt
    saveState()
    savePlaylist()

  console.log "Playing: #{e.title} [#{e.id}]"
  startTime = e.start
  if startTime < 0
    startTime = 0
  endTime = e.end
  if endTime < 0
    endTime = e.duration
  lastPlayedDuration = endTime - startTime
  if lastPlayedDuration > e.duration
    lastPlayedDuration = e.duration - startTime
  # sanity check?
  if lastPlayedDuration < 20
    lastPlayedDuration = e.duration

  if lastPlayedTimeout?
    clearTimeout(lastPlayedTimeout)
    lastPlayedTimeout = null
  lastPlayedTimeout = setTimeout(autoPlayNext, (lastPlayedDuration + 3) * 1000)
  if songEndingTimeout?
    clearTimeout(songEndingTimeout)
    songEndingTimeout = null
  if lastPlayedDuration > 30
    songEndingTimeout = setTimeout(songEnding, (lastPlayedDuration - 15) * 1000)
  console.log "Play: [#{e.title}] [#{lastPlayedDuration} seconds]"
  echoNewSong = true
  checkAutoskip()
  return

parseDuration = (s) ->
  return iso8601.toSeconds(iso8601.parse(s))

queueYoutubeTrending = ->
  return new Promise (resolve, reject) ->
    url = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=10&key=#{secrets.youtube}"
    req = https.request url, (res) ->
      rawJSON = ""
      res.on 'data', (chunk) ->
        rawJSON += chunk
      res.on 'error', ->
        console.log "Error getting trending music"
        resolve()
      res.on 'end', ->
        data = null
        try
          data = JSON.parse(rawJSON)
        catch
          console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
          return
        saved = false
        if data.items? and (data.items.length > 0)
          unshuffledTrendingQueue = []
          for item in data.items
            chosenThumb = null
            for thumbType, thumb of item.snippet.thumbnails
              if not chosenThumb?
                chosenThumb = thumb
                continue
              if thumbType == 'medium'
                chosenThumb = thumb
                break
              if chosenThumb.height < thumb.height
                chosenThumb = thumb
            thumbUrl = null
            if chosenThumb?
              thumbUrl = chosenThumb.url
            if not thumbUrl?
              thumbUrl = '/unknown.png'
            e = entryFromArg(item.id)

            if playlist[e.id]?
              unshuffledTrendingQueue.push(playlist[e.id])
              e = playlist[e.id]
            else
              e.title = item.snippet.title
              e.thumb = thumbUrl
              e.user = YOUTUBE_USER
              e.duration = parseDuration(item.contentDetails.duration)
              splitArtist(e, false)
              unshuffledTrendingQueue.push e
            console.log "Found trending title [#{e.id}]: #{e.title}"
            # savePlaylist()
            # saved = true

          trendingQueue = [ unshuffledTrendingQueue.shift() ]
          for i, index in unshuffledTrendingQueue
            j = Math.floor(Math.random() * (index + 1))
            trendingQueue.push(trendingQueue[j])
            trendingQueue[j] = i
          for e in trendingQueue
            queue.unshift e
        resolve()
    req.end()

queueYoutubePlaylist = (playlistId) ->
  return new Promise (resolve, reject) ->
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=#{encodeURIComponent(playlistId)}&key=#{secrets.youtube}"
    outerReq = https.request url, (outerRes) ->
      rawJSON = ""
      outerRes.on 'data', (chunk) ->
        rawJSON += chunk
      outerRes.on 'error', ->
        console.log "Error getting playlist music"
        resolve()
      outerRes.on 'end', ->
        outerData = null
        try
          outerData = JSON.parse(rawJSON)
        catch
          console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
          resolve(0)
          return

        idList = []
        if outerData.items? and (outerData.items.length > 0)
          unshuffledPlaylistQueue = []
          for item in outerData.items
            if item.snippet.resourceId.kind == 'youtube#video'
              idList.push item.snippet.resourceId.videoId

        if idList.length == 0
          console.log "ERROR: idList is empty: #{rawJSON}"
          resolve(0)
          return
        idString = idList.join(',')
        console.log "idString: #{idString}"

        url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&key=#{secrets.youtube}&id=#{idString}"
        req = https.request url, (res) ->
          rawJSON = ""
          res.on 'data', (chunk) ->
            rawJSON += chunk
          res.on 'error', ->
            console.log "Error getting playlist music"
            resolve(0)
          res.on 'end', ->
            data = null
            try
              data = JSON.parse(rawJSON)
            catch
              console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
              resolve(0)
              return
            saved = false
            playlistCount = 0
            if data.items? and (data.items.length > 0)
              unshuffledPlaylistQueue = []
              for item in data.items
                chosenThumb = null
                for thumbType, thumb of item.snippet.thumbnails
                  if not chosenThumb?
                    chosenThumb = thumb
                    continue
                  if thumbType == 'medium'
                    chosenThumb = thumb
                    break
                  if chosenThumb.height < thumb.height
                    chosenThumb = thumb
                thumbUrl = null
                if chosenThumb?
                  thumbUrl = chosenThumb.url
                if not thumbUrl?
                  thumbUrl = '/unknown.png'
                e = entryFromArg(item.id)

                if playlist[e.id]?
                  unshuffledPlaylistQueue.push(playlist[e.id])
                  e = playlist[e.id]
                else
                  e.title = item.snippet.title
                  e.thumb = thumbUrl
                  e.user = YOUTUBE_USER
                  e.duration = parseDuration(item.contentDetails.duration)
                  splitArtist(e, false)
                  unshuffledPlaylistQueue.push e
                console.log "Found playlist video title [#{e.id}]: #{e.title}"
                # savePlaylist()
                # saved = true

              playlistQueue = [ unshuffledPlaylistQueue.shift() ]
              for i, index in unshuffledPlaylistQueue
                j = Math.floor(Math.random() * (index + 1))
                playlistQueue.push(playlistQueue[j])
                playlistQueue[j] = i
              for e in playlistQueue
                queue.unshift e
              playlistCount = playlistQueue.length
            resolve(playlistCount)
        req.end()
    outerReq.end()

convertYoutubePlaylist = (output, playlistId, pageToken = null) ->
  return new Promise (resolve, reject) ->
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=#{encodeURIComponent(playlistId)}&key=#{secrets.youtube}"
    if pageToken?
      url += "&pageToken=#{pageToken}"
    outerReq = https.request url, (outerRes) ->
      rawJSON = ""
      outerRes.on 'data', (chunk) ->
        rawJSON += chunk
      outerRes.on 'error', ->
        console.log "Error getting playlist music"
        resolve(output)
      outerRes.on 'end', ->
        outerData = null
        try
          outerData = JSON.parse(rawJSON)
        catch
          console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
          resolve(output)
          return

        if outerData.items? and (outerData.items.length > 0)
          unshuffledPlaylistQueue = []
          for item in outerData.items
            if item.snippet.resourceId.kind == 'youtube#video'
              output.push item.snippet.resourceId.videoId

        if outerData.nextPageToken?
          resolve(await convertYoutubePlaylist(output, playlistId, outerData.nextPageToken))
        else
          resolve(output)
    outerReq.end()

getYoutubeData = (e) ->
  limiter.schedule ->
    e.id = e.id.replace(/\?.+$/, "")
    console.log "Looking up: #{e.id}"
    return new Promise (resolve, reject) ->
      idInfo = filters.calcIdInfo(e.id)
      if not idInfo? or (idInfo.provider != 'youtube')
        resolve(false)
        return
      url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&key=#{secrets.youtube}&id=#{encodeURIComponent(idInfo.real)}"
      req = https.request url, (res) ->
        rawJSON = ""
        res.on 'data', (chunk) ->
          rawJSON += chunk
        res.on 'error', ->
          console.log "Error [#{idInfo.real}]"
          resolve(false)
        res.on 'end', ->
          data = null
          try
            data = JSON.parse(rawJSON)
          catch
            console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
            return
          console.log "looking up #{idInfo.real}"
          saved = false
          if data.items? and (data.items.length > 0)
            # console.log JSON.stringify(data, null, 2)
            if data.items[0].snippet? and data.items[0].snippet.title? and data.items[0].snippet.thumbnails? and data.items[0].contentDetails.duration?
              chosenThumb = null
              for thumbType, thumb of data.items[0].snippet.thumbnails
                if not chosenThumb?
                  chosenThumb = thumb
                  continue
                if thumbType == 'medium'
                  chosenThumb = thumb
                  break
                if chosenThumb.height < thumb.height
                  chosenThumb = thumb
              thumbUrl = null
              if chosenThumb?
                thumbUrl = chosenThumb.url
              if not thumbUrl?
                thumbUrl = '/unknown.png'

              e.title = data.items[0].snippet.title
              e.thumb = thumbUrl
              e.duration = parseDuration(data.items[0].contentDetails.duration)
              splitArtist(e)
              console.log "Found title [#{idInfo.real}]: '#{e.artist}' - '#{e.title}'"
              savePlaylist()
              saved = true
          if not saved
            console.log "Nope [#{idInfo.real}]"
            if playlist[e.id]?
              delete playlist[e.id]
            queue = queue.filter (a) -> a.id != e.id
            history = history.filter (a) -> a.id != e.id
            savePlaylist()
            saveState()
            logOutput("MTV: Auto-removed: `#{e.id}` (invalid YouTube ID)")
          resolve(saved)
      req.end()

playNext = ->
  if queue.length < 1
    unshuffled = []
    for k,v of playlist
      unshuffled.push(v)
    if unshuffled.length > 0
      queue = [ unshuffled.shift() ]
      for i, index in unshuffled
        j = Math.floor(Math.random() * (index + 1))
        queue.push(queue[j])
        queue[j] = i

  if queue.length < 1
    console.log "Nothing to play!"
    return null

  e = queue.shift()
  console.log e
  play(e)
  return e

# parses strings like 1h30m20s to seconds
getLetterTime = (timeString) ->
  totalSeconds = 0
  timeValues =
    's': 1
    'm': 1 * 60
    'h': 1 * 60 * 60
    'd': 1 * 60 * 60 * 24
    'w': 1 * 60 * 60 * 24 * 7

  # expand to "1 h 30 m 20 s" and split
  timeString = timeString.replace(/([smhdw])/g, ' $1 ').trim()
  timePairs = timeString.split(' ')

  for i in [0...timePairs.length] by 2
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs[i + 1] || 's']
  return totalSeconds

# parses strings like 1:30:20 to seconds
getColonTime = (timeString) ->
  totalSeconds = 0
  timeValues = [
    1
    1 * 60
    1 * 60 * 60
    1 * 60 * 60 * 24
    1 * 60 * 60 * 24 * 7
  ]
  timePairs = timeString.split(':')
  for i in [0...timePairs.length]
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs.length - i - 1]

  return totalSeconds

getTime = (timeString) ->
  if not timeString?
    return 0
  if timeString.match(/^(\d+[smhdw]?)+$/)
    return getLetterTime(timeString)
  if timeString.match(/^(\d+:?)+$/)
    return getColonTime(timeString)
  return 0

entryFromArg = (arg) ->
  if not arg?
    return null
  arg = String(arg)

  id = null
  startTime = -1
  endTime = -1

  try
    url = new URL(arg)
  catch
    url = null
    id = arg

  if not id? and (url.hostname == 'youtu.be')
    id = url.pathname.replace(/^\//, "")
    id = "youtube_#{id}"

  if not id? and url.hostname.match(/youtube.com$/)
    v = url.searchParams.get('v')
    if v?
      id = "youtube_#{v}"

  idInfo = filters.calcIdInfo(id)
  if not idInfo?
    # backwards compatibility
    id = "youtube_#{id}"
    idInfo = filters.calcIdInfo(id)

  if url?
    t = url.searchParams.get('t')
    if t?
      startTime = getTime(t)

    t = url.searchParams.get('start')
    if t?
      startTime = getTime(t)

    t = url.searchParams.get('end')
    if t?
      endTime = getTime(t)

  if not id?
    return null

  if id.match(/\?/)
    return null

  return {
    id: id
    start: startTime
    end: endTime
    added: now()
    tags: {}
  }

playlistIDFromArg = (arg) ->
  if not arg?
    return null
  arg = String(arg)

  id = null

  if not arg.match("^https?:")
    return arg

  try
    url = new URL(arg)
  catch
    url = null
    id = arg

  if not id? and (url.hostname == 'youtu.be') or url.hostname.match(/youtube.com$/)
    list = url.searchParams.get('list')
    if list?
      id = list

  if not id?
    return null
  if id.match(/\?/)
    return null
  if id.match(/\//)
    return null

  return id

prettyDuration = (duration) ->
  str = ""
  hours = Math.floor(duration / 3600)
  if hours > 0
    duration -= hours * 3600
    str += "#{hours}h"
  minutes = Math.floor(duration / 60)
  if minutes > 0
    duration -= minutes * 60
    str += "#{minutes}m"
  if (duration > 0) or (str.length == 0)
    str += "#{duration}s"
  return str

calcEntryStrings = (e) ->
  idInfo = filters.calcIdInfo(e.id)
  if not idInfo?
    console.log "calcEntryStrings: bad idInfo: ", e
    return {}
  url = idInfo.url
  if idInfo.provider == 'youtube'
    params = ""
    if e.start >= 0
      params += if params.length == 0 then "?" else "&"
      params += "start=#{e.start}"
    if e.end >= 0
      params += if params.length == 0 then "?" else "&"
      params += "end=#{e.end}"
    url = "#{url}#{params}"

  if e.title?
    title = "#{e.title} "
  else
    title = " "
  if e.artist?
    artist = e.artist
  else
    artist = "Unknown"

  startTime = e.start
  if startTime < 0
    startTime = 0
  endTime = e.end
  if endTime < 0
    endTime = e.duration
  actualDuration = endTime - startTime

  opinionTable = {}
  opinionString = ""
  for feeling, count of e.opinions
    opinionTable[feeling] ?= []
    opinionString += ", #{count} #{feeling}#{if count == 1 then "" else "s"}"
    if opinions[e.id]? and (count > 0)
      whoList = []
      for user, userFeeling of opinions[e.id]
        if feeling == userFeeling
          nick = getNickname(user)
          whoList.push nick
          opinionTable[feeling].push nick
      whoList.sort()
      opinionString += " (#{whoList.join(', ')})"

  tagsString = Object.keys(e.tags).sort().join(', ')
  if tagsString.length > 0
    tagsString = " - [#{tagsString}]"

  ownerNick = getNickname(e.user)

  return {
    artist: artist
    title: title
    opinions: opinionTable
    url: url
    description: "**#{artist}** - **#{title}** `[#{ownerNick}, #{prettyDuration(actualDuration)}#{opinionString}]#{tagsString}`"
  }

calcLicensingInfo = (e) ->
  strs = calcEntryStrings(e)
  if companies[e.user]?
    company = companies[e.user]
  else
    nickname = getNickname(e.user)
    company = nickname.charAt(0).toUpperCase() + nickname.slice(1)
    company += " Records"
  return {
    user: e.user
    artist: strs.artist
    title: strs.title
    opinions: strs.opinions
    company: company
    thumb: e.thumb
  }

updateNickname = (e) ->
  e.nickname = getNickname(e.user)
  return

updateNicknames = (entries, isMap) ->
  if isMap
    for k, v of entries
      updateNickname(v)
  else
    for e in entries
      updateNickname(e)
  return

updateOpinion = (e) ->
  o = {}
  if opinions[e.id]?
    for user, feeling of opinions[e.id]
      o[feeling] ?= 0
      o[feeling] += 1
  e.opinions = o
  return

updateOpinions = (entries, isMap) ->
  if isMap
    for k, v of entries
      updateOpinion(v)
  else
    for e in entries
      updateOpinion(e)
  return

calcUserInfo = (user) ->
  userInfo =
    added: []
    opinions: {}
    otherOpinions:
      incoming: {}
      outgoing: {}
    otherTotals:
      incoming: {}
      outgoing: {}
  incoming = userInfo.otherOpinions.incoming
  outgoing = userInfo.otherOpinions.outgoing

  user = getUserFromNickname(user)

  for k, e of playlist
    if e.user == user
      userInfo.added.push e
      if opinions[e.id]?
        for otherUser, feeling of opinions[e.id]
          otherUser = getNickname(otherUser)
          incoming[otherUser] ?= {}
          incoming[otherUser][feeling] ?= 0
          incoming[otherUser][feeling] += 1
          userInfo.otherTotals.incoming[feeling] ?= 0
          userInfo.otherTotals.incoming[feeling] += 1
    if opinions[e.id]?
      if opinions[e.id][user]?
        feeling = opinions[e.id][user]
        if not userInfo.opinions[feeling]?
          userInfo.opinions[feeling] = []
        userInfo.opinions[feeling].push e
        nickname = getNickname(e.user)
        outgoing[nickname] ?= {}
        outgoing[nickname][feeling] ?= 0
        outgoing[nickname][feeling] += 1
        userInfo.otherTotals.outgoing[feeling] ?= 0
        userInfo.otherTotals.outgoing[feeling] += 1

  return userInfo

calcUserOpinions = (user) ->
  user = getUserFromNickname(user)
  userOpinions = {}
  for k, e of playlist
    if opinions[e.id]? and opinions[e.id][user]?
      userOpinions[e.id] = opinions[e.id][user]
  return userOpinions

isOpinionCommand = (cmd) ->
  if cmd == 'none'
    return true
  return constants.opinions[cmd]?

run = (args, user) ->
  cmd = 'who'
  if args.length > 0
    cmd = args[0]
    cmd = cmd.replace(/^ +/, "")
    cmd = cmd.replace(/ +$/, "")
    if cmd.length == 0
      cmd = 'who'

  # Sanitize command
  cmd = cmd.replace(/[^a-zA-Z0-9]/g, "")

  if isOpinionCommand(cmd)
    e = null
    if args.length > 1
      if args[1].toLowerCase() == 'last'
        if history.length < 2
          return "MTV [opinion]: Can't updated last song; no history."
        e = history[1]
      else
        e = entryFromArg(args[1])
        if not e?
          return "MTV [opinion]: I don't know what #{args[1]} is."
      if not playlist[e.id]?
        return "MTV [opinion]: `#{e.id}` is not in the pool."
      e = playlist[e.id]
    if not e?
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      e = lastPlayed
    opinions[e.id] ?= {}
    if cmd == 'none'
      if opinions[e.id][user]?
        delete opinions[e.id][user]
    else
      opinions[e.id][user] = cmd
    updateOpinion(e)
    strs = calcEntryStrings(e)
    saveOpinions()
    requestDashboardRefresh()
    checkAutoskip()
    return "MTV: Updated: #{strs.description}"

  switch cmd

    when 'help', 'commands'
      return "MTV: Help: #{secrets.url}/help/"

    when 'here', 'watching', 'web', 'website'
      other = calcOther()
      nameString = ""
      if other.playing == 0
        return "MTV: [Here] Nobody is watching live. _(#{other.solo} solo session#{if other.solo == 1 then "" else "s"})_"
      anonCount = other.playing - other.names.length
      if other.names.length > 0
        nameString = ""
        for name in other.names
          if nameString.length > 0
            nameString += ", "
          nameString += "`#{name}`"
      if anonCount > 0
        if nameString.length > 0
          nameString += " + "
        nameString += "**#{anonCount}** anonymous"
      return "MTV: [Here] Watching: #{nameString} _(#{other.solo} solo session#{if other.solo == 1 then "" else "s"})_"

    when 'what', 'whatisthis', 'who', 'whodis', 'why'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      strs = calcEntryStrings(lastPlayed)
      return "MTV: Playing: #{strs.description}"

    when 'link', 'url', 'where'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      strs = calcEntryStrings(lastPlayed)
      return "MTV: #{strs.url}"

    when 'echo'
      echoEnabled = !echoEnabled
      if echoEnabled
        return "MTV: Now echoing in chat."
      else
        return "MTV: Echo disabled."

    when 'nsfw', 'sfw'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      if cmd == 'nsfw'
        lastPlayed.tags.nsfw = true
      else
        if lastPlayed.tags.nsfw?
          delete lastPlayed.tags.nsfw
      strs = calcEntryStrings(lastPlayed)
      savePlaylist()
      requestDashboardRefresh()
      checkAutoskip()
      return "MTV: (N)SFW Adjustment: #{strs.description}"

    when 'host'
      if args.length < 3
        return "MTV: Syntax: host [real] [url.mp4]"
      real = args[1].replace(/[^a-zA-Z0-9_]/g, "")
      id = "mtv_#{real}"
      e = entryFromArg(id)
      if playlist[e.id]?
        strs = calcEntryStrings(playlist[e.id])
        return "MTV: Already in pool: #{strs.description}"
      if not e?
        return "MTV: host: invalid real: #{args[1]}"
      idInfo = filters.calcIdInfo(e.id)
      if not idInfo? or (idInfo.provider != 'mtv')
        return "MTV: host: invalid real: #{args[1]}"
      result = await hosting.downloadVideo(real, args[2])
      if result.error
        return "MTV: host error: #{result.error}"
      e.user = user
      e.artist = "Unset Artist #{real}"
      e.title = "Unset Title #{real}"
      e.thumb = result.thumb
      e.duration = result.duration
      playlist[e.id] = e
      savePlaylist()
      return "MTV: Host[`#{e.id}`] Successful (#{e.duration}s duration). Please edit `artist` and `title` using `#mtv edit #{e.id}`"

    when 'add'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: add: invalid argument"
      if playlist[e.id]?
        strs = calcEntryStrings(playlist[e.id])
        return "MTV: Already in pool: #{strs.description}"
      e.user = user
      playlist[e.id] = e
      saved = await getYoutubeData(e)
      if saved
        savePlaylist()
        return "MTV: Add[`#{e.id}`] Artist: `#{e.artist}`, Title: `#{e.title}`"
      else
        return "MTV: add ignoring invalid ID: `#{e.id}`"

    when 'adopt'
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      if lastPlayed.user != YOUTUBE_USER
        return "MTV: You may only adopt entries from #{YOUTUBE_USER}."
      if playlist[lastPlayed.id]?
        strs = calcEntryStrings(playlist[lastPlayed.id])
        return "MTV: Already in pool: #{strs.description}"
      lastPlayed.user = user
      playlist[lastPlayed.id] = lastPlayed
      savePlaylist()
      requestDashboardRefresh()
      return "MTV: Added to pool: `#{lastPlayed.id}`"

    when 'ignore'
      ignoreCmd = args[1]
      ignoreArgs = []
      for i in [2...args.length]
        ignoreArgs.push args[i]
      ignoreName = ignoreArgs.join(" ")
      switch ignoreCmd
        when 'add'
          if ignoreName.match(/^\s*$/)
            return "MTV: ignore add requires a nickname."
          if ignored[ignoreName]
            return "MTV: `#{ignoreName}` is already ignored."
          else
            ignored[ignoreName] = true
            saveIgnored()
            return "MTV: Now ignoring nickname: `#{ignoreName}`"
        when 'remove'
          if ignoreName.match(/^\s*$/)
            return "MTV: ignore remove requires a nickname."
          if not ignored[ignoreName]
            return "MTV: `#{ignoreName}` is already not ignored."
          else
            delete ignored[ignoreName]
            saveIgnored()
            checkAutoskip()
            return "MTV: No longer ignoring nickname: `#{ignoreName}`"
        when 'clear'
          ignored = {}
          saveIgnored()
          checkAutoskip()
          return "MTV: No longer ignoring anyone."
        when 'list'
          prettyList = []
          for k,v of ignored
            prettyList.push "`#{k}`"
          if prettyList.length == 0
            return "MTV: Nobody is being ignored right now."
          return "MTV: Ignoring: #{prettyList.join(", ")}"
        else
          return "MTV: ignore [add/remove/clear/list]"

    when 'edit'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: edit: invalid argument"
      if not playlist[e.id]?
        return "MTV: edit: Not in pool already, ignoring"

      if args.length < 3
        return "MTV: Syntax: edit [URL/id] [user/start/end/artist/title] [newValue]"
      property = args[2].toLowerCase()
      editArgs = []
      for i in [3...args.length]
        editArgs.push args[i]
      concatenatedArgs = editArgs.join(" ")
      switch property
        when 'user'
          newValue = args[3]
        when 'start'
          newValue = parseInt(args[3])
          if isNaN(newValue)
            return "MTV: edit: invalid number #{args[3]}"
          if newValue == 0
            newValue = -1
        when 'end'
          newValue = parseInt(args[3])
          if isNaN(newValue)
            return "MTV: edit: invalid number #{args[3]}"
          if newValue >= playlist[e.id].duration
            newValue = -1
        when 'artist'
          newValue = concatenatedArgs
        when 'title'
          newValue = concatenatedArgs
        when 'tag', 'untag'
          e = playlist[e.id]
          if not e?
            return "MTV [edit]: Unknown id"
          for tagName in editArgs
            tagName = sanitizeTag(tagName)
            if property == 'tag'
              e.tags[tagName] = true
            else
              if e.tags[tagName]?
                delete e.tags[tagName]
          strs = calcEntryStrings(e)
          savePlaylist()
          requestDashboardRefresh()
          checkAutoskip()
          return "MTV: Tags Updated: #{strs.description}"
        else
          return "MTV: edit: unknown property: #{property}"

      oldValue = playlist[e.id][property]
      playlist[e.id][property] = newValue
      savePlaylist()
      requestDashboardRefresh()
      return "MTV: Edited: `#{e.id}` [`#{property}`] `#{oldValue}` -> `#{newValue}`"

    when 'tags'
      knownTags = {}
      for k,v of playlist
        for tag of v.tags
          knownTags[tag] = true
      legalTags = Object.keys(knownTags).sort().join(", ")
      return "MTV [tags]: `#{legalTags}`"
    when 'tag', 'untag'
      if args.length < 2
        return "MTV [tag]: Please provide a tag."
      if lastPlayed == null
        return "MTV: I have no idea what's playing."
      tagArgs = []
      for i in [1...args.length]
        tagArgs.push args[i]
      e = lastPlayed
      for tagName in tagArgs
        tagName = sanitizeTag(tagName)
        if cmd == 'tag'
          e.tags[tagName] = true
        else
          if e.tags[tagName]?
            delete e.tags[tagName]
      strs = calcEntryStrings(e)
      savePlaylist()
      requestDashboardRefresh()
      checkAutoskip()
      return "MTV: Tags Updated: #{strs.description}"

    when 'queue', 'q'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: queue: invalid argument"
      if playlist[e.id]?
        queue.unshift(playlist[e.id])
        strs = calcEntryStrings(playlist[e.id])
        ret = "MTV: Queued next (already in pool) #{strs.description}"
      else
        e.user = user
        playlist[e.id] = e
        queue.unshift(playlist[e.id])
        saved = await getYoutubeData(e)
        if saved
          savePlaylist()
          return "MTV: Queue[`#{e.id}`] Artist: `#{e.artist}`, Title: `#{e.title}`"
        else
          ret = "MTV: queue ignoring invalid ID: `#{e.id}`"
      saveState()
      requestDashboardRefresh()
      return ret

    when 'block'
      if args.length < 3
        return "MTV: Syntax: block [artist/title/tag] substring"
      playArgs = []
      for i in [1...args.length]
        playArgs.push args[i]
      playSubstring = playArgs.join(" ")
      playNewlines = playSubstring.replace(/\//g, "\n")
      filters.setServerDatabases(playlist, opinions, getUserFromNickname)
      unsortedQueue = await filters.generateList(playNewlines)
      if not unsortedQueue?
        return "MTV: Error getting block, sorry."
      if unsortedQueue.length < 1
        return "MTV: No block matches for: `#{playSubstring}`"
      playQueue = [ unsortedQueue.shift() ]
      for i, index in unsortedQueue
        j = Math.floor(Math.random() * (index + 1))
        playQueue.push(playQueue[j])
        playQueue[j] = i
      for v in playQueue
        queue.unshift(v)
      saveState()
      requestDashboardRefresh()
      return "MTV: Queued #{playQueue.length} unique video#{if playQueue.length == 1 then "" else "s"} matching: `#{playSubstring}`"

    when 'shuffle'
      queue = []
      e = playNext()
      strs = calcEntryStrings(e)
      requestDashboardRefresh()
      return "MTV: Shuffled and playing a fresh song #{strs.description}"

    when 'trending'
      await queueYoutubeTrending()
      e = playNext()
      strs = calcEntryStrings(e)
      requestDashboardRefresh()
      return "MTV: Queued up the top 50 trending music from youtube. First up: #{strs.description}"

    when 'playlist'
      playlistID = playlistIDFromArg(args[1])
      if not playlistID?
        return "MTV: Unable to figure out playlistID from: `#{args[1]}`"
      playlistCount = await queueYoutubePlaylist(playlistID)
      requestDashboardRefresh()
      if playlistCount == 0
        return "MTV: Failed to find any videos with playlist ID `#{playlistID}`."
      return "MTV: Queued up #{playlistCount} videos from playlist ID `#{playlistID}`."

    when 'company', 'label'
      companyArgs = []
      for i in [1...args.length]
        companyArgs.push args[i]
      newCompany = companyArgs.join(" ")
      console.log "newCompany: '#{newCompany}'"
      if newCompany.match(/^\s*$/)
        if companies[user]?
          return "MTV: Your (`#{user}`) current label is: `#{companies[user]}`"
        else
          return "MTV: You (`#{user}`) have not set a label yet.`"
      companies[user] = newCompany
      saveCompanies()
      return "MTV: `#{user}`'s new label: `#{newCompany}`"

    when 'nickname', 'name'
      nicknameArgs = []
      for i in [1...args.length]
        nicknameArgs.push args[i]
      newNickname = nicknameArgs.join(" ")
      console.log "newNickname: '#{newNickname}'"
      if newNickname.match(/^\s*$/)
        if nicknames[user]?
          return "MTV: Your (`#{user}`) current nickname is: `#{nicknames[user]}`"
        else
          return "MTV: You (`#{user}`) have not set a nickname yet.`"
      nicknames[user] = newNickname
      saveNicknames()
      requestDashboardRefresh()
      return "MTV: `#{user}`'s new nickname: `#{newNickname}`"

    when 'remove', 'delete', 'del'
      e = entryFromArg(args[1])
      if not e?
        return "MTV: remove: invalid argument"
      if playlist[e.id]?
        delete playlist[e.id]
        savePlaylist()
        title = e.title
        if not title?
          title = e.id
        return "MTV: Deleted #{title} from shuffled pool."
      else
        return "MTV: `#{e.id}` is already not in the shuffled pool."

    when 'repeat'
      if not lastPlayed?
        return "MTV: I have no idea what's playing."
      repeatCount = 1
      if args.length > 1
        repeatCount = parseInt(args[1])
        if repeatCount < 1
          repeatCount = 1
        if repeatCount > 10
          repeatCount = 10
      for i in [0...repeatCount]
        queue.unshift(lastPlayed)
      saveState()
      requestDashboardRefresh()
      strs = calcEntryStrings(lastPlayed)
      return "MTV: Re-queued **#{repeatCount}**x: #{strs.description}"

    when 'next', 'skip'
      extraSkips = 0
      if args.length > 1
        count = parseInt(args[1])
        if count > 1
          extraSkips = count - 1
      if lastPlayed?
        strs = calcEntryStrings(lastPlayed)
        ret = "MTV: Skipped #{strs.description}"
      for i in [0...extraSkips]
        queue.shift()
      e = playNext()
      if not ret?
        ret = "MTV: Skipped unknown song"
      return ret

  return "MTV: unknown command #{cmd}"

processOAuth = (code) ->
  console.log "processOAuth: #{code}"
  return new Promise (resolve, reject) ->
    if not code? or (code.length < 1)
      resolve('')
      return

    postdata =
      client_id: secrets.discordClientID
      client_secret: secrets.discordClientSecret
      grant_type: 'authorization_code'
      redirect_uri: secrets.url + '/oauth'
      code: code
      scope: 'identify'
    params = String(new URLSearchParams(postdata))

    options =
      hostname: 'discord.com'
      port: 443
      path: '/api/oauth2/token'
      method: 'POST'
      headers:
        'Content-Length': params.length
        'Content-Type': 'application/x-www-form-urlencoded'
    req = https.request options, (res) ->
      rawJSON = ""
      res.on 'data', (chunk) ->
        rawJSON += chunk
      res.on 'error', ->
        console.log "Error getting auth"
        resolve('')
      res.on 'end', ->
        data = null
        try
          data = JSON.parse(rawJSON)
        catch
          console.log "ERROR: Failed to talk to parse JSON: #{rawJSON}"
          resolve('')
          return

        # console.log "Discord replied: ", JSON.stringify(data, null, 2)
        if not data.access_token? or (data.access_token.length < 1) or not data.token_type? or (data.token_type.length < 1)
          console.log "bad oauth reply (no access_token or token_type):", data
          resolve('')
          return

        meOptions =
          hostname: 'discord.com'
          port: 443
          path: '/api/users/@me'
          headers:
            'Authorization': "#{data.token_type} #{data.access_token}"
        # console.log "meOptions:", meOptions
        meReq = https.request meOptions, (meRes) ->
          meRawJSON = ""
          meRes.on 'data', (chunk) ->
            meRawJSON += chunk
          meRes.on 'error', ->
            console.log "Error getting auth"
            resolve('')
          meRes.on 'end', ->
            meData = null
            try
              meData = JSON.parse(meRawJSON)
            catch
              console.log "ERROR: Failed to talk to parse JSON: #{meRawJSON}"
              resolve('')
              return

            # console.log "Me replied:", meData
            if meData? and meData.username? and meData.discriminator?
              tag = "#{meData.username}##{meData.discriminator}"
              if not nicknames[tag]?
                console.log "Warning: Blocking auth on unknown user (no nickname): #{tag}"
                resolve('')
                return
              loop
                newToken = randomString()
                if not discordAuth[newToken]?
                  break
              discordAuth[newToken] =
                token: newToken
                tag: tag
                added: now()
              console.log "Login [#{newToken}]: #{discordAuth[newToken].tag}"
              resolve(newToken)
              saveDiscordAuth()
            else
              console.log "ERROR: Giving up on new token, couldn't get username and discriminator:", meData
              resolve('')

        meReq.end()

    req.write(params)
    req.end()
    console.log "sending request:", postdata

trimAllWhitespace = (e) ->
  ret = false
  if e.artist?
    newArtist = e.artist.replace(/^\s*/, "")
    newArtist = e.artist.replace(/\s*$/, "")
    if e.artist != newArtist
      e.artist = newArtist
      ret = true
  if e.title?
    newTitle = e.title.replace(/^\s*/, "")
    newTitle = e.title.replace(/\s*$/, "")
    if e.title != newTitle
      e.title = newTitle
      ret = true
  return ret

splitArtist = (e, announceCalc = true) ->
  if e.artist?
    return

  artist = "Unknown"
  title = e.title
  if matches = e.title.match(/^(.+)\s[–-]\s(.+)$/)
    artist = matches[1]
    title = matches[2]
  else if matches = e.title.match(/^([^"]+)\s"([^"]+)"/)
    artist = matches[1]
    title = matches[2]

  title = title.replace(/[\(\[](Official)?\s?(HD)?\s?(Music)?\sVideo[\)\]]/i, "")
  title = title.replace(/^\s+/, "")
  title = title.replace(/\s+$/, "")
  if title.match(/^".+"$/)
    title = title.replace(/^"/, "")
    title = title.replace(/"$/, "")

  if matches = title.match(/^(.+)\s+\(f(ea)?t. (.+)\)$/i)
    title = matches[1]
    artist += " ft. #{matches[3]}"
  else if matches = title.match(/^(.+)\s+f(ea)?t. (.+)$/i)
    title = matches[1]
    artist += " ft. #{matches[3]}"

  if matches = artist.match(/^(.+)\s+\(with ([^)]+)\)$/)
    artist = "#{matches[1]} ft. #{matches[2]}"

  e.artist = artist
  e.title = title
  trimAllWhitespace(e)
  # if announceCalc
    # logOutput("MTV: Calc[`#{e.id}`] Artist: `#{e.artist}`, Title: `#{e.title}`")
  return

findMissingYoutubeInfo = ->
  console.log "Checking for missing Youtube info..."
  missingTitleCount = 0
  needsSave = false
  for k,v of playlist
    idInfo = filters.calcIdInfo(k)
    if not idInfo? or (idInfo.provider != 'youtube')
      continue

    if playlist[k].countPlay?
      delete playlist[k]["countPlay"]
      needsSave = true
    if playlist[k].countSkip?
      delete playlist[k]["countSkip"]
      needsSave = true
    if not v.title? or not v.thumb? or not v.duration?
      getYoutubeData(v)
      missingTitleCount += 1
    else if not v.artist?
      splitArtist(v, false)
      needsSave = true
    if not v.added?
      v.added = serverEpoch
      needsSave = true
    if trimAllWhitespace(v)
      needsSave = true
    if not v.tags?
      v.tags = {}
      needsSave = true
    if v.nsfw?
      delete v.nsfw
      v.tags.nsfw = true
      needsSave = true
  for v in queue
    if v.countPlay?
      delete v["countPlay"]
      needsSave = true
    if v.countSkip?
      delete v["countSkip"]
      needsSave = true
    if not v.title? or not v.thumb? or not v.duration?
      getYoutubeData(v)
      missingTitleCount += 1
    else if not v.artist?
      splitArtist(v, false)
      needsSave = true
    if not v.added?
      v.added = serverEpoch
      needsSave = true
    if trimAllWhitespace(v)
      needsSave = true
    if not v.tags?
      v.tags = {}
      needsSave = true
    if v.nsfw?
      delete v.nsfw
      v.tags.nsfw = true
      needsSave = true
  if needsSave
    savePlaylist()
  console.log "Found #{missingTitleCount} missing Youtube info."

sanitizeUsername = (name) ->
  if name?
    name = name.replace(/[^a-zA-Z0-9# ]/g, "")
    name = name.replace(/ +/g, " ")
    name = name.replace(/^ */, "")
    name = name.replace(/ *$/, "")
    if name.length == 0
      return undefined
    name = name.substring(0, 16)
  return name

youtubeSoloRedirect = (req, res) ->
  html = fs.readFileSync("#{__dirname}/../web/redirect.html", "utf8")
  res.send(html)

main = (argv) ->
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  if not secrets.youtube? or not secrets.cmd?
    console.error "Bad secrets: " + JSON.stringify(secrets)
    return

  console.log "Secrets:"
  console.log JSON.stringify(secrets, null, 2)

  load()

  if secrets.discordClientID and secrets.discordClientSecret
    console.log "Discord enabled."
    discordEnabled = true
  else
    console.log "Discord disabled."

  await findMissingYoutubeInfo()
  setInterval( ->
    findMissingYoutubeInfo()
  , 60 * 1000)

  setInterval( ->
    refreshDashboardsIfNeeded()
  , 5 * 1000)

  # attempt to restart whatever was just playing
  if history.length > 0
    queue.unshift(history.shift())
  playNext()

  app = express()
  http = require('http').createServer(app)

  io = require('socket.io')(http, { pingTimeout: 10000 })
  io.on 'connection', (socket) ->
    sockets[socket.id] = socket

    socket.emit('server', { epoch: serverEpoch })

    socket.on 'solo', (msg) ->
      # console.log "received solo message: ", msg
      if msg.id?
        if soloSessions[socket.id] != msg.id
          soloSessions[socket.id] = msg.id
        if msg.cmd?
          soloBroadcast(socket.id, msg)
          if (msg.cmd == 'info') and msg.info?
            if not soloInfo[msg.id]?
              logger.play 'sessionadd', { t: now(), sid: msg.id }
            soloInfo[msg.id] = msg.info
            soloInfo[msg.id].tu = now() # time updated
            # console.log "Solo Info Update [#{msg.id}]: ", soloInfo[msg.id]
            logPlay(msg)
          else if (msg.cmd == 'mirror') and msg.info?
            logPlay(msg)
        else
          # new connection or re-connection, update their info
          if soloInfo[msg.id]?
            soloInfo[msg.id].tb = now() # time broadcasted
            socket.emit 'solo', { id: msg.id, cmd: 'info', info: soloInfo[msg.id] }

    socket.on 'playing', (msg) ->
      needsRefresh = false
      if not isPlaying[socket.id]
        isPlaying[socket.id] = true
        needsRefresh = true
        if nobodyWatchingTimeout?
          clearTimeout(nobodyWatchingTimeout)
          nobodyWatchingTimeout = null

      username = sanitizeUsername(msg.user)
      if playingName[socket.id] != username
        if username?
          playingName[socket.id] = username
        else
          delete playingName[socket.id]
        needsRefresh = true

      sfw = false
      # console.log "GOT MSG: #{JSON.stringify(msg)}"
      if msg.sfw? and ((msg.sfw == 'on') or (msg.sfw == '1') or (msg.sfw == 'true') or (msg.sfw == true))
        sfw = true
      if sfwOnly[socket.id] != sfw
        sfwOnly[socket.id] = sfw
        needsRefresh = true

      if needsRefresh
        requestDashboardRefresh()

    socket.on 'ready', (msg) ->
      # console.log "received ready"
      needsRefresh = false
      if not isPlaying[socket.id]
        isPlaying[socket.id] = true
        needsRefresh = true
        checkAutoskip()

      username = sanitizeUsername(msg.user)
      if playingName[socket.id] != username
        if username?
          playingName[socket.id] = username
        else
          delete playingName[socket.id]
        needsRefresh = true

      sfw = false
      # console.log "GOT MSG: #{JSON.stringify(msg)}"
      if msg.sfw? and ((msg.sfw == 'on') or (msg.sfw == '1') or (msg.sfw == 'true') or (msg.sfw == true))
        sfw = true
      if sfwOnly[socket.id] != sfw
        sfwOnly[socket.id] = sfw
        needsRefresh = true

      if needsRefresh
        requestDashboardRefresh()

      if lastPlayed?
        # Give fresh watchers something to watch until the next song hits
        startTime = lastPlayed.start + (now() - lastPlayedTime)
        endTime = lastPlayed.end
        if endTime == -1
          endTime = lastPlayed.duration

        # console.log "endTime #{endTime} startTime #{startTime}"
        if (endTime - startTime) > 5
          pkt = calcLicensingInfo(lastPlayed)
          pkt.id = lastPlayed.id
          pkt.start = startTime
          pkt.end = endTime
          socket.emit 'play', pkt

    socket.on 'disconnect', ->
      if sockets[socket.id]?
        delete sockets[socket.id]
      if playingName[socket.id]?
        delete playingName[socket.id]
      if isPlaying[socket.id]?
        delete isPlaying[socket.id]
        requestDashboardRefresh()
      if soloSessions[socket.id]?
        soloID = soloSessions[socket.id]
        delete soloSessions[socket.id]
        removeSoloSession = true
        for sid, soc of sockets
          if soloSessions[sid] == soloID
            removeSoloSession = false
            break
        if removeSoloSession
          console.log "Forgetting solo session: #{soloID}"
          if soloInfo[soloID]?
            delete soloInfo[soloID]
            logger.play 'sessiondel', { t: now(), sid: soloID }

      checkAutoskip()
      checkIfEveryoneLeft()

    socket.on 'identify', (msg) ->
      if not discordEnabled
        socket.emit 'identify', { 'disabled': true }
        return
      if msg.token? and discordAuth[msg.token]?
        reply =
          tag: discordAuth[msg.token].tag
        if nicknames[reply.tag]?
          reply.nickname = nicknames[reply.tag]
        socket.emit 'identify', reply
        return
      socket.emit 'identify', {}

    socket.on 'userplaylist', (msg) ->
      if msg.token? and discordAuth[msg.token]? and msg.action?
        tag = discordAuth[msg.token].tag
        reply = {}
        switch msg.action
          when "save"
            if not msg.savename? and not msg.filters?
              return
            if not userPlaylists[tag]?
              userPlaylists[tag] = {}
            userPlaylists[tag][msg.savename] = {
              filters: msg.filters
            }
            reply.selected = msg.savename
            saveUserPlaylists()
          when "load"
            if not msg.loadname?
              return
            if not userPlaylists[tag]?[msg.loadname]?
              return
            reply.loadname = msg.loadname
            reply.selected = msg.loadname
            reply.filters = userPlaylists[tag][msg.loadname].filters
          when "del"
            if not msg.delname?
              return
            if not userPlaylists[tag]?[msg.delname]?
              return
            delete userPlaylists[tag][msg.delname]
            saveUserPlaylists()
        reply.list = []
        if userPlaylists[tag]?
          for name, upl of userPlaylists[tag]
            reply.list.push name
        socket.emit 'userplaylist', reply

    socket.on 'opinion', (msg) ->
      if msg.token? and discordAuth[msg.token]? and msg.id? and playlist[msg.id]?
        tag = discordAuth[msg.token].tag
        if msg.set? and ((msg.set == 'none') or constants.opinions[msg.set])
          needsSave = false
          if (msg.set == 'none') and opinions[msg.id]? and opinions[msg.id][tag]?
            delete opinions[msg.id][tag]
            needsSave = true
          else if constants.opinions[msg.set]
            if opinions[msg.id]?
              if opinions[msg.id][tag] != msg.set
                opinions[msg.id][tag] = msg.set
                needsSave = true
            else
              opinions[msg.id] = {}
              opinions[msg.id][tag] = msg.set
              needsSave = true
          if needsSave
            updateOpinion(lastPlayed)
            saveOpinions()
            if msg.src == 'dashboard'
              strs = calcEntryStrings(lastPlayed)
              requestDashboardRefresh()
              checkAutoskip()
              name = getNickname(tag)
              # logOutput("MTV: _(Dashboard)_ #{name} `#{msg.set}`: #{strs.description}") # only if echoEnabled?

        feeling = opinions[msg.id]?[tag]
        if not feeling?
          feeling = "none"
        reply =
          id: msg.id
          tag: tag
          opinion: feeling
        socket.emit 'opinion', reply
        return

    socket.on 'convertplaylist', (msg) ->
      console.log "convertplaylist: ", msg
      if msg.token? and discordAuth[msg.token]? and msg.list?
        reply = await convertYoutubePlaylist([], msg.list)
        socket.emit 'convertplaylist', reply
        return

  app.get '/', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/dashboard.html", "utf8")
    discordClientID = secrets.discordClientID
    if not discordClientID?
      discordClientID = "0"
    html = html.replace(/!CLIENT_ID!/, discordClientID)
    res.send(html)

  app.get '/oauth', (req, res) ->
    if req.query? and req.query.code?
      processOAuth(req.query.code).then (token) ->
        if token? and (token.length > 0)
          res.redirect("/?token=#{token}")
        else
          res.redirect('/')
    else
      res.redirect('/')

  app.get '/help', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/help.html", "utf8")
    res.send(html)

  app.get '/cast', (req, res) ->
    html = fs.readFileSync("#{__dirname}/../web/cast.html", "utf8")
    res.send(html)

  app.get '/play', (req, res) ->
    soloID = req.query.solo
    if soloID? and (soloID == 'new')
      loop
        soloID = randomShortString()
        if not soloSessions[soloID]?
          break
      url = "/play?solo=#{soloID}"
      for k,v of req.query
        url += "&#{encodeURIComponent(k)}=#{encodeURIComponent(v)}"
      res.redirect(url)
      return
    html = fs.readFileSync("#{__dirname}/../web/play.html", "utf8")
    discordClientID = secrets.discordClientID
    if not discordClientID?
      discordClientID = "0"
    html = html.replace(/!CLIENT_ID!/, discordClientID)
    res.send(html)

  app.get '/p(laylist)?/:nickname/:playlist', (req, res) ->
    user = getUserFromNickname(req.params.nickname)
    soloId = "new"
    if req.query? and req.query.solo?
      soloId = req.query.solo
    p = userPlaylists[user]?[req.params.playlist]
    if p?
      res.redirect("/play?solo=#{encodeURIComponent(soloId)}&name=#{encodeURIComponent(req.params.playlist)}&filters=#{encodeURIComponent(p.filters)}")
    else
      res.redirect("/play?solo=#{encodeURIComponent(soloId)}")

  app.get '/playlist', youtubeSoloRedirect
  app.get '/watch', youtubeSoloRedirect

  app.get '/m(irror)?/:soloid', (req, res) ->
    res.redirect("/play?solo=#{encodeURIComponent(req.params.soloid)}&mirror=1")

  app.get '/p', (req, res) ->
    res.redirect('/#lists')

  app.get '/s(olo)?', (req, res) ->
    res.redirect('/play?solo=new')

  app.get '/info/playlist', (req, res) ->
    updateOpinions(playlist, true)
    updateNicknames(playlist, true)
    res.type('application/json')
    res.send(JSON.stringify(playlist, privacyReplacer, 2))

  app.get '/info/userplaylists', (req, res) ->
    publicPlaylists = []
    for tag, userMap of userPlaylists
      nickname = nicknames[tag]
      if not nickname?
        continue
      for playlistName, pl of userMap
        if pl.filters.match(/^private\b/) or pl.filters.match(/[\r\n]private\b/)
          # private!
          continue
        publicPlaylists.push {
          nickname: nickname
          name: playlistName
          filters: pl.filters
        }
    res.type('application/json')
    res.send(JSON.stringify(publicPlaylists, null, 2))

  app.get '/info/queue', (req, res) ->
    updateOpinions(queue)
    updateNicknames(queue)
    res.type('application/json')
    res.send(JSON.stringify(queue, privacyReplacer, 2))

  app.get '/info/history', (req, res) ->
    updateOpinions(history)
    updateNicknames(history)
    res.type('application/json')
    res.send(JSON.stringify(history, privacyReplacer, 2))

  app.get '/info/solo/:id', (req, res) ->
    res.type('application/json')
    if soloInfo[req.params.id]?
      jsonText = JSON.stringify(soloInfo[req.params.id], null, 2)
    else
      jsonText = "false"
    res.send(jsonText)

  app.get '/info/user', (req, res) ->
    if req.query? and req.query.user?
      userInfo = calcUserInfo(req.query.user)
      res.type('application/json')
      res.send(JSON.stringify(userInfo, privacyReplacer, 2))
    else
      res.send("supply a user")

  app.get '/info/opinions', (req, res) ->
    if req.query? and req.query.user?
      userOpinions = calcUserOpinions(req.query.user)
      res.type('application/json')
      res.send(JSON.stringify(userOpinions, null, 2))
    else
      res.send("supply a user")

  app.get '/info/labels', (req, res) ->
    labels = {}
    for user, company of companies
      nickname = getNickname(user)
      labels[nickname] = company
    res.type('application/json')
    res.send(JSON.stringify(labels, null, 2))

  app.get '/info/other', (req, res) ->
    other = calcOther()
    res.type('application/json')
    res.send(JSON.stringify(other, null, 2))

  app.get '/info/output', (req, res) ->
    res.type('application/json')
    res.send(JSON.stringify(output, null, 2))
    if req.query? && req.query.secret?
      if req.query.secret == secrets.cmd
        output = []
      else
        console.log "Bad secret, not clearing output array"

  app.use(bodyParser.json())
  app.post '/cmd', (req, res) ->
    console.log req.body
    if req.body? && req.body.cmd?
      if req.body.secret != secrets.cmd
        res.send("MTV: bad secret")
        return

      args = req.body.cmd.replace(/\n/g, " / ").split(/\s+/g)
      console.log "cmd : '#{req.body.cmd}'"
      console.log "args: " + JSON.stringify(args)
      user = req.body.user
      user ?= 'Anonymous'
      response = await run(args, user)
      console.log "CMD: #{response}"
      res.send(response)
      return
    res.send("MTV: wat")

  app.use(express.static('web'))

  host = '127.0.0.1'
  if argv.length > 0
    host = '0.0.0.0'

  http.listen 3003, host, ->
    console.log("listening on #{host}:3003")

module.exports = main
