import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { appendAlert, setUsers, setUser } from '../../actions';
import { req } from '../../utils/async';
import { getParamValue } from '../../utils/url';
import './Users.scss';

function Users({ appendAlert, users, setUsers, user, setUser }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (users.length) {
            return;
        }
        req('GET', 'users', null, res => {
            setUsers(res);
            if (res.length) {
                var login = getParamValue('login');
                var user = login ? res.find(u => u.login === login) : res[0];
                setUser(user);
            }
        });
    });
  
    function onSend(e) {
        e.preventDefault();
        let newUser = {login: login, password: password, registrationDate: (new Date()).toISOString()};
        setStatus('sending');
        req('POST', 'users/register', newUser, res => {
            setStatus('');
            if (!res.error) {
                setUsers([...users, res]);
                setLogin('');
                setPassword('');
                appendAlert({ text: 'User has been added', style: 'success'});
            }
        }, appendAlert);
    }

    var isSending = status === 'sending';
    return <div className="Users">
        <span>Users:</span>
        <ul>{users.map(u => 
            <li key={u._id}>
                <a href="/" className={user.login === u.login ? 'active' : ''} onClick={e => {
                    e.preventDefault();
                    setUser(u);
                }}>{u.login}</a>
            </li>
        )}</ul>
        <form onSubmit={e => onSend(e)}>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="login" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
            <button disabled={isSending}>{isSending ? 'Creating...' : 'Create'}</button>
        </form>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user,
    users: state.users.list
});

const mapDispatchToProps = dispatch => ({
    appendAlert: alert => dispatch(appendAlert(alert)),
    setUser: user => dispatch(setUser(user)),
    setUsers: users => dispatch(setUsers(users))
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);