var APIBase = require('./base');
var bcrypt = require('bcrypt');
var saltRounds = 10;

class UsersAPI extends APIBase {
    constructor(app, db) {
        super(db, 'users');
        this.methods = {
            ...this.methods,
            'get /search/:query': (req, res) => {
                const query = { login: { $regex: '.*' + req.params.query + '.*' } };
                this.methods['get'](req, res, null, query);
            },
            'post /register': (req, res) => {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) return console.error(err);
                    req.body.password = hash;
                    this.methods['post'](req, res);
                });
            }
        };
        this.init(app);
    }
}

module.exports = UsersAPI;