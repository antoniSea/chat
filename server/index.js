const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('messages.db');
const Database = require('better-sqlite3')('messages.db');
const cors = require('cors');

app.use(cors());

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS reactions (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id INTEGER, reaction TEXT)');
});

app.get('/', (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY id ASC LIMIT 30 OFFSET ${req.query.offset ?? 0}`, (err, rows) => {
    let messages = rows;
    messages.forEach((row) => {
      row.reactions = Database.prepare('SELECT * FROM reactions WHERE message_id = ?').all(row.id);
    });

    res.send(messages);
  });
});

app.get('/get-ractions', (req, res) => {
  db.serialize(() => {
    db.all(`SELECT * FROM reactions`, (err, rows) => {
      res.send(rows);
    });
  })
});

app.post('/add-reaction/:id', (req, res) => {
  db.serialize(() => {
    db.run('INSERT INTO reactions (message_id, reaction) VALUES (?, ?)', [req.params.id, req.query.reaction]);
  
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'reaction',
          message_id: req.params.id,
          reaction: req.query.reaction
        }));
      }
    });

    res.send('ok');
  });
});

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    db.serialize(() => {
      db.run('INSERT INTO messages (message) VALUES (?)', message.toString(), function (err) {
        if (err) {
          console.error(err.message);
          return;
        }

        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              message: message.toString(),
              id: this.lastID
            }));
          }
        });

      });
    });
  });
});

 
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
})
