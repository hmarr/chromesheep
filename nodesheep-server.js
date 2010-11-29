(function() {
  var HackerNewsHandler, NodeSheep, events, http, pcap, sheep, utils, ws, wsPort, wsServer;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  pcap = require('pcap');
  utils = require('utils');
  http = require('http');
  events = require('events');
  ws = require('websocket-server');
  require.paths.unshift('handlers');
  HackerNewsHandler = require('hackernews').HackerNewsHandler;
  NodeSheep = function(_arg) {
    this.handlers = _arg;
    this.filter = 'tcp port 80';
    this.tracker = new pcap.TCP_tracker();
    this.tracker.on('http response body', __bind(function(session, http, data) {
      var _i, _j, _len, _len2, _ref, _ref2, _result, _result2, domain, handler, request;
      request = this.parseRequest(http.request);
      _result = []; _ref = this.handlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _result.push((function() {
          _result2 = []; _ref2 = handler.domains;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            domain = _ref2[_j];
            if (domain.toLowerCase() === request.host) {
              _result2.push((function() {
                try {
                  console.log('handling request');
                  return this.handleRequest(handler, request);
                } catch (error) {
                  console.log('Error handling request:');
                  return console.log(error);
                }
              }).call(this));
            }
          }
          return _result2;
        }).call(this));
      }
      return _result;
    }, this));
    return this;
  };
  __extends(NodeSheep, events.EventEmitter);
  NodeSheep.prototype.handleRequest = function(handler, request) {
    var _ref, key, numCookies, sessionCookies, sessionId, val;
    sessionCookies = {};
    numCookies = 0;
    _ref = request.cookies;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      if (handler.sessionCookies.indexOf(key) !== -1) {
        sessionCookies[key] = val;
      }
      numCookies += 1;
    }
    if (numCookies < handler.sessionCookies.length) {
      return null;
    }
    sessionId = handler.name + JSON.stringify(sessionCookies);
    if (this.sessionsSeen[sessionId] === true) {
      return null;
    }
    this.sessionsSeen[sessionId] = true;
    return handler.identifyUser(request, sessionCookies, __bind(function(user) {
      return this.emit('account', {
        name: handler.name,
        user: user,
        sessionId: sessionId,
        siteUrl: ("http://" + (handler.domains[0]) + "/"),
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
    var _i, _len, _ref, _ref2, cookie, cookies, name, value;
    cookies = {};
    _ref = cookieStr.split(';');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cookie = _ref[_i];
      _ref2 = (function() {
        var _j, _len2, _ref3, _result, part;
        _result = []; _ref3 = cookie.split('=');
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          part = _ref3[_j];
          _result.push(part.trim());
        }
        return _result;
      })();
      name = _ref2[0];
      value = _ref2[1];
      if (name) {
        cookies[name] = (value || '');
      }
    }
    return cookies;
  };
  NodeSheep.prototype.startCapture = function(device) {
    this.pcapSession = pcap.createSession(device, this.filter);
    this.sessionsSeen = {};
    console.log("Capturing packets on " + (this.pcapSession.device_name));
    return this.pcapSession.on('packet', __bind(function(rawPacket) {
      var packet;
      packet = pcap.decode.packet(rawPacket);
      return this.tracker.track_packet(packet);
    }, this));
  };
  sheep = new NodeSheep([new HackerNewsHandler()]);
  sheep.startCapture(process.argv[0] || '');
  wsServer = ws.createServer();
  wsServer.addListener('connection', function(conn) {
    return sheep.on('account', function(account) {
      return conn.send(JSON.stringify(account));
    });
  });
  wsPort = 8181;
  wsServer.listen(wsPort);
  console.log("Listening on port " + (wsPort));
}).call(this);
