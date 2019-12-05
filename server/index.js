const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on('Add-room', function(msg){
    io.emit('Add-room', msg);
  });
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});