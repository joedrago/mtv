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
    html += """
      <div> * <a target="_blank" href="#{url}">#{title}</a> <span class="user">(#{e.user})</span></div>

    """
  document.getElementById("main").innerHTML = html


showList = (url, isMap = false) ->
  document.getElementById('main').innerHTML = "history"
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

init = ->
  window.showHistory = showHistory
  window.showQueue = showQueue
  window.showPlaylist = showPlaylist

  showHistory()

  console.log "initialized!"

window.onload = init
