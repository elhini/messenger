import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setChats, setActiveChat } from '../../actions';
import { toStr } from '../../utils/date';
import './List.css'; 

function List({ user, chats, setChats, activeChatID, setActiveChat }) {
    const [search, setSearch] = useState('');
    const filteredChats = chats.filter(c => {
        var receiver = c.users.find(u => u !== user);
        return c.users.includes(user) && receiver.toLowerCase().includes(search.toLowerCase())
    });
    const sortedChats = filteredChats.sort((c1, c2) => c2.lastMessageDate > c1.lastMessageDate ? 1 : -1);

    useEffect(() => {
        if (chats.length) {
            return;
        }
        fetch('https://run.mocky.io/v3/407a7c77-d9e5-41a5-879e-01cd85176ecd')
        .then(res => res.json())
        .then(res => setChats(res))
        .catch(err => console.error('err', err));
    });

    useEffect(() => {
        var chatIDs = sortedChats.map(c => c.id);
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
                {sortedChats.map(c => 
                    <li className={'chat ' + (c.id === activeChatID ? 'active' : '')} key={c.id} onClick={e => setActiveChat(c.id)}>
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