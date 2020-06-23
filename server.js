const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const cors           = require('cors');
const dbConfig       = require('./config/db');
const app            = express();
const port = 8000;
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
MongoClient.connect(dbConfig.url, (err, dbClient) => {
  if (err) return console.log(err);
  var db = dbClient && dbClient.db();
  require('./api')(app, db);
  app.listen(port, () => {
    console.log('server listening on port ' + port);
  });        
});