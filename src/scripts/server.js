


/**
 * https://github.com/babel/example-node-server
 */


var http 		= require('http');
//var https		= require('https');
//var cors 		= require('cors')

var express 	= require('express');


//var fs 			= require("fs");

import bodyParser from "body-parser"
import SockRouter from "./lib/SockRouter"
import routes from "./routes"
import sockjs from "sockjs"
import Game from './lib/Game.js'
import path from 'path'
import { NODE_PUBLIC_PORT } from "./serverConfig"

const settings = {};

/* Express */
var app    = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(__dirname + '/../../build/assets'));
//app.use('/static', express.static(__dirname + '/../build'));
//app.use(cors());

//var expressRoutes = require("./expressRoutes")(app);

/* Socket message routing/channels */
//var channelManager = require("./channelManager");

var server;
var liveserver = sockjs.createServer({ 
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
  heartbeat_delay: 30
});

liveserver.on('connection', function(conn) {
	conn.on('data', function(message) {
		sockRouter.handleMessage(message, conn);
  });

  conn.on('close', function() {
    console.log("closed!");
    //channelManager.unsubscribeFromAll(conn);
  });
});


if (settings.ssl) {
  if (settings.ca != null) {
    var ca = settings.ca.map(function(f) { return fs.readFileSync(f); });
  }
  else {
    var ca = undefined;
  }
  server = https.createServer({
    key: fs.readFileSync(settings.key),
    cert: fs.readFileSync(settings.cert),
    ca: ca
  }, app);
  console.log("created https server");
}
else {
  server = http.createServer(app);
}

server.listen(NODE_PUBLIC_PORT, '0.0.0.0', function(){
  console.log('Express server listening on port ' + NODE_PUBLIC_PORT);
});
liveserver.installHandlers(server, {prefix:'/live'});

app.get('/',
    function(req,res)
    {
        console.log("DIR NAME", __dirname + "/../../build");
        //res.send("express");
        res.sendFile(path.join(__dirname + '/client/index.html'));
    }
);

const gameList = [];
gameList.push(new Game());

var sockRouter = new SockRouter(gameList);
routes(sockRouter);





