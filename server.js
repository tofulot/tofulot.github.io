const WebRcon = require("webrconjs");
const express = require('express')
const PopConfig = require('./config/PopConfig.json')
const app = express()
const mysql = require('mysql');
const e = require("express");
const bcrypt = require('bcrypt')
const port = 8000

//requres / setups

app.use(express.json())

app.use(express.static('public'))

app.listen(port, () => console.log(`server started on ${port}`))

const db = mysql.createConnection({
host: 'localhost',
user: 'root',
database: 'rustserverdb'
});

db.connect((err)=>{
    if (err) {
        throw err
    }
})


//sendingdata or receiving

//create table

app.get('/createpoststable', (req, res)=>{
    let sql = 'CREATE TABLE userdata(id int AUTO_INCREMENT, email VARCHAR(255), password VARCHAR(255), PRIMARY KEY (id))'
    db.query(sql, (err, resualt)=> {
        if(err) {throw err}
        console.log(resualt)
        res.send('POSTS TABLE CREADED...')
    })
})
//add post

app.get('/addpost1', (req, res)=>{
    let post = {email: 'tofulot@gmail.com', password: '123'};
    let sql = 'INSERT INTO userdata SET ?'
    let query = db.query(sql, post, (err, result)=>{
        if(err) {throw err}
        console.log(result)
        res.send('post 1 added...')
    })
})
//select post

app.get('/getposts', (req, res)=>{
    let sql = 'SELECT * FROM posts'
    let query = db.query(sql, (err, results)=>{
        if(err) {throw err}
        console.log(results)
        res.send('post fetched')
    })
})

app.post('/users/add', async (req, res)=>{
    let sql = 'SELECT * FROM userdata'
    let query = db.query(sql, async (err, results)=>{
        const possible = results.find(account => req.body.email === account.email)
        if (possible === undefined) {
            try {

                const hashedpassword = await bcrypt.hash(req.body.password, 15)
                console.log(hashedpassword)
                let post = {email: req.body.email, password: hashedpassword};
                let sql = 'INSERT INTO userdata SET ?'
                let query = db.query(sql, post, (err, result)=>{
                    if(err) {throw err}
                    console.log(result)
                    res.status(201).send('made account')
                })
            } catch {
                res.status(500).send()
            }
        }
    })
})

app.post('/users/login', async (req, res)=>{
    //all data required is there
    const password = req.body.password
    const email = req.body.email

    let sql = 'SELECT * FROM userdata'
    let query = db.query(sql, async (err, results)=>{
        const possible = results.find(account => email === account.email)
        try {
            if (possible.email) {
                if( await bcrypt.compare(password, possible.password)) {
                    res.send('success') 
                } else {
                    res.send('wrongpassword')
                }
            } else {
                res.send('wrong email')
            }
        } catch {
            res.send('account not found')
        }
    })
})


//////////////////////////////////////POP DATA///////////////////////////////////////////

app.get('/popinfo', (req, res) => {
    PopData = []
    PopConfig.Servers.forEach((server, index) => {
        //create ui
        //actual stuff
        function End() {
            if (index === PopConfig.Servers.length-1) {
                res.status(200).json(PopData)
            }
        }
        server.connected = false;
        server.name = `${server.IP}:${server.RconPort}/${index}`
        server.rcon = new WebRcon(server.IP, server.RconPort)
        server.rcon.connect(server.RconPassword)
        server.rcon.on('connect', function () {

            server.connected = true;
            try {
                server.connected = true;
            } catch {
            }
            function getData() {
                if (server.connected === true) {
                    try {
                        server.rcon.run('serverinfo', 0);
                    } catch {
                    }
                }
            }
            getData();
        });
        server.rcon.on('message', function (msg) {
            if (typeof msg === 'object') {
                if (msg.type === 'Generic') {
                    const data = JSON.parse(msg.message)
                    // Set Discord status (No idea why it returns undefined sometimes simple fix added to prevent it.)
                    if (data.Players === undefined) {
                        return;
                    } else {
                        PopData.push(`${data.Players}/${data.MaxPlayers} (${data.Joining})`)
                        End()
                    }
                }
            }
        })
    });
})

//////////////////////////////////////POP DATA///////////////////////////////////////////