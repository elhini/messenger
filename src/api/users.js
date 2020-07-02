var APIBase = require('./base');

class UsersAPI extends APIBase {
    constructor(app, db) {
        super(db, 'users');
        this.methods = {
            ...this.methods,
            'get /search/:query': (req, res) => {
                const query = { login: { $regex: '.*' + req.params.query + '.*' } };
                this.methods['get'](req, res, null, query);
            }
        };
        this.init(app);
    }
}

module.exports = Users;