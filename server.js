const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const tmpLocalConfig = require('./config');
const authentication = require('./auth/authController');
const ingredientRoutes = require('./api/routes/ingredientRoutes');
// const mealplanRoutes = require('./api/routes/mealplanRoutes');
// const recipeRoutes = require('./api/routes/recipeRoutes');
require('./api/models/ingredientModel');

const app = express();

// ******** DB *********
const dbHost = config.has('database.host') ? config.get('database.host') : '';
const dbPort = config.has('database.port') ? config.get('database.port') : '';
const dbName = config.get('database.dbName');
const dbConnectionString = dbPort ? `${dbHost}:${dbPort}/${dbName}` : `${dbHost}${dbName}`;

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
  console.log(`\n ~~ 🥳 successfully connected to db ${dbConnectionString} 🎉 ~~ \n`);
});
// ******** END DB *********

// ******** SERVER/ROUTER INITIALIZATION *********
const hostname = 'localhost';
const port = 8080;

app.use(express.json()); // body-parser is included in the core Express framework now https://medium.com/@mmajdanski/express-body-parser-and-why-may-not-need-it-335803cd048c
app.use('/api/auth', authentication);
app.use('/ingredients', ingredientRoutes);

//  TODO later after ingredient routes are all solid
// app.use('/mealplans', mealplanRoutes);
// app.use('/recipes', recipeRoutes);

app.listen(port, () => {
  console.log(`\n 🗄️  server is running in ${process.env.NODE_ENV} mode at http://${hostname}:${port} \n`);
});
// ******** END SERVER/ROUTER INITIALIZATION *********
