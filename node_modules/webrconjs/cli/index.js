var readline = require('readline'),
    util = require('util'),
    yargs = require('yargs'),
    chalk = require('chalk'),
    WebRcon = require('../')

exports.main = function(argv) {
    argv = yargs(argv)
        .usage('Usage: webrcon <ip> [port] [password]')
        .demand(1)
        .example('webrcon 127.0.0.1 27015 p4ssw0rd', 'Connects to the local machine')
        .argv
    
    var ip = argv._[0],
        port = argv._[1] || 27015,
        pass = argv._[2] || '',
        rcon = null
        
    process.stdout.write("\x1Bc");

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.on('line', function(line) {
        process.stdout.write('\n')
        rl.prompt()
        if (rcon)
            rcon.run(line)
    })
    rl.on('close', function() {
        return process.exit(1)
    })
    var exitOnSigint = false
    rl.on('SIGINT', function() {
        if (exitOnSigint)
            return exit()
        exitOnSigint = true
        rl.clearLine()
        rl.question('Do you really want to exit? [y] ', function(answer) {
            exitOnSigint = false
            if (answer === '' || answer.match(/^y(es)?$/i))
                exit()
            else
                rl.output.write(chalk.cyan('> '))
        })
    })
        
    function print(type, args) {
        var t = Math.ceil((rl.line.length + 3) / process.stdout.columns);
        var text = util.format.apply(console, args);
        rl.output.write("\n\x1B[" + t + "A\x1B[0J");
        rl.output.write(text + "\n");
        rl.output.write(Array(t).join("\n\x1B[E"));
        rl._refreshLine();
    };
    
    console.log = function() {
        print("log", arguments);
    };
    console.warn = function() {
        print("warn", arguments);
    };
    console.info = function() {
        print("info", arguments);
    };
    console.error = function() {
        print("error", arguments);
    };
    
    function connect() {
        console.log(chalk.cyan('connecting to ' + ip + ':' + port + ' ...'))
        rcon = new WebRcon(ip, port)
        rcon.on('connect', function() {
            console.log(chalk.cyan("connected"))
            rl.setPrompt(chalk.cyan('> '), 2)
            rl.resume()
            rl.prompt()
        })
        rcon.on('disconnect', function() {
            console.log(chalk.cyan('disconnected'))
            rcon = null
        })
        rcon.on('message', function(message) {
            console.log(message.message)
        })
        rcon.on('error', function(err) {
            console.error(chalk.red('error:'), err)
            rcon = null
        })
        rcon.connect(pass)
    }
    
    function exit() {
        rl.pause()
        if (rcon)
            rcon.disconnect()
        rcon = null
        rl.close() // exits
    }
    
    if (!pass) {
        exitOnSigint = true
        rl.question('rcon.password: ', function(answer) {
            exitOnSigint = false
            pass = answer
            rl.pause()
            connect()
        })
    } else {
        rl.pause()
        connect()
    }
}
