module.exports = (server) => {
    var io = require('socket.io').listen(server);
    io.on('connection', (socket) => {
        console.log('socket with id', socket.id, 'connected');

        socket.on('connect-user', (user) => {
            console.log('user', [user.login], 'connected');
            socket.join(user.login);
        });

        socket.on('join-chats', (user, chatIDs) => {
            console.log('user', [user.login], 'joined chats', chatIDs);
            chatIDs.forEach(chatID => socket.join(chatID));
        });

        var chatEvents = ['new-chat', 'upd-chat', 'del-chat'];
        chatEvents.forEach(event => {
            socket.on(event, (user, chat) => {
                console.log(event, 'between users', chat.users);
                var usersToNotify = chat.users.filter(u => u !== user.login);
                usersToNotify.forEach(login => io.in(login).emit(event, user, chat));
            });
        });

        var messageEvents = ['new-message', 'upd-message', 'del-message'];
        messageEvents.forEach(event => {
            socket.on(event, (msg) => {
                console.log(event, 'from user', [msg.user], 'with text', [msg.text], 'for chat', [msg.chatID]);
                io.in(msg.chatID).emit(event, msg);
            });
        });

        socket.on('user-typing', (user, chatID) => {
            console.log('user', [user.login], 'is typing in chat', [chatID]);
            io.in(chatID).emit('user-typing', user, chatID);
        });

        socket.on('disconnect-user', (user) => {
            console.log('user', [user.login], 'disconnected');
            socket.leave(user.login);
        });

        socket.on('leave-chats', (user, chatIDs) => {
            console.log('user', [user.login], 'leaved chats', chatIDs);
            chatIDs.forEach(chatID => socket.leave(chatID));
        });

        socket.on('disconnect', () => {
            console.log('socket with id', socket.id, 'disconnected');
        });
    });
};