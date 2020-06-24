import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setUsers, setUser } from '../../actions';
import { req } from '../../utils/async';
import './Users.scss';

function Users({ users, setUsers, user, setUser }) {
    const [login, setLogin] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (users.length) {
            return;
        }
        req('GET', 'users', null, res => {
            setUsers(res);
        });
    });
  
    function onSend(e) {
        e.preventDefault();
        let newUser = {login: login, name: name, registrationDate: (new Date()).toISOString()};
        setStatus('sending');
        req('POST', 'users', newUser, res => {
            setUsers([...users, res]);
            setLogin(''); 
            setName(''); 
            setStatus('');
        });
    }

    var isSending = status === 'sending';
    return <div className="Users">
        <span>Users:</span>
        <ul>{users.map(u => 
            <li key={u._id}>
                <a href="/" className={user === u.login ? 'active' : ''} onClick={e => {
                    e.preventDefault();
                    setUser(u.login);
                }}>{u.login}</a>
            </li>
        )}</ul>
        <form className="form" onSubmit={e => onSend(e)}>
            <input type="text" className="loginInput" value={login} onChange={e => setLogin(e.target.value)} placeholder="login" />
            <input type="text" className="nameInput" value={name} onChange={e => setName(e.target.value)} placeholder="name" />
            <button className="btn" disabled={isSending}>{isSending ? 'Creating...' : 'Create'}</button>
        </form>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user.login,
    users: state.users.list
});

const mapDispatchToProps = dispatch => ({
    setUser: user => dispatch(setUser(user)),
    setUsers: users => dispatch(setUsers(users))
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);