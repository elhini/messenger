var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    const collection = 'messages';
    const path = '/api/' + collection;
    app.get(path + '/by-chat/:chatID', (req, res) => {
        const query = { chatID: parseInt(req.params.chatID) }; // TODO: remove parseInt
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
};