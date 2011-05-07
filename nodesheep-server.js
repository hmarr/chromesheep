(function() {
  var HackerNewsHandler, NodeSheep, events, http, pcap, sheep, ws, wsPort, wsServer;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  pcap = require('pcap');
  http = require('http');
  events = require('events');
  ws = require('websocket-server');
  require.paths.unshift('handlers');
  HackerNewsHandler = require('hackernews').HackerNewsHandler;
  NodeSheep = (function() {
    function NodeSheep(handlers) {
      this.handlers = handlers;
      this.filter = 'tcp port 80';
      this.tracker = new pcap.TCP_tracker;
      this.tracker.on('http response body', __bind(function(session, http, data) {
        var domain, handler, request, _i, _len, _ref, _results;
        request = this.parseRequest(http.request);
        _ref = this.handlers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          handler = _ref[_i];
          _results.push((function() {
            var _j, _len2, _ref2, _results2;
            _ref2 = handler.domains;
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              domain = _ref2[_j];
              if (domain.toLowerCase() === request.host) {
                _results2.push((function() {
                  try {
                    return this.handleRequest(handler, request);
                  } catch (error) {
                    console.log('Error handling request:');
                    return console.log(error);
                  }
                }).call(this));
              }
            }
            return _results2;
          }).call(this));
        }
        return _results;
      }, this));
    }
    __extends(NodeSheep, events.EventEmitter);
    NodeSheep.prototype.handleRequest = function(handler, request) {
      var key, numCookies, sessionCookies, sessionId, val, _ref;
      sessionCookies = {};
      numCookies = 0;
      _ref = request.cookies;
      for (key in _ref) {
        val = _ref[key];
        if (handler.sessionCookies.indexOf(key) !== -1) {
          sessionCookies[key] = val;
        }
        numCookies += 1;
      }
      if (numCookies < handler.sessionCookies.length) {
        return;
      }
      sessionId = handler.name + JSON.stringify(sessionCookies);
      if (this.sessionsSeen[sessionId] === true) {
        return;
      }
      this.sessionsSeen[sessionId] = true;
      return handler.identifyUser(request, sessionCookies, __bind(function(user) {
        return this.emit('account', {
          name: handler.name,
          user: user,
          sessionId: sessionId,
          siteUrl: "http://" + handler.domains[0] + "/",
          domain: handler.domains[0],
          cookies: sessionCookies
        });
      }, this));
    };
    NodeSheep.prototype.parseRequest = function(request) {
      var cookieStr;
      cookieStr = request.headers.Cookie ? request.headers.Cookie : '';
      return {
        host: request.headers.Host,
        cookies: this.parseCookies(cookieStr),
        userAgent: request.headers['User-Agent']
      };
    };
    NodeSheep.prototype.parseCookies = function(cookieStr) {
      var cookie, cookies, name, part, value, _i, _len, _ref, _ref2;
      cookies = {};
      _ref = cookieStr.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cookie = _ref[_i];
        _ref2 = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = cookie.split('=');
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            part = _ref2[_j];
            _results.push(part.trim());
          }
          return _results;
        })(), name = _ref2[0], value = _ref2[1];
        if (name) {
          cookies[name] = value || '';
        }
      }
      return cookies;
    };
    NodeSheep.prototype.startCapture = function(device) {
      this.pcapSession = pcap.createSession(device, this.filter);
      this.sessionsSeen = {};
      console.log("Capturing packets on " + this.pcapSession.device_name);
      return this.pcapSession.on('packet', __bind(function(rawPacket) {
        var packet;
        packet = pcap.decode.packet(rawPacket);
        return this.tracker.track_packet(packet);
      }, this));
    };
    return NodeSheep;
  })();
  sheep = new NodeSheep([new HackerNewsHandler]);
  sheep.startCapture(process.argv[2] || '');
  wsServer = ws.createServer();
  wsServer.addListener('connection', function(conn) {
    return sheep.on('account', function(account) {
      return conn.send(JSON.stringify(account));
    });
  });
  wsPort = 8181;
  wsServer.listen(wsPort);
  console.log("Listening on port " + wsPort);
}).call(this);
