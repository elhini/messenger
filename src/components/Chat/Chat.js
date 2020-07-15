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
        if (activeChatID < 0 || messages[activeChatID]) return;
        setStatus('loading');
        req('GET', 'messages/by-chat/' + activeChatID, null, res => {
            setStatus('');
            var sortedMessages = res.sort((c1, c2) => c1.date > c2.date ? 1 : -1);
            _setMessage(sortedMessages);
        });
    }, [activeChatID]); // eslint-disable-line react-hooks/exhaustive-deps
    
    function _setMessage(newMessages) {
        setMessages({...messages, [activeChatID]: newMessages});
    }
  
    useEffect(() => {
        const li = messageToScrollRef.current;
        li.scrollIntoView && li.scrollIntoView();
    });

    function canRead(msg){
        var chatIDs = chats.map(c => c._id);
        return chatIDs.includes(msg.chatID);
    }

    useEffect(() => {
        socket.on('new-message', (newMessage) => {
            if (!canRead(newMessage)) return; // TODO: move it to server
            _setMessage([...messagesByChat, newMessage]);
            _updateChat(newMessage, false, true);
        });
        return () => {
            socket.off('new-message');
        };
    });

    useEffect(() => {
        socket.on('upd-message', (updMessage) => {
            if (!canRead(updMessage)) return; // TODO: move it to server
            var messagesUpdated = messagesByChat.map(m => m._id === updMessage._id ? updMessage : m);
            _setMessage(messagesUpdated);
            _updateChat(updMessage, false, true);
        });
        return () => {
            socket.off('upd-message');
        };
    });

    useEffect(() => {
        socket.on('del-message', (delMessage) => {
            if (!canRead(delMessage)) return; // TODO: move it to server
            var messagesFiltered = messagesByChat.filter(m => m._id !== delMessage._id);
            _setMessage(messagesFiltered);
            _updateChat(delMessage, true, true);
        });
        return () => {
            socket.off('del-message');
        };
    });

    function _updateChat(msg, isDeleted, noRequest) {
        var newMessages = isDeleted ? messagesByChat.filter(m => m._id !== msg._id) : [...messagesByChat, msg];
        var lastMessage = newMessages.slice(-1)[0] || {};
        const chat = chats.find(c => c._id === activeChatID);
        if (!chat) return;
        chat.lastMessageUser = lastMessage.user;
        chat.lastMessageText = lastMessage.text;
        chat.lastMessageDate = lastMessage.date;
        if (noRequest){
            updateChat(chat);
        }
        else {
            req('PUT', 'chats/' + chat._id, chat, res => {
                updateChat(res);
            });
        }
    }
  
    function onSend(e) {
        e.preventDefault();
        let newMessage = {chatID: activeChatID, user: user.login, text: text, date: (new Date()).toISOString()};
        setStatus('sending');
        req('POST', 'messages', newMessage, res => {
            setStatus('');
            newMessage = res;
            _updateChat(newMessage, false);
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
            _updateChat(msgToUpdate, false);
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
            _updateChat(delMessage, true);
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