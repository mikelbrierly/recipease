const http = require('http');
const mongoose = require('mongoose');
const ingredient = require('./api/models/ingredientModel');

mongoose.connect('mongodb://localhost:27017/recipeasedb', { // port is neccesary when using useNewUrlParser option
  useNewUrlParser: true, // https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
  useUnifiedTopology: true // https://mongodb.github.io/node-mongodb-native/3.3/reference/unified-topology/
});

const router = require('./api/router');

const hostname = '127.0.0.1';
const port = 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json' //tell http header we will be sending json (?)
  });
  
  //pass all requests to our custom router for logic, then this callback returns data to the caller
  router(req, (data) => {
    return res.end(data)
  });
});

server.listen(port, hostname, () => {
  console.log(`Server bitchin' at http://${hostname}:${port}`);
});
