var APIBase = require('./base');
var bcrypt = require('bcrypt');
var saltRounds = 10;

class UsersAPI extends APIBase {
    constructor(app, db, _, sessionsAPI) {
        super(db, 'users');
        this.sessionsAPI = sessionsAPI;
        this.methods = {
            'get /check-auth': (req, res) => {
                return res.send(req.user || {}); 
            },
            'get /search/:query': (req, res) => {
                const query = { login: { $regex: '.*' + req.params.query + '.*' } };
                this.getAll(req, res, null, query);
            },
            'get /by-logins/:logins': (req, res) => {
                const query = { login: { $in: req.params.logins.split(',') } };
                this.getAll(req, res, null, query);
            },
            'post /register': async (req, res) => {
                var user = await this.get(req, res, null, { login: req.body.login }, true);
                if (user) {
                    return res.send({ 'error': 'user already exists' });
                }
                bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                    if (err) return console.error(err);
                    req.body.password = hash;
                    req.body.registrationDate = new Date();
                    var user = await this.post(req, res, null, null, true);
                    delete user.password;
                    await this.createSession(req, res, user); // TODO: move to base
                    return res.send(user);
                });
            },
            'post /login': async (req, res) => {
                var user = await this.get(req, res, null, { login: req.body.login }, true);
                if (!user) {
                    return res.send({ 'error': 'user not exists' });
                }
                if (!user.password) {
                    return res.send({ 'error': 'user does not have password' });
                }
                bcrypt.compare(req.body.password, user.password, async (err, match) => {
                    if (err) return console.error(err);
                    if (match) {
                        delete user.password;
                        await this.createSession(req, res, user); // TODO: move to base
                        return res.send(user);
                    }
                    else {
                        res.send({ 'error': 'password is wrong' });
                    }
                });
            },
            'post /logout': async (req, res) => {
                await this.closeSession(req, res);
                res.send({});
            },
            ...this.methods
        };
        this.init(app);
    }

    async getBySessionID(req, res) {
        var id = req.cookies['session-id'];
        console.log('id', id);
        if (!id) {
            return res.send({ /* empty user */ });
        }
        var session = await this.sessionsAPI.get({ params: { id } }, res, null, {}, true);
        console.log('session', session);
        if (!session) {
            return res.send({ 'error': 'wrong session id' });
        }
        var user = await this.get(req, res, null, { login: session.login }, true);
        console.log('user', user);
        if (!user) {
            return res.send({ 'error': 'user not exists' });
        }
        return user;
    }

    async createSession(req, res, user) {
        var _req = {...req};
        _req.body = { login: user.login };
        var session = await this.sessionsAPI.post(_req, res, null, null, true);
        setSessionCookie(req, res, session);
    }
    
    async closeSession(req, res) {
        var _req = {...req};
        _req.body = { closed: true };
        var session = await this.sessionsAPI.put(_req, res, null, {_id: req.sessionID}, true);
        clearSessionCookie(req, res);
    }
}

function getLifeTime(){
    return 24 * 60 * 60 * 1000; // 1 day
}

function getNewExpireDate(){
    let now = new Date();
    return new Date(now.getTime() + getLifeTime());
}

function getCookieOptions(req){
    var isSecure = req.secure || req.get('x-forwarded-proto') === 'https'; // req.secure is false on heroku server
    return { path: '/', httpOnly: true, secure: isSecure, sameSite: isSecure ? 'none' : 'Lax' };
}

function setSessionCookie(req, res, session) {
    res.cookie('session-id', session._id.toString(), Object.assign(getCookieOptions(req), { expires: getNewExpireDate() }));
}

function clearSessionCookie(req, res) {
    res.clearCookie('session-id', getCookieOptions(req));
}

module.exports = UsersAPI;