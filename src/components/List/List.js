import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setChats, setActiveChat } from '../../actions';
import { toStr } from '../../utils/date';
import { req } from '../../utils/async';
import './List.css'; 

function List({ user, chats, setChats, activeChatID, setActiveChat }) {
    const [search, setSearch] = useState('');
    const chatsByUser = chats.filter(c => c.users.includes(user));
    const chatsBySearch = search ? chatsByUser.filter(c => {
        var receiver = c.users.find(u => u !== user);
        return receiver.toLowerCase().includes(search.toLowerCase());
    }) : chatsByUser;

    useEffect(() => {
        if (chats.length) {
            return;
        }
        req('GET', 'chats', null, res => {
            const sortedChats = res.sort((c1, c2) => c2.lastMessageDate > c1.lastMessageDate ? 1 : -1);
            setChats(sortedChats);
        });
    });

    useEffect(() => {
        var chatIDs = chatsByUser.map(c => c._id);
        if (chatIDs.length && !chatIDs.includes(activeChatID)) {
            setActiveChat(chatIDs[0]);
        }
    });

    return <div className="List">
        <form className="chatSearchForm">
            <input type="text" className="chatSearchInput" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by receiver name" />
        </form>
        <div className="chatsCont">
            <ul className="chats">
                {chatsBySearch.map(c => 
                    <li className={'chat ' + (c._id === activeChatID ? 'active' : '')} key={c._id} data-id={c._id} onClick={e => setActiveChat(c._id)}>
                        <span className="user">{c.users.find(u => u !== user)}</span>{' '}
                        <span className="date">[{toStr(c.lastMessageDate)}]</span>
                        <br /> 
                        {c.lastMessageUser === user ? 'You: ' : ''}{c.lastMessageText}
                    </li>
                )}
            </ul>
        </div>
    </div>;
}

const mapStateToProps = state => ({
    user: state.user.login,
    chats: state.chats.list,
    activeChatID: state.chats.activeID
});

const mapDispatchToProps = dispatch => ({
    setChats: chats => dispatch(setChats(chats)),
    setActiveChat: id => dispatch(setActiveChat(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(List);