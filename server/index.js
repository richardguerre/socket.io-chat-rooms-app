const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

io.on('connection', function(socket){
	console.log('connected with ' + socket.id)
	{
		fs.readFile('./Database/all.json', (err, raw) => {
			if(err) throw err;
			const fileNames = JSON.parse(raw).fileNames
			fileNames.map( (fileName) => {
				fs.readFile(`./Database/${fileName}.json`, (err, data) => {
					if(err) throw err;
					console.log(JSON.parse(data));
					io.emit('Room-change', JSON.parse(data));
				})
			})
		})
		socket.on('Add-room', (roomName) => {
			fs.readFile('./Database/all.json', (err, raw) => {
				if(err) throw err;
				const all = JSON.parse(raw)
				fs.writeFile('./Database/all.json', JSON.stringify({
					fileNames : [
						...all.fileNames,
						...Object.keys(roomName)
					]
				}), (err) => {
					if(err) throw err; 
					console.log('all.json modified')
					fs.writeFile(`./Database/${Object.keys(roomName)}.json`, JSON.stringify(roomName), (err) => {
						if(err) throw err;
						console.log('added ' + Object.keys(roomName))
						fs.readFile(`./Database/${Object.keys(roomName)}.json`, (err, data) =>{
							io.emit('Room-change', data);
						})
					})
				})
			});
		});	
	}
	{
		socket.on('Add-msg', (res) => {
			fs.readFile(`./Database/${res.room}.json`, (err, raw) => {
				if(err) throw err;
				const data = JSON.parse(raw);
				fs.writeFile(`./Database/${res.room}.json`, JSON.stringify({
					[res.room]: [
						...data[res.room],
						res.message
					]
				}), (err) => {
					if(err) throw err;
					fs.readFile(`./Database/${res.room}.json`, (err, data) =>{
						io.emit('Msgs-change', JSON.parse(data));
					})
				})
			})
		})
	}
});

http.listen(3001, function(){
  console.log('listening on port: 3001');
});