$ ->
  ChromeSheep = chrome.extension.getBackgroundPage().ChromeSheep

  setCookie = (cookie) ->
    url = if cookie.secure then "https://" else "http://"
    url += cookie.domain + (cookie.path or '')

    chrome.cookies.remove
      url: url
      name: cookie.name

    chrome.cookies.set
      url: url
      name: cookie.name
      value: cookie.value
      domain: cookie.domain
      httpOnly: false

  setStatus = (message) ->
    messageBox = $ '#status'
    messageBox.html message

  updateNoAccountsMessage = ->
    if $('.account-item').length == 0
      $('#no-accounts-message').show()
    else
      $('#no-accounts-message').hide()

  # Inject a new account element into the accounts box in the popup
  injectAccount = (account) ->
    container = $ '<div />'
    container.text "#{account.name} (#{account.user})"
    container.addClass 'account-item'

    loadLink = $ '<a />'
    loadLink.text 'Load'
    loadLink.addClass 'button'
    loadLink.click ->
      for key, val of account.cookies
        setCookie
          domain: account.domain
          name: key
          value: val
      chrome.tabs.create url: account.siteUrl

    removeLink = $ '<a />'
    removeLink.text 'Remove'
    removeLink.addClass 'button'
    removeLink.click ->
      accounts = ChromeSheep.getAccounts()
      accounts = (a for a in accounts when a.sessionId != account.sessionId)
      ChromeSheep.setAccounts accounts
      container.remove()
      updateNoAccountsMessage()

    actions = $ '<span />'
    actions.addClass 'actions'
    actions.append loadLink
    # Not sure about the remove action, hide it for now
    #actions.append removeLink

    container.append actions

    accountsBox = $ '#accounts'
    accountsBox.append container
    accountsBox.append $('<div />').addClass('clearfix')

    updateNoAccountsMessage()

  $('#clear-accounts').click ->
    ChromeSheep.clearAccounts()
    $('.account-item').remove()

  accounts = ChromeSheep.getAccounts()
  for account in accounts
    injectAccount account

  updateNoAccountsMessage()

  status = if ChromeSheep.connected
    'Connected to server'
  else
    'Cannot connect to server'
  setStatus status
