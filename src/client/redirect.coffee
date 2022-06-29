socket = null

playlistId = null

qs = (name) ->
  url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  results = regex.exec(url)
  if not results or not results[2]
    return null
  return decodeURIComponent(results[2].replace(/\+/g, ' '))

redirectError = (reason) ->
  document.getElementById('main').innerHTML = "ERROR: #{reason}"
  return

processConvert = (convertPlaylistData) ->
  playlistOutput = ""
  if convertPlaylistData?
    if Array.isArray(convertPlaylistData)
      playlistOutput = "un"
      for id in convertPlaylistData
        playlistOutput += " #{id}"

    if playlistOutput.length > 0
      playlistOutput = "ordered\n#{playlistOutput}\n"

    url = "/play?solo=new&filters=#{encodeURIComponent(playlistOutput)}"
    window.location = url
    #document.getElementById("main").innerHTML = url
  else
    return redirectError("No convert data. Are you logged into MTV?")

  return


init = ->
  discordToken = localStorage.getItem('token')
  if not discordToken?
    return redirectError("You must be logged in on <a href=\"/\">the Dashboard</a> to use this feature.")

  playlistId = qs('list')
  if not playlistId?
    return redirectError("No list detected?")

  socket = io()

  socket.on 'connect', ->
    if playlistId?
      console.log "emitting convertplaylist"
      socket.emit 'convertplaylist', { token: discordToken, list: playlistId }

  socket.on 'convertplaylist', (pkt) ->
    processConvert(pkt)

window.onload = init
