var APIBase = require('./base');

class ChatsAPI extends APIBase {
    constructor(app, db, usersAPI) {
        super(db, 'chats', usersAPI);
        this.methods = {
            'get /my': (req, res) => {
                const query = { users: req.user.login };
                this.getAll(req, res, null, query);
            },
            ...this.methods
        };
        this.init(app);
    }
}

module.exports = ChatsAPI;