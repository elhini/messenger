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
            'post /register': async (req, res) => {
                var users = await this.methods['get'](req, res, null, {login: req.body.login}, true);
                if (users[0]) {
                    return res.send({ 'error': 'user with provided login already exists' });
                }
                bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                    if (err) return console.error(err);
                    req.body.password = hash;
                    var user = await this.methods['post'](req, res, null, true);
                    delete user.password;
                    return res.send(user);
                });
            }
        };
        this.init(app);
    }
}

module.exports = UsersAPI;