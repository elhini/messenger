var ObjectID = require('mongodb').ObjectID;
class APIBase {
    constructor(db, collection) {
        this.path = '/api/' + collection;
        this.methods = {
            'get': (req, res, next, query = {}, dontSendResp = false) => {
                console.log('get', collection, 'with query', query);
                return new Promise((resolve, reject) => {
                    db.collection(collection).find(query).toArray((err, result) => {
                        if (err) {
                            reject(err);
                            !dontSendResp && res.send({ 'error': err });
                        } else {
                            resolve(result);
                            !dontSendResp && res.send(result);
                        }
                    });
                });
            },
            'post': (req, res, next, dontSendResp = false) => {
                console.log('post', collection);
                const obj = req.body;
                return new Promise((resolve, reject) => {
                    db.collection(collection).insertOne(obj, (err, result) => {
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
            },
            'get /:id': (req, res) => {
                var query = { _id: ObjectID(req.params.id) };
                console.log('get /:id', collection, 'with query', query);
                db.collection(collection).findOne(query, (err, result) => {
                    if (err) {
                        res.send({ 'error': err });
                    } else {
                        res.send(result);
                    }
                });
            },
            'put /:id': (req, res) => {
                var query = { _id: ObjectID(req.params.id) };
                console.log('put /:id', collection, 'with query', query);
                const obj = req.body;
                let _obj = {...obj};
                delete _obj._id;
                db.collection(collection).updateOne(query, { $set: _obj }, (err, result) => {
                    if (err) { 
                        res.send({ 'error': err }); 
                    } else {
                        res.send(result.matchedCount ? obj : { 'error': 'nothing was updated' });
                    }
                });
            },
            'delete /:id': (req, res) => {
                var query = { _id: ObjectID(req.params.id) };
                console.log('delete /:id', collection, 'with query', query);
                db.collection(collection).deleteOne(query, (err, result) => {
                    if (err) {
                        res.send({ 'error': err });
                    } else {
                        res.send({ 'deleted': true });
                    }
                });
            }
        };
    }

    init(app) {
        for (var key in this.methods) {
            var keyArr = key.split(' ');
            var method = keyArr[0];
            var route = keyArr[1] || '';
            if (this.methods[key]) {
                console.log('init', this.path + route, method);
                app[method](this.path + route, this.methods[key]);
            }
        }
    }
}

module.exports = APIBase;