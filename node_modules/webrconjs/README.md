WebRcon
============
RCON over WebSocket client library and command line interface.

* Supported games: [Rust](http://playrust.com)
* Supported platforms: node.js and any modern browser (CommonJS, AMD, shim)

Usage
-----
```js
var WebRcon = require('webrconjs') // node.js only

// Create a new client:
var rcon = new WebRcon('127.0.0.1', 28025)

// Handle events:
rcon.on('connect', function() {
    console.log('CONNECTED')
    
    // Run a command once connected:
    rcon.run('echo hello world!', 0)
})
rcon.on('disconnect', function() {
    console.log('DISCONNECTED')
})
rcon.on('message', function(msg) {
    console.log('MESSAGE:', msg)
})
rcon.on('error', function(err) {
    console.log('ERROR:', err)
})

// Connect by providing the server's rcon.password:
rcon.connect('1234')
```

Browser usage
-------------
```html
<script src="webrcon.js"></script>
<script>
var WebRcon = dcodeIO.WebRcon;

... actually the same as above ....
</script>
```

Also works as an AMD module.

Command line usage
------------------
`npm -g install webrconjs`

```
Usage: webrcon <ip> [port] [password]

Examples:
  webrcon 127.0.0.1 27015 p4ssw0rd  Connects to the local machine
```

**License:** [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
