import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { updateChat, setMessages } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import io from 'socket.io-client';
import { BsTrash } from 'react-icons/bs';
import { BsPencil } from 'react-icons/bs';
import './Chat.scss'; 

const socket = io('http://localhost:8000');

function Chat({ user, chats, activeChatID, updateChat, messages, setMessages }) {
    const messagesByChat = messages[activeChatID] || [];
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');
    const [msgToUpdate, setMsgToUpdate] = useState(null);
    const messageToScrollRef = useRef(null);

    useEffect(() => {
        if (!chats.length) return;
        const chatIDs = chats.map(c => c._id);
        socket.emit('join-chats', user, chatIDs);
        return () => socket.emit('leave-chats', user, chatIDs);
    }, [user, chats]);

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
        socket.on('new-message', msg => {
            setMessageAndUpdateChat('new-message', msg);
        });
        return () => {
            socket.off('new-message');
        };
    });

    useEffect(() => {
        socket.on('upd-message', msg => {
            setMessageAndUpdateChat('upd-message', msg);
        });
        return () => {
            socket.off('upd-message');
        };
    });

    useEffect(() => {
        socket.on('del-message', msg => {
            setMessageAndUpdateChat('del-message', msg);
        });
        return () => {
            socket.off('del-message');
        };
    });

    function setMessageAndUpdateChat(event, msg) {
        var chatID = msg.chatID;
        var msgsByChat = messages[chatID];
        var newMessages = [];
        if (msgsByChat) {
            if (event === 'new-message') {
                newMessages = msgsByChat.concat([msg]);
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
        _updateChat(newMessages, chatID, msg.user === user.login);
    }

    function _updateChat(newMessages, chatID, isAuthor) {
        var lastMessage = newMessages.slice(-1)[0];
        const chat = chats.find(c => c._id === chatID);
        if (!lastMessage || !chat) return;
        chat.lastMessageUser = lastMessage.user;
        chat.lastMessageText = lastMessage.text;
        chat.lastMessageDate = lastMessage.date;
        if (isAuthor) {
            req('PUT', 'chats/' + chat._id, chat, res => {
                updateChat(chat);
            });
        }
        else {
            updateChat(chat);
        }
    }
  
    function onSend(e) {
        e.preventDefault();
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
        msgToUpdate.text = text;
        msgToUpdate.updateDate = (new Date()).toISOString();
        setStatus('updating');
        req('PUT', 'messages/' + msgToUpdate._id, msgToUpdate, res => {
            setStatus('');
            socket.emit('upd-message', msgToUpdate);
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

    var isLoading = status === 'loading';
    var isSending = status === 'sending';
    var isUpdating = status === 'updating';
    var isDeleting = status === 'deleting';
    return <div className="Chat">
        {isLoading ? <p>Loading messages...</p> : (!messagesByChat.length ? <p>No messages found</p> : null)}
        <div className="messagesCont">
            <ul className="messages">
                {messagesByChat.map(m => 
                    <li className={'message ' + (m.user === user.login ? 'own' : '')} key={m._id}>
                        {m.user === user.login ? <button className="delete" onClick={e => onDelete(e, m)} disabled={isDeleting}><BsTrash /></button> : null}
                        {m.user === user.login ? <button className="update" onClick={e => onUpdate(e, m)} disabled={isUpdating}><BsPencil /></button> : null}
                        <span className="date">[{toStr(m.date)}] {m.updateDate && 'updated'}</span>
                        <br /> 
                        {m.text}
                    </li>
                )}
                <li className="messageToScroll" ref={messageToScrollRef}></li>
            </ul>
        </div>
        <form className="newMessageForm" onSubmit={e => msgToUpdate ? onUpdateFinished(e) : onSend(e)}>
            <input type="text" className="newMessageInput" value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." />
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
    updateChat: chat => dispatch(updateChat(chat)),
    setMessages: messages => dispatch(setMessages(messages))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);