const UsersAPI = require('./users');
const ChatsAPI = require('./chats');
const MessagesAPI = require('./messages');
module.exports = function(app, db) {
    new UsersAPI(app, db);
    new ChatsAPI(app, db);
    new MessagesAPI(app, db);
};