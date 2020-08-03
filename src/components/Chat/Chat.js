import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { updateChat, setMessages } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import { BsTrash } from 'react-icons/bs';
import { BsPencil } from 'react-icons/bs';
import { BsX } from 'react-icons/bs';
import './Chat.scss';

function Chat({ socket, user, chats, activeChatID, updateChat, messages, setMessages }) {
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

    var isLoading = status === 'loading';
    var isSending = status === 'sending';
    var isUpdating = status === 'updating';
    var isDeleting = status === 'deleting';
    return <div className="Chat">
        {isLoading ? <p>Loading messages...</p> : (!messagesByChat.length ? <p>No messages found</p> : null)}
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