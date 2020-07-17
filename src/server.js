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
app.use((err, req, res, next) => {
  console.error(err.stack);
  next(err);
});

MongoClient.connect(dbConfig.url, {useUnifiedTopology: true}, (err, dbClient) => {
  if (err) return console.log(err);
  var db = dbClient && dbClient.db();
  require('./api')(app, db);
  var server = app.listen(port, () => {
    console.log('server listening on port ' + port);
  });

  var io = require('socket.io').listen(server);
  io.on('connection', (socket) => {
    console.log('socket with id', socket.id, 'connected');

    socket.on('join-chats', (user, chatIDs) => {
      console.log('user', [user.login], 'joined chats', chatIDs);
      chatIDs.forEach(chatID => socket.join(chatID));
    });

    var events = ['new-message', 'upd-message', 'del-message'];
    events.forEach(event => {
      socket.on(event, (msg) => {
        console.log(event, 'from user', [msg.user], 'with text', [msg.text], 'for chat', [msg.chatID]);
        io.in(msg.chatID).emit(event, msg);
      });
    });

    socket.on('leave-chats', (user, chatIDs) => {
      console.log('user', [user.login], 'leaved chats', chatIDs);
      chatIDs.forEach(chatID => socket.leave(chatID));
    });

    socket.on('disconnect', () => {
      console.log('socket with id', socket.id, 'disconnected');
    });
  });
});