fs = require 'fs'
path = require 'path'
URL = require 'url'
http = require 'http'
https = require 'https'
{spawnSync} = require 'child_process'

download = (url, outputFilename, callback) ->
  return new Promise (resolve, reject) ->
    if URL.parse(url).protocol == null
      url = 'http://' + url
      req = http
    else if URL.parse(url).protocol == 'https:'
      req = https
    else
      req = http

    request = req.get url, (response) ->
      if response.statusCode == 200
        file = fs.createWriteStream(outputFilename)
        response.pipe(file)
      else
        resolve()

      response.on "end", ->
        resolve()

      request.setTimeout 30000, ->
        request.abort()
        resolve()

downloadVideo = (real, url) ->
  dstDir = path.join(__dirname, '..', 'web', 'videos')
  videoFilename = "#{real}.mp4"
  fullVideoFilename = path.join(dstDir, videoFilename)
  thumbFilename = "#{real}.jpg"
  fullThumbFilename = path.join(dstDir, thumbFilename)
  if fs.existsSync(fullVideoFilename)
    return { error: "Real ID `#{real}` already exists, bailing out." }

  try
    await download(url, fullVideoFilename)
  catch e
    return { error: "Download failed: #{e.toString()}" }

  if not fs.existsSync(fullVideoFilename)
    return { error: "Download didn't fail but the file doesn't seem to exist." }

  cmdArgs = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', fullVideoFilename]
  result = spawnSync("ffprobe", cmdArgs)

  duration = parseFloat(String(result.stdout))
  if isNaN(duration)
    fs.unlinkSync(fullVideoFilename)
    return { error: "Failed to discover duration of video. Bad file?" }
  duration = Math.ceil(duration)

  try
    fs.unlinkSync(fullThumbFilename)
  catch
    # who cares

  cmdArgs = ['-y', '-i', fullVideoFilename, '-ss', '10', '-vframes', '1', '-vf', 'scale=320:180', fullThumbFilename]
  result = spawnSync("ffmpeg", cmdArgs)

  if not fs.existsSync(fullThumbFilename)
    fs.unlinkSync(fullVideoFilename)
    return { error: "Download didn't fail but a thumbnail failed to be generated." }

  return {
    duration: duration
    thumb: "/videos/#{real}.jpg"
  }

module.exports =
  downloadVideo: downloadVideo
