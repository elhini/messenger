import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { appendAlert, setUser } from '../../actions';
import { req } from '../../utils/async';
import './Users.scss';

function Users({ appendAlert, user, setUser }) {
    const [formType, setFormType] = useState('login');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (user.login) return;
        setStatus('checking');
        req('GET', 'users/check-auth', null, user => {
            setUser(user);
        }, err => appendAlert({ text: err, style: 'error' }), () => setStatus(''));
    }, [user.login]); // eslint-disable-line react-hooks/exhaustive-deps

    var isRegister = formType === 'register';
  
    function onSend(e) {
        e.preventDefault();
        let userToSend = {login: login, password: password};
        setStatus('sending');
        req('POST', isRegister ? 'users/register' : 'users/login', userToSend, res => {
            setUser(res);
            setLogin('');
            setPassword('');
            var madeAction = isRegister ? 'registered' : 'logged in';
            appendAlert({ text: 'You have successfully ' + madeAction, style: 'success' });
        }, err => appendAlert({ text: err, style: 'error' }), () => setStatus(''));
    }

    function clearUser() {
        setStatus('logging-out');
        req('POST', 'users/logout', null, res => {
            setUser({});
        }, err => appendAlert({ text: err, style: 'error' }), () => setStatus(''));
    }

    var isChecking = status === 'checking';
    var isLoggingOut = status === 'logging-out';
    var isSending = status === 'sending';
    var btnDefaultText = isRegister ? 'Register' : 'Log in';
    var btnSendingText = isRegister ? 'Registering...' : 'Logging in...';
    var formTypes = [
        {name: 'login', text: 'Log in'},
        {name: 'register', text: 'Register'}
    ];
    return isChecking ? 'Checking auth...' : 
    <div className="Users">
        {user.login ? <div className="logged-as">
            Logged as <b>{user.login}</b> 
            <button disabled={isLoggingOut} onClick={clearUser}>{isLoggingOut ? 'Logging out...' : 'Log out'}</button>
        </div> : 
        <div>{formTypes.map(t => 
            <label key={t.name}><input type="radio" checked={formType === t.name} onChange={e => setFormType(t.name)} /> {t.text}</label>
        )}</div>}
        {user.login ? null : 
        <form onSubmit={e => onSend(e)}>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="login" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
            <button disabled={isSending}>{isSending ? btnSendingText : btnDefaultText}</button>
        </form>}
    </div>;
}

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = dispatch => ({
    appendAlert: alert => dispatch(appendAlert(alert)),
    setUser: user => dispatch(setUser(user))
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);