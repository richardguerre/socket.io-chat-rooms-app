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
          <Route path="/chat/:room" component={Chat}/>
        </Switch>
      </Router>
    </div>
  );
}

function Home() {
  const [ rooms, setRooms ] = useStore('rooms');
  const [ roomName, setName ] = useState('roomName', '');
  const allRooms = Object.keys(rooms);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("sent room "+ roomName)
    socket.emit('Add-room', {[roomName]: []})
  }

  socket.on('Add-room', (room) => {
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
          <input type="text" onChange={ (e) => setName(e.target.value)} />
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

function Chat() {
  const {room} = useParams();

  return (
    <div>
      <h2>You are on chat {room}</h2>
    </div>
  )
}


export default App;
