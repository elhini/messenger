const dbURL = process.env.DB_URL || require('./config/db').url;
if (!dbURL) return console.log('no DB URL provided, server will not be started');

const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');
const socketServer   = require('./socket-server');
const app            = express();
const port           = 8000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  next(err);
});

MongoClient.connect(dbURL, {useUnifiedTopology: true}, (err, dbClient) => {
  if (err) return console.log(err);
  var db = dbClient && dbClient.db();
  require('./api')(app, db);
  var server = app.listen(port, () => {
    console.log('server listening on port ' + port);
  });

  socketServer(server);
});