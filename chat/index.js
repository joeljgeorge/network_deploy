// setting up server
var express = require("express");
var app = express();
var port = 3000;
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000, function(){
	console.log('listening on *:3000');
});


app.get("/", function(req,res){
	res.sendFile(__dirname + '/index.html');
});

// routing?
//app.use(express.static(__dirname + '/public'));


// chat


io.on('connection', function(socket){

	console.log('a user connected');
	


	socket.on('chat message', function(time,user,msg){
   		var message = time + " " + user + ": " + "\n"+ msg;
   		console.log(message);
   		io.emit('chat message', message);
  	});



	socket.on('disconnect', function(){
		console.log('user disconnected');


	});


});



io.emit('some event', { for: 'everyone' });

