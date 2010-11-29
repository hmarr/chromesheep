(function() {
  var BaseHandler, HackerNewsHandler;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  BaseHandler = require('basehandler').BaseHandler;
  HackerNewsHandler = function() {
    return BaseHandler.apply(this, arguments);
  };
  __extends(HackerNewsHandler, BaseHandler);
  HackerNewsHandler.prototype.name = 'Hacker News';
  HackerNewsHandler.prototype.domains = ['news.ycombinator.com'];
  HackerNewsHandler.prototype.sessionCookies = ['user'];
  HackerNewsHandler.prototype.identifyUser = function(request, sessionCookies, callback) {
    var url;
    url = ("http://" + (this.domains[0]) + "/");
    return this.getPage(url, sessionCookies, function(window, jQuery) {
      var user;
      user = jQuery(jQuery('.pagetop a')[7]).text();
      return callback(user);
    });
  };
  exports.HackerNewsHandler = HackerNewsHandler;
}).call(this);
