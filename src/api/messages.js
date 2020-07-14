var APIBase = require('./base');

class MessagesAPI extends APIBase {
    constructor(app, db) {
        super(db, 'messages');
        this.methods = {
            ...this.methods,
            'get /by-chat/:chatID': (req, res) => {
                const query = { chatID: req.params.chatID };
                this.methods['get'](req, res, null, query);
            }
        };
        this.init(app);
    }
}

module.exports = MessagesAPI;