var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    const collection = 'users';
    app.get('/' + collection, (req, res) => {
        const query = {};
        db.collection(collection).find(query).toArray((err, result) => {
            if (err) {
                res.send({ 'error': err });
            } else {
                res.send(result);
            }
        });
    });
    app.post('/' + collection, (req, res) => {
        const obj = req.body;
        db.collection(collection).insertOne(obj, (err, result) => {
            if (err) {
                res.send({ 'error': err });
            } else {
                res.send(result.ops[0]);
            }
        });
    });
};