import React from 'react';
import List from './components/List';
import Chat from './components/Chat';
import { connect } from 'react-redux';
import { setUser } from './actions';
import './App.css';

function App({ user, setUser, chats }) {
  var users = [];
  chats.forEach(c => c.users.forEach(u => !users.includes(u) && users.push(u)));
  users.sort((u1, u2) => u1 > u2 ? 1 : -1);
  return (<div>
    <ul className="users">
      <span>Пользователь:</span>
      {users.map(u => 
        <li key={u}><a href="/" className={user === u ? 'active' : ''} onClick={e => {
          e.preventDefault();
          setUser(u);
        }}>{u}</a></li>
      )}
    </ul>
    <div className="App">
      <List />
      <div className="divider"></div>
      <Chat />
    </div>
  </div>);
}

const mapStateToProps = state => ({
  user: state.user.login,
  chats: state.chats.list
});

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(setUser(user))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
