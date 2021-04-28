const http = require('http');
const mongoose = require('mongoose');
const config = require('./config');
require('./api/models/ingredientModel');

mongoose.connect('mongodb+srv://recipease0.5timp.mongodb.net/recipease', {
  useNewUrlParser: true, // https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
  useUnifiedTopology: true, // https://mongodb.github.io/node-mongodb-native/3.3/reference/unified-topology/
  user: config.mongodb.username,
  pass: config.mongodb.password,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('\n ~~ 🥳 successfully connected to db 🎉 ~~ \n');
});

const router = require('./api/router');

const hostname = 'localhost';
const port = 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json', // tell http header we will be sending json (?)
  });

  // pass all requests to our custom router for logic, then this callback returns data to the caller
  router(req, (data) => res.end(JSON.stringify(data)));
});

server.listen(port, hostname, () => {
  console.log(`\n 🗄️  server is bitchin' at http://${hostname}:${port} \n`);
});
