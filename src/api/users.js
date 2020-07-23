var APIBase = require('./base');
var bcrypt = require('bcrypt');
var saltRounds = 10;

class UsersAPI extends APIBase {
    constructor(app, db) {
        super(db, 'users');
        this.methods = {
            'get /check-auth': async (req, res) => {
                var users = await this.methods['get'](req, res, null, { login: req.cookies['logged-as'] }, true);
                if (!users[0]) {
                    return res.send({});
                }
                var user = users[0];
                delete user.password;
                return res.send(user);
            },
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
                    setLoggedAsCookie(res, user);
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
                        setLoggedAsCookie(res, user);
                        return res.send(user);
                    }
                    else {
                        res.send({ 'error': 'password is wrong' });
                    }
                });
            },
            'post /logout': async (req, res) => {
                res.clearCookie('logged-as');
                res.send({});
            },
            ...this.methods
        };
        this.init(app);
    }
}

function getLifeTime(){
    return 24 * 60 * 60 * 1000; // 1 day
}

function getNewExpireDate(){
    let now = new Date();
    return new Date(now.getTime() + getLifeTime());
}

function setLoggedAsCookie(res, user) {
    res.cookie('logged-as', user.login, { expires: getNewExpireDate(), httpOnly: true });
}

module.exports = UsersAPI;