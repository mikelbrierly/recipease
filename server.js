const http = require('http');
const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const tmpLocalConfig = require('./config');
require('./api/models/ingredientModel');

const app = express();

// ******** DB *********
// break out db initialization to separate file
const dbHost = config.has('database.host') ? config.get('database.host') : '';
const dbPort = config.has('database.port') ? config.get('database.port') : '';
const dbConnectionString = dbPort ? `${dbHost}:${dbPort}` : dbHost;

if (!dbHost) {
  console.error('database configuration settings not set');
}

mongoose.connect(dbConnectionString, {
  useNewUrlParser: true, // https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
  useUnifiedTopology: true, // https://mongodb.github.io/node-mongodb-native/3.3/reference/unified-topology/
  // TODO: change this to an s3 bucket or something storing credentials securely
  user: tmpLocalConfig.mongodb.username,
  pass: tmpLocalConfig.mongodb.password,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log(
    `\n ~~ 🥳 successfully connected to db ${dbConnectionString} 🎉 ~~ \n`
  );
});

// ******** END DB *********

// ******** ROUTING *********
// const router = require('./api/router');
// ****** END ROUTING *******

// ******** SERVER/ROUTER INITIALIZATION *********
const hostname = 'localhost';
const port = 8080;

// const server = http.createServer((req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'application/json', // tell http header we will be sending json (?)
//   });

//   // pass all requests to our custom router for logic, then this callback returns data to the caller
//   router(req, (data) => res.end(JSON.stringify(data)));
// });
app.get('/', (req, res) => {
  res.send('hello');
});

// server.listen(port, hostname, () => {
//   console.log(
//     `\n 🗄️  server is running in ${process.env.NODE_ENV} mode at http://${hostname}:${port} \n`
//   );
// });
app.listen(port, () => {
  console.log(
    `\n 🗄️  server is running in ${process.env.NODE_ENV} mode at http://${hostname}:${port} \n`
  );
});
// ******** END SERVER/ROUTER INITIALIZATION *********
