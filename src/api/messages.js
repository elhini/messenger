var APIBase = require('./base');

class MessagesAPI extends APIBase {
    constructor(app, db) {
        super(db, 'messages');
        this.methods = {
            ...this.methods,
            'get /by-chat/:chatID': (req, res) => {
                const query = { chatID: parseInt(req.params.chatID) }; // TODO: remove parseInt
                this.methods['get'](req, res, null, query);
            }
        };
        this.init(app);
    }
}

module.exports = Messages;