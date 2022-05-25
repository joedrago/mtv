filters = require '../filters'

class Player
  constructor: (domID, showControls = true) ->
    @ended = null
    options = undefined
    if not showControls
      options = { controls: [] }
    @plyr = new Plyr(domID, options)
    @plyr.on 'ready', (event) =>
      @plyr.play()
    @plyr.on 'ended', (event) =>
      if @ended?
        @ended()

    @plyr.on 'playing', (event) =>
      if @onTitle?
        @onTitle(@plyr.mtvTitle)

  play: (id, startSeconds = undefined, endSeconds = undefined) ->
    idInfo = filters.calcIdInfo(id)
    if not idInfo?
      return

    switch idInfo.provider
      when 'youtube'
        source = {
          src: idInfo.real
          provider: 'youtube'
        }
      when 'mtv'
        source = {
          src: "/videos/#{idInfo.real}.mp4"
          type: 'video/mp4'
        }
      else
        return

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
      sources: [source]

  togglePause: ->
    if @plyr.paused
      @plyr.play()
    else
      @plyr.pause()

module.exports = Player
