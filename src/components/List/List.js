import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setChats, setActiveChat } from '../../actions';
import { toStr } from '../../utils/date';
import './List.css'; 

function List({ chats, setChats, activeChatID, setActiveChat }) {
    const [search, setSearch] = useState('');
    const filteredChats = chats.filter(c => c.user.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        if (chats.length) {
            return;
        }
        fetch('https://run.mocky.io/v3/e4313b6d-4439-4b88-a224-85b69cdbb11a')
        .then(res => res.json())
        .then(res => {
            setChats(res);
            res[0] && setActiveChat(res[0].id)
        })
        .catch(err => console.error('err', err))
    });

    return <div className="List">
        <form className="chatSearchForm">
            <input type="text" className="chatSearchInput" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user name" />
        </form>
        <div className="chatsCont">
            <ul className="chats">
                {filteredChats.map(c => 
                    <li className={'chat ' + (c.id === activeChatID ? 'active' : '')} key={c.id} onClick={e => setActiveChat(c.id)}>
                        <span className="user">{c.user}</span>{' '}
                        <span className="date">[{toStr(c.lastMessageDate)}]</span>
                        <br /> 
                        {c.lastMessageIsMine ? 'You: ' : ''}{c.lastMessageText}
                    </li>
                )}
            </ul>
        </div>
    </div>;
}

const mapStateToProps = state => ({
    chats: state.chats.list,
    activeChatID: state.chats.activeID
});

const mapDispatchToProps = dispatch => ({
    setChats: chats => dispatch(setChats(chats)),
    setActiveChat: id => dispatch(setActiveChat(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(List);