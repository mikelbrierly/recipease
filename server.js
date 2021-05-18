const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
// const secretsConfig = require('./secrets');
const tmpLocalConfig = require('./config');
// const authentication = require('./api/auth/middleware/verifyToken');
const ingredientRoutes = require('./api/routes/ingredientRoutes');
const userRoutes = require('./api/routes/userRoutes');
const verifyToken = require('./api/auth/middleware/verifyToken');
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
  // TODO: change this to an s3 bucket or ENV variable for creds
  user: tmpLocalConfig.mongodb.username,
  pass: tmpLocalConfig.mongodb.password,
  // user: secretsConfig.mongodb.username,
  // pass: secretsConfig.mongodb.password,
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
app.use(verifyToken);

// maybe logout should only be handled on the client side. Since the Bearer Token is sent as part of each request
// app.use('/logout', (req, res) => {
//   req.headers.authorization = null;
//   res.locals.loggedInUser = null;
//   res.status(200).json({ success: 'User has been successfully logged out' });
// });

// app.use('/api/auth', authentication);
app.use('/ingredients', ingredientRoutes);
app.use('/users', userRoutes);

//  TODO later after ingredient routes are all solid
// app.use('/mealplans', mealplanRoutes);
// app.use('/recipes', recipeRoutes);

app.listen(port, () => {
  console.log(`\n 🗄️  server is running in ${process.env.NODE_ENV} mode at http://${hostname}:${port} \n`);
});
// ******** END SERVER/ROUTER INITIALIZATION *********
