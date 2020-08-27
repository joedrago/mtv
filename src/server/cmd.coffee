fs = require 'fs'
path = require 'path'
http = require 'http'

main = (argv) ->
  opts = require('minimist')(argv, {
    string: ['u']
    boolean: ['v']
    alias:
      verbose: 'v'
      user: 'u'
  })

  user = opts.u
  if not user
    user = 'Anonymous'

  secret = null
  secretsFilename = path.join(path.dirname(fs.realpathSync(__filename)), '../secrets.json')
  if fs.existsSync(secretsFilename)
    if opts.verbose
      console.log "Found: #{secretsFilename}"
    secrets = JSON.parse(fs.readFileSync(secretsFilename, "utf8"))
    secret = secrets.cmd
    if opts.verbose
      console.log "Using cmd secret: #{secret}"

  fullCommand = opts._.join(" ")

  if fullCommand.length == 0
    console.log "Please supply a command."
    return

  body =
    user: user
    cmd: fullCommand
  if secret?
    body.secret = secret

  if opts.verbose
    console.log JSON.stringify(body, null, 2)

  req = http.request {
    host: 'localhost',
    path: '/cmd',
    port: '3003',
    method: 'POST'
    headers:
      'Content-Type': 'application/json'
  }, (response) ->
    str = ''
    response.on 'data', (chunk) ->
      str += chunk
    response.on 'end', ->
      console.log(str);

  req.write(JSON.stringify(body))
  req.end()

module.exports = main
