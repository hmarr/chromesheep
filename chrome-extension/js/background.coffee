window.ChromeSheep =
  connected: false

  start: ->
    @socket = new WebSocket 'ws://127.0.0.1:8181'

    @socket.onopen = (event) =>
      @connected = true

    @socket.onmessage = (event) =>
      accounts = @getAccounts()
      accounts.push JSON.parse event.data
      @setAccounts accounts

    @socket.onclose = (event) =>
      @connected = false
      setTimeout @start.bind(@), 100

  getAccounts: ->
    JSON.parse localStorage.getItem('accounts') || '[]'

  setAccounts: (accounts) ->
    localStorage.setItem 'accounts', JSON.stringify accounts

  clearAccounts: ->
    @setAccounts []
