import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setChats, setActiveChat } from '../../actions';
import { req } from '../../utils/async';
import './NewChat.scss'; 

function NewChat({ socket, search, user, chats, setChats, setActiveChat }) {
    const [foundUsers, setFoundUsers] = useState([]);
    const [activeUser, setActiveUser] = useState({});
    const [status, setStatus] = useState('');
    var availUsers = [];
    if (search && foundUsers.length) {
        var oldUserLogins = chats.map(c => c.users.find(u => u !== user.login));
        availUsers = foundUsers.filter(u => !oldUserLogins.includes(u.login));
    }

    useEffect(() => {
        if (!search) return;
        setStatus('loading');
        req('GET', 'users/search/' + search, null, res => {
            setStatus('');
            setFoundUsers(res);
            setActiveUser(-1);
        });
    }, [search]);

    function createChat() {
        var newChat = {users: [user.login, activeUser.login]};
        setStatus('sending');
        req('POST', 'chats', newChat, res => {
            setStatus('');
            setChats([...chats, res]);
            setActiveChat(res._id);
            socket.emit('new-chat', user, res);
        });
    }

    var isLoading = status === 'loading';
    var isSending = status === 'sending';
    return <div className="NewChat">
        <p>{isLoading ? 'Loading users...' : (availUsers.length ? 'Found users:' : 'No users found')}</p>
        <div className="usersCont">
            <ul>
                {availUsers.map(u => 
                    <li className={u._id === activeUser._id ? 'active' : ''} key={u._id} onClick={e => setActiveUser(u)}>
                        {u.login}
                    </li>
                )}
            </ul>
        </div>
        {!!availUsers.length && (
            activeUser.login ? 
                <button onClick={createChat} disabled={isSending}>{isSending ? 'Starting chat...' : 'Start chat'}</button> : 
                <p>Select user to start chat</p>
        )}
    </div>;
}

const mapStateToProps = state => ({
    user: state.user,
    chats: state.chats.list
});

const mapDispatchToProps = dispatch => ({
    setChats: chats => dispatch(setChats(chats)),
    setActiveChat: id => dispatch(setActiveChat(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(NewChat);