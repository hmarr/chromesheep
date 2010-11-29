(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  $(function() {
    var ChromeSheep, _i, _len, _ref, account, accounts, injectAccount, setCookie, setStatus, status, updateNoAccountsMessage;
    ChromeSheep = chrome.extension.getBackgroundPage().ChromeSheep;
    setCookie = function(cookie) {
      var url;
      url = cookie.secure ? "https://" : "http://";
      url += cookie.domain + (cookie.path || '');
      chrome.cookies.remove({
        url: url,
        name: cookie.name
      });
      return chrome.cookies.set({
        url: url,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        httpOnly: false
      });
    };
    setStatus = function(message) {
      var messageBox;
      messageBox = $('#status');
      return messageBox.html(message);
    };
    updateNoAccountsMessage = function() {
      return $('.account-item').length === 0 ? $('#no-accounts-message').show() : $('#no-accounts-message').hide();
    };
    injectAccount = function(account) {
      var accountsBox, actions, container, loadLink, removeLink;
      container = $('<div />');
      container.text("" + (account.name) + " (" + (account.user) + ")");
      container.addClass('account-item');
      loadLink = $('<a />');
      loadLink.text('Load');
      loadLink.addClass('button');
      loadLink.click(function() {
        var _ref, key, val;
        _ref = account.cookies;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          setCookie({
            domain: account.domain,
            name: key,
            value: val
          });
        }
        return chrome.tabs.create({
          url: account.siteUrl
        });
      });
      removeLink = $('<a />');
      removeLink.text('Remove');
      removeLink.addClass('button');
      removeLink.click(function() {
        var _i, _len, _ref, _result, a, accounts;
        accounts = ChromeSheep.getAccounts();
        accounts = (function() {
          _result = []; _ref = accounts;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            a = _ref[_i];
            if (a.sessionId !== account.sessionId) {
              _result.push(a);
            }
          }
          return _result;
        })();
        ChromeSheep.setAccounts(accounts);
        container.remove();
        return updateNoAccountsMessage();
      });
      actions = $('<span />');
      actions.addClass('actions');
      actions.append(loadLink);
      container.append(actions);
      accountsBox = $('#accounts');
      accountsBox.append(container);
      accountsBox.append($('<div />').addClass('clearfix'));
      return updateNoAccountsMessage();
    };
    $('#clear-accounts').click(function() {
      ChromeSheep.clearAccounts();
      return $('.account-item').remove();
    });
    accounts = ChromeSheep.getAccounts();
    _ref = accounts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      account = _ref[_i];
      injectAccount(account);
    }
    updateNoAccountsMessage();
    status = ChromeSheep.connected ? 'Connected to server' : 'Cannot connect to server';
    return setStatus(status);
  });
}).call(this);
