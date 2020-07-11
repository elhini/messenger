const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const cors           = require('cors');
const dbConfig       = require('./config/db');
const app            = express();
const port           = 8000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

MongoClient.connect(dbConfig.url, {useUnifiedTopology: true}, (err, dbClient) => {
  if (err) return console.log(err);
  var db = dbClient && dbClient.db();
  require('./api')(app, db);
  var server = app.listen(port, () => {
    console.log('server listening on port ' + port);
  });

  var io = require('socket.io').listen(server);
  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('new-message', (msg) => {
      console.log('new-message', msg);
      io.emit('new-message', msg);
    });

    socket.on('del-message', (id) => {
      console.log('del-message', id);
      io.emit('del-message', id);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
});