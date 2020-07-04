import React from 'react';
import Alerts from './components/Alerts';
import Users from './components/Users';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import './App.scss';

function App() {
  return (<div>
    <Alerts />
    <Users />
    <div className="App">
      <ChatList />
      <div className="divider"></div>
      <Chat />
    </div>
  </div>);
}

export default App;
