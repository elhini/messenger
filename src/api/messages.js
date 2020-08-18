var APIBase = require('./base');

class MessagesAPI extends APIBase {
    constructor(app, db, usersAPI) {
        super(db, 'messages', usersAPI);
        this.methods = {
            'get /by-chat/:chatID': (req, res) => {
                const query = { chatID: req.params.chatID };
                this.getAll(req, res, null, query);
            },
            ...this.methods
        };
        this.init(app);
    }
}

module.exports = MessagesAPI;