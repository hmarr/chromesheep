===========
ChromeSheep
===========
:Info: FireSheep for your favourite browser
:Author: Harry Marr (http://github.com/hmarr)

`FireSheep <http://codebutler.github.com/firesheep/>`_, but not in Firefox.

It's not quite as easy to get running -- Firesheep is a native browser
extension, I looked at making one of those for Chrome but it didn't look fun at
all (NSAPI? boring!) So instead I thought I'd go buzzword crazy. Check it out:
*Node.js*, *CoffeeScript*, *WebSockets*, *HTML5 localStorage*, *jQuery*,
*CSS3*, *Chrome extension* (maybe doesn't qualify as a cool buzzword, but
whatever). Beat that, C++.

Installing and Running
======================
To get it going, install node.js (`brew install node` if you're cool, or `yaourt
-S nodejs` if you're even cooler), then grab yourself some `npm
<https://github.com/isaacs/npm>`_. Use npm to install `pcap`, `htmlparser` and
`websocket-server` then run `sudo node nodesheep-server.js` (the sudo is for
pcap, complain at Mr Pcap if you don't like it).

Node: If that doesn't work, try passing `-E` to sudo. To tell the server which
device to listen on, pass it in as the first argument: `sudo -E coffee
nodesheep-server.coffee en1`.

Now fire up Chrome, open the extensions tab (Spanner -> Tools -> Extensions),
then enable dev mode and click the 'Load unpacked extension' button the point
it to the `chrome-extension` directory in this repository (I'll stick this in
the Chrome extensions gallery at some point for easy installing, but deal with
it till then). You should get a friendly little sheep appear in the top right
corner of your Chrome window. Click him after a while to see the captured
accounts.

Writing Handlers
================
Fork the project, add a new handler into the `handlers` directory (look at
`hackernews.coffee` for an example). Import the new handler in
`nodesheep-server.coffee` and add it to the list using when creating the
`NodeSheep` instance near the bottom of the file.

