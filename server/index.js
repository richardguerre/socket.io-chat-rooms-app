const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

io.on('connection', function(socket){
	fs.readFile('./Database/all.json', (err, raw) => {
		if(err) throw err;
		const fileNames = JSON.parse(raw).fileNames
		fileNames.map( (fileName) => {
			fs.readFile(`./Database/${fileName}.json`, (err, data) => {
				io.emit('Add-room', JSON.parse(data));
			})
		})
	})
  socket.on('Add-room', function(msg){
		fs.readFile('./Database/all.json', (err, raw) => {
			if(err) throw err;
			const all = JSON.parse(raw)
			fs.writeFile('./Database/all.json', JSON.stringify({
				fileNames : [
					...all.fileNames,
					...Object.keys(msg)
				]
			}), (err) => {
				if(err) throw err; 
				console.log('all.json modified')
				fs.writeFile(`./Database/${Object.keys(msg)}.json`, JSON.stringify(msg), (err) => {
					if(err) throw err;
					console.log('added ' + Object.keys(msg))
				})
			})
		});
    fs.readFile(`./Database/${Object.keys(msg)}.json`, (err, data) =>{
      io.emit('Add-room', data);
    })
  });	
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});