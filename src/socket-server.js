module.exports = (server) => {
    var io = require('socket.io').listen(server);
    io.on('connection', (socket) => {
        console.log('socket with id', socket.id, 'connected');

        socket.on('join-chats', (user, chatIDs) => {
            console.log('user', [user.login], 'joined chats', chatIDs);
            chatIDs.forEach(chatID => socket.join(chatID));
        });

        var events = ['new-message', 'upd-message', 'del-message'];
        events.forEach(event => {
            socket.on(event, (msg) => {
            console.log(event, 'from user', [msg.user], 'with text', [msg.text], 'for chat', [msg.chatID]);
            io.in(msg.chatID).emit(event, msg);
            });
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