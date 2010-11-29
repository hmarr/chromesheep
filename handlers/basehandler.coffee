jsdom = require 'jsdom'
libRequest = require 'request'

JQUERY_PATH = 'chrome-extension/js/jquery.min.js'

class BaseHandler
  getPage: (url, sessionCookies, callback) ->
    headers = Cookie: ("#{k}=#{v}" for k, v of sessionCookies).join ';'
    libRequest uri: url, headers: headers, (error, response, body) ->
      if not error and response.statusCode == 200
        window = jsdom.jsdom(body).createWindow()
        jsdom.jQueryify window, JQUERY_PATH, callback

exports.BaseHandler = BaseHandler
