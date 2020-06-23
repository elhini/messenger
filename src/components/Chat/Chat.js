import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { updateChat, setMessages } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import './Chat.css'; 

function Chat({ user, chats, activeChatID, updateChat, messages, setMessages }) {
    const messagesByChat = messages[activeChatID] || [];
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');
    const messageToScrollRef = useRef(null);

    useEffect(() => {
        if (activeChatID < 0 || messages[activeChatID]) {
            return;
        }
        req('GET', 'messages/by-chat/' + activeChatID, null, res => {
            var sortedMessages = res.sort((c1, c2) => c1.date > c2.date ? 1 : -1);
            setMessages({...messages, [activeChatID]: sortedMessages});
        });
    });
  
    useEffect(() => {
        const li = messageToScrollRef.current;
        li.scrollIntoView && li.scrollIntoView();
    });
  
    function onSend(e, text) {
        e.preventDefault();
        let newMessage = {chatID: activeChatID, user: user, text: text, date: (new Date()).toISOString()};
        setStatus('sending');
        req('POST', 'messages', newMessage, res => {
            setStatus('');
            newMessage = res;
            setMessages({...messages, [activeChatID]: [...messagesByChat, newMessage]});
            setText(''); 
            _updateChat(newMessage);
        });
    }

    function _updateChat(msg) {
        const chat = chats.find(c => c._id === activeChatID);
        chat.lastMessageUser = msg.user;
        chat.lastMessageText = msg.text;
        chat.lastMessageDate = msg.date;
        req('PUT', 'chats/' + chat._id, chat, res => {
            updateChat(res);
        });
    }
  
    function onDelete(e, id) {
        e.preventDefault();
        setStatus('deleting');
        req('DELETE', 'messages/' + id, null, res => {
            setStatus('');
            var messagesFiltered = messagesByChat.filter(m => m._id !== id);
            setMessages({...messages, [activeChatID]: messagesFiltered});
            var lastMessage = messagesFiltered.slice(-1)[0];
            _updateChat(lastMessage);
        });
    }

    var isSending = status === 'sending';
    var isDeleting = status === 'deleting';
    return <div className="Chat">
        <div className="messagesCont">
            <ul className="messages">
                {messagesByChat.map(m => 
                    <li className={'message ' + (m.user === user ? 'own' : '')} key={m._id}>
                        {m.user === user ? <button className="delete" onClick={e => onDelete(e, m._id)} disabled={isDeleting}>x</button> : null}
                        <span className="date">[{toStr(m.date)}]</span>
                        <br /> 
                        {m.text}
                    </li>
                )}
                <li className="messageToScroll" ref={messageToScrollRef}></li>
            </ul>
        </div>
        <form className="newMessageForm" onSubmit={e => onSend(e, text)}>
            <input type="text" className="newMessageInput" value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." />
            <button className="newMessageBtn" disabled={isSending}>{isSending ? 'Sending...' : 'Send'}</button>
        </form>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user.login,
    chats: state.chats.list,
    activeChatID: state.chats.activeID,
    messages: state.messages.list
});

const mapDispatchToProps = dispatch => ({
    updateChat: chat => dispatch(updateChat(chat)),
    setMessages: messages => dispatch(setMessages(messages))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);