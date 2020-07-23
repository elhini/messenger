var APIBase = require('./base');

class ChatsAPI extends APIBase {
    constructor(app, db) {
        super(db, 'chats');
        this.methods = {
            'get /my': (req, res) => {
                const query = { users: req.cookies['logged-as'] };
                this.methods['get'](req, res, null, query);
            },
            ...this.methods
        };
        this.init(app);
    }
}

module.exports = ChatsAPI;