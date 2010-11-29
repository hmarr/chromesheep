BaseHandler = require('basehandler').BaseHandler

class HackerNewsHandler extends BaseHandler
  name: 'Hacker News'
  domains: ['news.ycombinator.com']
  sessionCookies: ['user']
  identifyUser: (request, sessionCookies, callback) ->
    url = "http://#{@domains[0]}/"
    @getPage url, sessionCookies, (window, jQuery) ->
      user = jQuery(jQuery('.pagetop a')[7]).text()
      callback user

exports.HackerNewsHandler = HackerNewsHandler
