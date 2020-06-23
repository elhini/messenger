const chats = require('./chats');
const messages = require('./messages');
module.exports = function(app, db) {
    chats(app, db);
    messages(app, db);
};