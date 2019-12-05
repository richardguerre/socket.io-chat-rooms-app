import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Switch, Link, useParams } from 'react-router-dom';
import { createStore, useStore } from 'react-hookstore';
import io from 'socket.io-client';

import './App.css';

const socket = io('http://localhost:3001/');

function App() {
  createStore('rooms', {});

  return (
    <div className="App">
      <h1>Multi-room chat app</h1>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/chat/:room" component={Chatroom}/>
        </Switch>
      </Router>
    </div>
  );
}

function Home() {
  const [ rooms, setRooms ] = useStore('rooms');
  const [ roomName, setName ] = useState('');
  const allRooms = Object.keys(rooms);

  const handleSubmit = (e) => {
    // e.preventDefault();
    console.log("sent room "+ roomName)
    socket.emit('Add-room', {[roomName]: []})
    setName('')
  }

  socket.on('Room-change', (room) => {
    // console.log('received room');
    // console.log(room);
    setRooms({
      ...rooms,
      ...room
    })
  })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Add chat room: 
          <input type="text" onChange={ (e) => setName(e.target.value)} value={roomName}/>
          <input type="submit" value="Add"/>
        </label>
      </form>
      <ul>
        {allRooms.map( (room) => {
          return <li key={room}><Link to={`/chat/${room}`}>{room}</Link></li>
        })}
      </ul>
    </div>
  )
}

function Chatroom() {
  const [ rooms, setRooms ] = useStore('rooms');
  const {room} = useParams();

  socket.on('Msgs-change', (msg) => {
    console.log('received msg');
    console.log(msg);
    setRooms(msg);
  })

  return (
    <div>
      <h2>You are in chat {room}</h2>
      {rooms[room].map( (msg) => {
        return (<div key={msg}>
          {msg}
        </div>)
      })}
      <AddMessage room={room}/>
    </div>
  )
}

function AddMessage({room}){
  const [ msg, setMsg ] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("sent message " + msg + " in room " + room)
    socket.emit('Add-msg', {room: room, message: msg})
    setMsg('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          <input type="text" value={msg} onChange={ e => setMsg(e.target.value) }/>
          <input type="submit" value="Send"/>
        </label>
      </form>
    </div>
  )
}


export default App;
