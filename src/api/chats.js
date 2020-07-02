var APIBase = require('./base');

class ChatsAPI extends APIBase {
    constructor(app, db) {
        super(db, 'chats');
        this.methods = {
            ...this.methods,
            'get /by-user/:login': (req, res) => {
                const query = { users: req.params.login };
                this.methods['get'](req, res, null, query);
            }
        };
        this.init(app);
    }
}

module.exports = Chats;