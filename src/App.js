import React from 'react';
import { connect } from 'react-redux';
import Alerts from './components/Alerts';
import Users from './components/Users';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import './App.scss';

function App({ user }) {
  return (<div>
    <Alerts />
    <Users />
    {user.login && <div className="App">
      <ChatList />
      <div className="divider"></div>
      <Chat />
    </div>}
  </div>);
}

const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps, null)(App);
