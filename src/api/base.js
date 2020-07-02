var ObjectID = require('mongodb').ObjectID;
class APIBase {
    constructor(db, collection) {
        this.path = '/api/' + collection;
        this.methods = {
            'get': (req, res, next, query = {}) => {
                console.log('get', collection, 'query', query);
                db.collection(collection).find(query).toArray((err, result) => {
                    if (err) {
                        res.send({ 'error': err });
                    } else {
                        res.send(result);
                    }
                });
            },
            'post': (req, res) => {
                console.log('post', collection);
                const obj = req.body;
                db.collection(collection).insertOne(obj, (err, result) => {
                    if (err) { 
                        res.send({ 'error': err }); 
                    } else {
                        res.send(result.ops[0]);
                    }
                });
            },
            'get /:id': (req, res) => {
                var query = { _id: ObjectID(req.params.id) };
                console.log('get /:id', collection, 'query', query);
                db.collection(collection).findOne(query, (err, result) => {
                    if (err) {
                        res.send({ 'error': err });
                    } else {
                        res.send(result);
                    }
                });
            },
            'put /:id': (req, res) => {
                // some ids are integer
                try { var _id = ObjectID(req.params.id) } catch (e) { var _id = parseInt(req.params.id) }
                var query = { _id: _id };
                console.log('put /:id', collection, 'query', query);
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
                console.log('delete /:id', collection, 'query', query);
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