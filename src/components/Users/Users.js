import React, { useState } from 'react';
import { connect } from 'react-redux';
import { appendAlert, setUser } from '../../actions';
import { req } from '../../utils/async';
import './Users.scss';

function Users({ appendAlert, user, setUser }) {
    const [formType, setFormType] = useState('login');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    var isRegister = formType === 'register';
  
    function onSend(e) {
        e.preventDefault();
        let userToSend = {login: login, password: password};
        setStatus('sending');
        req('POST', isRegister ? 'users/register' : 'users/login', userToSend, res => {
            setStatus('');
            setUser(res);
            if (!res.error) {
                setLogin('');
                setPassword('');
                var madeAction = isRegister ? 'registered' : 'logged in';
                appendAlert({ text: 'You have successfully ' + madeAction, style: 'success'});
            }
        }, appendAlert);
    }

    var isSending = status === 'sending';
    var btnDefaultText = isRegister ? 'Register' : 'Log in';
    var btnSendingText = isRegister ? 'Registering...' : 'Logging in...';
    var formTypes = [
        {name: 'login', text: 'Log in'},
        {name: 'register', text: 'Register'}
    ];
    return <div className="Users">
        {user.login ? <div>Logged as <b>{user.login}</b> <button onClick={e => setUser({})}>Log out</button></div> : 
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