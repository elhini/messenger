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
                    return res.send({ 'error': 'user already exists' });
                }
                bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                    if (err) return console.error(err);
                    req.body.password = hash;
                    req.body.registrationDate = new Date();
                    var user = await this.methods['post'](req, res, null, true);
                    delete user.password;
                    res.cookie('logged-as', user.login, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                    return res.send(user);
                });
            },
            'post /login': async (req, res) => {
                var users = await this.methods['get'](req, res, null, {login: req.body.login}, true);
                if (!users[0]) {
                    return res.send({ 'error': 'user not exists' });
                }
                if (!users[0].password) {
                    return res.send({ 'error': 'user does not have password' });
                }
                bcrypt.compare(req.body.password, users[0].password, async (err, match) => {
                    if (err) return console.error(err);
                    if (match) {
                        req.body.loginDate = new Date();
                        var user = req.body; // TODO: await sessionsAPI['post'](req, res, null, true);
                        delete user.password;
                        res.cookie('logged-as', user.login, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                        return res.send(user);
                    }
                    else {
                        res.send({ 'error': 'password is wrong' });
                    }
                });
            }
        };
        this.init(app);
    }
}

module.exports = UsersAPI;