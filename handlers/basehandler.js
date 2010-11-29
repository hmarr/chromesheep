(function() {
  var BaseHandler, JQUERY_PATH, jsdom, libRequest;
  var __hasProp = Object.prototype.hasOwnProperty;
  jsdom = require('jsdom');
  libRequest = require('request');
  JQUERY_PATH = 'chrome-extension/js/jquery.min.js';
  BaseHandler = function() {};
  BaseHandler.prototype.getPage = function(url, sessionCookies, callback) {
    var _ref, _result, headers, k, v;
    headers = {
      Cookie: (function() {
        _result = []; _ref = sessionCookies;
        for (k in _ref) {
          if (!__hasProp.call(_ref, k)) continue;
          v = _ref[k];
          _result.push("" + (k) + "=" + (v));
        }
        return _result;
      })().join(';')
    };
    return libRequest({
      uri: url,
      headers: headers
    }, function(error, response, body) {
      var window;
      if (!error && response.statusCode === 200) {
        window = jsdom.jsdom(body).createWindow();
        return jsdom.jQueryify(window, JQUERY_PATH, callback);
      }
    });
  };
  exports.BaseHandler = BaseHandler;
}).call(this);
