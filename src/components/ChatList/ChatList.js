import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { appendAlert, setChats, setActiveChat } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import NewChat from '../NewChat';
import './ChatList.scss'; 

function ChatList({ socket, appendAlert, user, chats, setChats, activeChatID, setActiveChat }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const chatsBySearch = search ? chats.filter(c => {
        var receiver = c.users.find(u => u !== user.login);
        return receiver.toLowerCase().includes(search.toLowerCase());
    }) : chats;
    const chatIDs = chats.map(c => c._id);

    function _setChats(chats) {
        const sortedChats = chats.sort((c1, c2) => c2.lastMessageDate > c1.lastMessageDate ? 1 : -1);
        setChats(sortedChats);
    }

    useEffect(() => {
        setChats([]);
        if (!user.login) return;
        setStatus('loading');
        req('GET', 'chats/by-user/' + user.login, null, chats => {
            _setChats(chats);
        }, err => appendAlert({ text: err, style: 'error' }), () => setStatus(''));
    }, [user.login]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!chatIDs.length) return;
        socket.emit('join-chats', user, chatIDs);
        return () => socket.emit('leave-chats', user, chatIDs);
    }, [user, chatIDs.length]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        socket.on('new-chat', (user, chat) => {
            _setChats([...chats, chat]);
        });
        return () => socket.off('new-chat');
    }, [user, chats]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        socket.on('del-chat', (user, chat) => {
            var chatsFiltered = chats.filter(c => c._id !== chat._id);
            _setChats(chatsFiltered);
        });
        return () => socket.off('del-chat');
    }, [user, chats]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!chatIDs.includes(activeChatID)) {
            setActiveChat(chatIDs.length ? chatIDs[0] : -1);
        }
    });
  
    function onDelete(e, chat) {
        e.preventDefault();
        setStatus('deleting');
        req('DELETE', 'chats/' + chat._id, null, res => {
            setStatus('');
            var chatsFiltered = chats.filter(c => c._id !== chat._id);
            _setChats(chatsFiltered);
            socket.emit('del-chat', user, chat);
        });
    }

    var isLoading = status === 'loading';
    var isDeleting = status === 'deleting';
    return <div className="ChatList">
        <form className="chatSearchForm">
            <input type="text" className="chatSearchInput" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by receiver name" />
        </form>
        {isLoading ? <p>Loading chats...</p> : (!search && !chatsBySearch.length ? <p>No chats found</p> : null)}
        {search && !chatsBySearch.length && <NewChat search={search} socket={socket} />}
        <div className="chatsCont">
            <ul className="chats">
                {chatsBySearch.map(c => 
                    <li className={'chat ' + (c._id === activeChatID ? 'active' : '')} key={c._id} onClick={e => setActiveChat(c._id)}>
                        {!c.lastMessageDate ? <button className="delete" onClick={e => onDelete(e, c)} disabled={isDeleting}>x</button> : null}
                        <span className="user">{c.users.find(u => u !== user.login)}</span>{' '}
                        {c.lastMessageDate && <span className="date">[{toStr(c.lastMessageDate)}]</span>}
                        <br /> 
                        {c.lastMessageUser === user.login ? 'You: ' : ''}{c.lastMessageText}
                    </li>
                )}
            </ul>
        </div>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user,
    chats: state.chats.list,
    activeChatID: state.chats.activeID
});

const mapDispatchToProps = dispatch => ({
    appendAlert: alert => dispatch(appendAlert(alert)),
    setChats: chats => dispatch(setChats(chats)),
    setActiveChat: id => dispatch(setActiveChat(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatList);