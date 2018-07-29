const express = require('express');
const sockjs = require('sockjs');
const http = require('http');
const redis = require('redis');

let publisher = redis.createClient();
publisher.auth('de53493ee033fd25f3e72ebf1c677b30');

//sockjs server
let sockjs_opts = {sockjs_url : "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};
let sockjs_chat = sockjs.createServer(sockjs_opts);

sockjs_chat.on('connection',function(conn){
    console.log('Socket conn success');
    let browser = redis.createClient();
    browser.auth('de53493ee033fd25f3e72ebf1c677b30');
    browser.subscribe('chat_channel');

    //when a message is received send it to browser
    browser.on('message',function(channel,message){
        conn.write(message);
    });

    //when a new message is received from browser publish it
    conn.on('data',function(message){
        publisher.publish('chat_channel',message);
    });
});

let app = express();
let server = http.createServer(app);

sockjs_chat.installHandlers(server,{prefix:'/chat'});
console.log(' [*] Listening on 0.0.0.0:9001' );
server.listen(9001, '0.0.0.0');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});






