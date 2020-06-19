export const setUser = user => ({
    type: 'SET_USER',
    user
});

export const setChats = chats => ({
    type: 'SET_CHATS',
    chats
});

export const setActiveChat = activeChatID => ({
    type: 'SET_ACTIVE_CHAT',
    activeChatID
});

export const updateChat = chat => ({
    type: 'UPDATE_CHAT',
    chat
});

export const setMessages = messages => ({
    type: 'SET_MESSAGES',
    messages
});