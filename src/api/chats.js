var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    const collection = 'chats';
    const path = '/api/' + collection;
    app.get(path + '/by-user/:login', (req, res) => {
        const query = { users: req.params.login };
        db.collection(collection).find(query).toArray((err, result) => {
            if (err) {
                res.send({ 'error': err });
            } else {
                res.send(result);
            }
        });
    });
    app.post(path, (req, res) => {
        const obj = req.body;
        db.collection(collection).insertOne(obj, (err, result) => {
            if (err) { 
                res.send({ 'error': err }); 
            } else {
                res.send(result.ops[0]);
            }
        });
    });
    app.delete(path + '/:id', (req, res) => {
        const query = { _id: ObjectID(req.params.id) };
        db.collection(collection).deleteOne(query, (err, result) => {
            if (err) {
                res.send({ 'error': err });
            } else {
                res.send({ 'deleted': true });
            }
        });
    });
    app.put(path + '/:id', (req, res) => {
        const query = { '_id': parseInt(req.params.id) }; // TODO: remove parseInt
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
    });
};