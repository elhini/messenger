var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
    const collection = 'chats';
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
    app.put('/' + collection + '/:id', (req, res) => {
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