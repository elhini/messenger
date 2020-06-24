const users = require('./users');
const chats = require('./chats');
const messages = require('./messages');
module.exports = function(app, db) {
    users(app, db);
    chats(app, db);
    messages(app, db);
};