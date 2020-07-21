import React from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import Alerts from './components/Alerts';
import Users from './components/Users';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import './App.scss';

const socket = io('http://localhost:8000');

function App({ user }) {
  return (<div>
    <Alerts />
    <Users />
    {user.login && <div className="App">
      <ChatList socket={socket} />
      <div className="divider"></div>
      <Chat socket={socket} />
    </div>}
  </div>);
}

const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps, null)(App);
