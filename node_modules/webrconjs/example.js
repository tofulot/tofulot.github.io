var WebRcon = require('.')

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
