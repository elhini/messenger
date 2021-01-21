var ObjectID = require('mongodb').ObjectID;
class APIBase {
    constructor(db, collection, usersAPI) {
        this.db = db;
        this.collection = collection;
        this.usersAPI = usersAPI; // TODO: collection !== 'users' ? new UsersAPI() : this
        this.path = '/api/' + collection;
        this.methods = {
            'get': this.getAll.bind(this),
            'post': this.post.bind(this),
            'get /:id': this.get.bind(this),
            'put /:id': this.put.bind(this),
            'delete /:id': this.delete.bind(this)
        };
    }
            
    getAll(req, res, next, query = {}, dontSendResp = false) {
        console.log('get all query', query);
        return new Promise((resolve, reject) => {
            this.db.collection(this.collection).find(query).toArray((err, result) => {
                if (err) {
                    reject(err);
                    !dontSendResp && res.send({ 'error': err });
                } else {
                    // TODO: remove password from users
                    resolve(result);
                    !dontSendResp && res.send(result);
                }
            });
        });
    }
    
    post(req, res, next, query, dontSendResp = false) {
        const obj = req.body;
        return new Promise((resolve, reject) => {
            this.db.collection(this.collection).insertOne(obj, (err, result) => {
                if (err) { 
                    reject(err);
                    !dontSendResp && res.send({ 'error': err }); 
                } else {
                    var obj = result.ops[0];
                    resolve(obj);
                    !dontSendResp && res.send(obj);
                }
            });
        });
    }

    get(req, res, next, query, dontSendResp = false) {
        query = Object.keys(query).length ? query : { _id: ObjectID(req.params.id) };
        if (true) {
            console.log('get query', query);
        }
        return new Promise((resolve, reject) => {
            this.db.collection(this.collection).findOne(query, (err, result) => {
                if (err) {
                    reject(err);
                    !dontSendResp && res.send({ 'error': err });
                } else {
                    // TODO: remove password from user
                    resolve(result);
                    !dontSendResp && res.send(result);
                }
            });
        });
    }
    
    put(req, res, next, query, dontSendResp = false) {
        query = Object.keys(query).length ? query : { _id: ObjectID(req.params.id) };
        if (this.collection !== 'users') {
            console.log('put query', query);
        }
        let obj = req.body;
        let _obj = {...obj};
        delete _obj._id;
        return new Promise((resolve, reject) => {
            this.db.collection(this.collection).updateOne(query, { $set: _obj }, (err, result) => {
                if (err) { 
                    reject(err);
                    !dontSendResp && res.send({ 'error': err }); 
                } else {
                    !result.matchedCount && (obj = { 'error': 'nothing was updated' });
                    resolve(obj);
                    !dontSendResp && res.send(obj);
                }
            });
        });
    }

    delete(req, res, next, query, dontSendResp = false) {
        query = Object.keys(query).length ? query : { _id: ObjectID(req.params.id) };
        console.log('delete query', query);
        return new Promise((resolve, reject) => {
            this.db.collection(this.collection).deleteOne(query, (err, result) => {
                if (err) {
                    reject(err);
                    !dontSendResp && res.send({ 'error': err });
                } else {
                    var obj = { 'deleted': true };
                    resolve(obj);
                    !dontSendResp && res.send(obj);
                }
            });
        });
    }

    init(app) {
        for (let key in this.methods) {
            let keyArr = key.split(' ');
            let method = keyArr[0];
            let route = keyArr[1] || '';
            if (this.methods[key]) {
                console.log('init', this.path + route, method);
                app[method](this.path + route, async (req, res, next, query = {}, dontSendResp = false) => {
                    console.log('call', this.path + route, method);
                    try {
                        await this.updateUserFromRequest(req, res, method, route);
                        await this.methods[key](req, res, next, query, dontSendResp);
                    } catch (e) {
                        res.send({ error: 'request failed' });
                    }
                });
            }
        }
    }

    async updateUserFromRequest(req, res, method, route) {
        var isSingleGetOrPut = (method === 'get' || method === 'put') && route === '/:id';
        if (this.collection === 'users' && (isSingleGetOrPut || route === '/register' || route === '/login')) {
            return;
        }
        var user = await (this.usersAPI || this).getBySessionID(req, res);
        if (user && user.login) {
            delete user.password;
            req.user = user;
            var isLogout = this.collection === 'users' && route === '/logout';
            await this.setUserOnlineStatus(req, res, !isLogout);
        }
    }

    async setUserOnlineStatus(req, res, isOnline) {
        req.user.lastOnlineDate = new Date();
        req.user.isOnline = isOnline;
        var _req = {...req};
        _req.body = req.user;
        req.user = await (this.usersAPI || this).put(_req, res, null, { login: req.user.login }, true);
        // TODO: await sessionsAPI.post(req, res, null, { login }, true);
    }
}

module.exports = APIBase;