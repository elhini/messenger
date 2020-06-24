import React from 'react';
import Users from './components/Users';
import List from './components/List';
import Chat from './components/Chat';
import './App.scss';

function App({ users, setUsers, user, setUser }) {
  return (<div>
    <Users />
    <div className="App">
      <List />
      <div className="divider"></div>
      <Chat />
    </div>
  </div>);
}

export default App;
