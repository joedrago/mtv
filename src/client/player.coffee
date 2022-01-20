# Plyr = require 'plyr'

class Player
  constructor: (domID) ->
    @ended = null
    @plyr = new Plyr(domID)
    @plyr.on 'ready', (event) =>
      @plyr.play()
    @plyr.on 'ended', (event) =>
      if @ended?
        @ended()

  play: (id, startSeconds = undefined, endSeconds = undefined) ->
    if(startSeconds? and (startSeconds > 0))
      @plyr.mtvStart = startSeconds
    else
      @plyr.mtvStart = undefined
    if(endSeconds? and (endSeconds > 0))
      @plyr.mtvEnd = endSeconds
    else
      @plyr.mtvEnd = undefined
    @plyr.source =
      type: 'video',
      title: 'MTV',
      sources: [
        # {
        #   src: 'https://some.mp4',
        #   type: 'video/mp4',
        # }
        {
          src: id
          provider: 'youtube'
        }
      ]

  togglePause: ->
    if @plyr.paused
      @plyr.play()
    else
      @plyr.pause()

module.exports = Player
