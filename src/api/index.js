const UsersAPI = require('./users');
const ChatsAPI = require('./chats');
const MessagesAPI = require('./messages');
module.exports = function(app, db) {
    var usersAPI = new UsersAPI(app, db);
    new ChatsAPI(app, db, usersAPI);
    new MessagesAPI(app, db, usersAPI);
};