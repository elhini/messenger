import React from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { getApiURL } from './utils/url';
import Alerts from './components/Alerts';
import Users from './components/Users';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import './App.scss';

const socket = io(getApiURL());

function App({ user }) {
  return (<>
    <Alerts />
    <Users />
    {user.login && <div className="App">
      <ChatList socket={socket} />
      <div className="divider"></div>
      <Chat socket={socket} />
    </div>}
  </>);
}

const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps, null)(App);
