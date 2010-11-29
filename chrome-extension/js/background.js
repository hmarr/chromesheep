(function() {
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  window.ChromeSheep = {
    connected: false,
    start: function() {
      this.socket = new WebSocket('ws://127.0.0.1:8181');
      this.socket.onopen = __bind(function(event) {
        return (this.connected = true);
      }, this);
      this.socket.onmessage = __bind(function(event) {
        var accounts;
        accounts = this.getAccounts();
        accounts.push(JSON.parse(event.data));
        return this.setAccounts(accounts);
      }, this);
      return (this.socket.onclose = __bind(function(event) {
        this.connected = false;
        return setTimeout(this.start.bind(this), 100);
      }, this));
    },
    getAccounts: function() {
      return JSON.parse(localStorage.getItem('accounts') || '[]');
    },
    setAccounts: function(accounts) {
      return localStorage.setItem('accounts', JSON.stringify(accounts));
    },
    clearAccounts: function() {
      return this.setAccounts([]);
    }
  };
}).call(this);
