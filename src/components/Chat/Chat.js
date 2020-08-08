import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import throttle from 'lodash/throttle';
import { setActiveChat, updateChat, setMessages } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import { findFromLast } from '../../utils/array';
import { BsTrash } from 'react-icons/bs';
import { BsPencil } from 'react-icons/bs';
import { BsX } from 'react-icons/bs';
import './Chat.scss';

function Chat({ socket, user, chats, activeChatID, setActiveChat, updateChat, messages, setMessages }) {
    const messagesByChat = messages[activeChatID] || [];
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');
    const [typingUsers, setTypingUsers] = useState({});
    const [msgToUpdate, setMsgToUpdate] = useState(null);
    const messageToScrollRef = useRef(null);

    useEffect(() => {
        if (activeChatID < 0 || messages[activeChatID]) return;
        setStatus('loading');
        req('GET', 'messages/by-chat/' + activeChatID, null, res => {
            setStatus('');
            var sortedMessages = res.sort((c1, c2) => c1.date > c2.date ? 1 : -1);
            _setMessages(sortedMessages, activeChatID);
        });
    }, [activeChatID]); // eslint-disable-line react-hooks/exhaustive-deps
    
    function _setMessages(newMessages, chatID) {
        setMessages({...messages, [chatID]: newMessages});
    }
  
    useEffect(() => {
        const li = messageToScrollRef.current;
        li.scrollIntoView && li.scrollIntoView();
    });

    useEffect(() => {
        socket.on('new-message', msg => setMessageAndUpdateChat('new-message', msg));
        return () => socket.off('new-message');
    });

    useEffect(() => {
        socket.on('upd-message', msg => setMessageAndUpdateChat('upd-message', msg));
        return () => socket.off('upd-message');
    });

    useEffect(() => {
        socket.on('del-message', msg => setMessageAndUpdateChat('del-message', msg));
        return () => socket.off('del-message');
    });

    useEffect(() => {
        socket.on('user-typing', setUserTypingStatus);
        return () => socket.off('user-typing');
    });

    function setMessageAndUpdateChat(event, msg) {
        var chatID = msg.chatID;
        var msgsByChat = messages[chatID];
        var newMessages = [];
        var isAuthor = msg.user === user.login;
        if (msgsByChat) {
            if (event === 'new-message') {
                newMessages = msgsByChat.concat([msg]);
                !isAuthor && playSound();
            }
            if (event === 'upd-message') {
                newMessages = msgsByChat.map(m => m._id === msg._id ? msg : m);
            }
            if (event === 'del-message') {
                newMessages = msgsByChat.filter(m => m._id !== msg._id);
            }
            _setMessages(newMessages, chatID);
        }
        else {
            if (event === 'new-message') {
                newMessages = [msg];
            }
        }
        _updateChat(newMessages, chatID, isAuthor);
    }

    function _updateChat(newMessages, chatID, isAuthor) {
        var lastMessage = newMessages.slice(-1)[0];
        const chat = chats.find(c => c._id === chatID);
        if (!chat) return;
        chat.lastMessageUser = lastMessage ? lastMessage.user : '';
        chat.lastMessageText = lastMessage ? lastMessage.text : '';
        chat.lastMessageDate = lastMessage ? lastMessage.date : '';
        if (isAuthor) {
            req('PUT', 'chats/' + chat._id, chat, res => {
                updateChat(chat);
            });
        }
        else {
            updateChat(chat);
        }
    }

    function playSound() {
        new Audio('/sounds/new-message.mp3').play().catch(e => console.log('new message'));
    }

    var userTypingTimeouts = useRef({});

    function setUserTypingStatus(typingUser, chatID) {
        var login = typingUser.login;
        if (chatID === activeChatID && login !== user.login) {
            setTypingUsers({...typingUsers, [login]: true});
            clearTimeout(userTypingTimeouts.current[login]);
            userTypingTimeouts.current[login] = setTimeout(() => {
                setTypingUsers({...typingUsers, [login]: false});
            }, 500);
        }
    }
  
    function onSend(e) {
        e.preventDefault();
        if (!text) return;
        let newMessage = {chatID: activeChatID, user: user.login, text: text, date: (new Date()).toISOString()};
        setStatus('sending');
        req('POST', 'messages', newMessage, res => {
            setStatus('');
            newMessage = res;
            socket.emit('new-message', newMessage);
            setText(''); 
        });
    }
  
    function onUpdateFinished(e) {
        e.preventDefault();
        if (!text) return;
        msgToUpdate.text = text;
        msgToUpdate.updateDate = (new Date()).toISOString();
        setStatus('updating');
        req('PUT', 'messages/' + msgToUpdate._id, msgToUpdate, res => {
            setStatus('');
            socket.emit('upd-message', msgToUpdate);
            setMsgToUpdate(null);
            setText(''); 
        });
    }
  
    function onDelete(e, delMessage) {
        e.preventDefault();
        if (!window.confirm('Delete this message?')) return;
        setStatus('deleting');
        req('DELETE', 'messages/' + delMessage._id, null, res => {
            setStatus('');
            socket.emit('del-message', delMessage);
        });
    }

    function onUpdate(e, msg) {
        setMsgToUpdate(msg);
        setText(msg.text);
    }

    function cancelUpdate() {
        setMsgToUpdate(null);
        setText('');
    }

    function onInputKeyDown(e) {
        if (e.keyCode === 38) { // arrow up
            var myLastMsg = findFromLast(messagesByChat, m => m.user === user.login);
            myLastMsg && onUpdate(e, myLastMsg);
        }
        if (e.keyCode === 27) { // esc
            cancelUpdate();
        }
    }

    var sendTypingStatus = useCallback(throttle(() => {
        socket.emit('user-typing', user, activeChatID);
    }, 500), [user, activeChatID]);

    var isLoading = status === 'loading';
    var isSending = status === 'sending';
    var isUpdating = status === 'updating';
    var isDeleting = status === 'deleting';
    var activeChat = chats.find(c => c._id === activeChatID);
    return <div className={'Chat' + (!activeChat ? ' hidden-on-touch' : '')}>
        {activeChat ? <div className="header">
            <button className="closeChat button-at-right" onClick={e => setActiveChat(-1)}><BsX /></button>
            {activeChat.users.filter(u => u !== user.login).map(u =>  typingUsers[u] ? u + ' is typing...' : u).join(', ')}
        </div> : ''}
        {isLoading ? <p>Loading messages...</p> : (!activeChat ? <p>No chat selected</p> : (!messagesByChat.length ? <p>No messages found</p> : null))}
        <div className="messagesCont">
            <ul className="messages">
                {messagesByChat.map(m => {
                    var isAuthor = m.user === user.login;
                    return <li className={'message ' + (isAuthor ? 'own' : '')} key={m._id}>
                        {isAuthor ? <button className="delete button-at-right" onClick={e => onDelete(e, m)} disabled={isDeleting}><BsTrash /></button> : null}
                        {isAuthor ? <button className="update button-at-right" onClick={e => onUpdate(e, m)} disabled={isUpdating}><BsPencil /></button> : null}
                        <div className="date">[{toStr(m.date)}] {m.updateDate && 'updated'}</div>
                        {m.text}
                    </li>
                })}
                <li className="messageToScroll" ref={messageToScrollRef}></li>
            </ul>
        </div>
        {msgToUpdate ? <div className="msgToUpdate">
            <button className="cancelUpdate button-at-right" onClick={e => cancelUpdate()}><BsX /></button>
            <label>Edit message:</label>
            {msgToUpdate.text}
        </div> : ''}
        <form className="newMessageForm" onSubmit={e => msgToUpdate ? onUpdateFinished(e) : onSend(e)}>
            <input type="text" className="newMessageInput" value={text} onChange={e => {setText(e.target.value); sendTypingStatus()}} onKeyDown={onInputKeyDown}
                placeholder="Write a message..." />
            <button className="newMessageBtn" disabled={isSending}>{isSending ? 'Sending...' : 'Send'}</button>
        </form>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user,
    chats: state.chats.list,
    activeChatID: state.chats.activeID,
    messages: state.messages.list
});

const mapDispatchToProps = dispatch => ({
    setActiveChat: id => dispatch(setActiveChat(id)),
    updateChat: chat => dispatch(updateChat(chat)),
    setMessages: messages => dispatch(setMessages(messages))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);