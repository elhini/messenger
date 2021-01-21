const SessionsAPI = require('./sessions');
const UsersAPI = require('./users');
const ChatsAPI = require('./chats');
const MessagesAPI = require('./messages');
module.exports = function(app, db) {
    var sessionsAPI = new SessionsAPI(app, db);
    var usersAPI = new UsersAPI(app, db, null, sessionsAPI);
    new ChatsAPI(app, db, usersAPI);
    new MessagesAPI(app, db, usersAPI);
};