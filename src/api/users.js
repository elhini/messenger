var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    const collection = 'users';
    const path = '/api/' + collection;
    app.get(path, (req, res) => {
        const query = {};
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
    app.get(path + '/search/:query', (req, res) => {
        const query = { login: { $regex: '.*' + req.params.query + '.*' } };
        db.collection(collection).find(query).toArray((err, result) => {
            if (err) {
                res.send({ 'error': err });
            } else {
                res.send(result);
            }
        });
    });
};