import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { updateChat, setMessages } from '../../actions';
import { toStr } from '../../utils/date';
import './Chat.css'; 

function Chat({ user, chats, activeChatID, updateChat, messages, setMessages }) {
    const messagesByChat = messages[activeChatID] || [];
    const [text, setText] = useState('');
    const messageToScrollRef = useRef(null);

    useEffect(() => {
        if (activeChatID < 0 || messages[activeChatID]) {
            return;
        }
        const urls = {
            1: 'https://run.mocky.io/v3/826241dd-ae28-4c0e-b80e-f4fe99695435',
            2: 'https://run.mocky.io/v3/fed1014c-f70e-4f06-8493-e48799bc8a31'
        };
        fetch(urls[activeChatID])
        .then(res => res.json())
        .then(res => setMessages({...messages, [activeChatID]: res}))
        .catch(err => console.error('err', err))
    });
  
    useEffect(() => {
        const li = messageToScrollRef.current;
        li.scrollIntoView && li.scrollIntoView();
    });
  
    function onSend(e, text) {
        e.preventDefault();
        const newMessage = {user: user, text: text, id: messagesByChat.length + 1, date: (new Date()).toISOString()};
        setMessages({...messages, [activeChatID]: [...messagesByChat, newMessage]});
        setText(''); 
        const chat = chats.find(c => c.id === activeChatID);
        chat.lastMessageUser = user;
        chat.lastMessageText = text;
        chat.lastMessageDate = newMessage.date;
        updateChat(chat);
    }

    return <div className="Chat">
        <div className="messagesCont">
            <ul className="messages">
                {messagesByChat.map(m => 
                    <li className={'message ' + (m.user === user ? 'own' : '')} key={m.id}>
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
            <button>Send</button>
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