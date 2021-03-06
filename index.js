var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = {}; 
io.on('connection', function(client){
	console.log('u ' + users);
	client.emit('show other', users);
	client.emit('user connected', client.id);
	client.on('connection done', function(coordx, coordy, plcol, plrad){
		console.log('c ' + client.id);
		users[client.id] = {
			x: coordx,
			y: coordy,
			col: plcol,
			rad: plrad
		}
		client.broadcast.emit('user done', coordx, coordy, plcol, plrad, client.id)
	});

	client.emit('moving', client.id);
	client.on('moving done', function(coordx, coordy){
		users[client.id].x = coordx;
		users[client.id].y = coordy;
		client.broadcast.emit('moving done', coordx, coordy, client.id)
	});
	
	client.on('disconnect', function(){
		client.broadcast.emit('user disconnected', client.id);
		delete users[client.id];
	});

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});