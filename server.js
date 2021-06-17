// TODO: (maybe) should I just wrap this entire file in an async block?

// TODO: update linter to remove these two rules
/* eslint-disable no-return-await */
/* eslint-disable arrow-body-style */

const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const { getSecret } = require('./secrets');
const ingredientRoutes = require('./api/routes/ingredientRoutes');
const userRoutes = require('./api/routes/userRoutes');
const verifyToken = require('./api/auth/middleware/verifyToken');
const recipeRoutes = require('./api/routes/recipeRoutes');
const mealplanRoutes = require('./api/routes/mealplanRoutes');
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

const dbConnect = async () => {
  const secrets = await getSecret();
  mongoose.connect(dbConnectionString, {
    useNewUrlParser: true, // https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
    useUnifiedTopology: true, // https://mongodb.github.io/node-mongodb-native/3.3/reference/unified-topology/
    user: secrets.mongodb.username,
    pass: secrets.mongodb.password,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log(`\n ~~ 🥳 successfully connected to db ${dbConnectionString} 🎉 ~~ \n`);
  });
};

dbConnect().catch((err) => {
  // TODO: better error handling
  console.error(err);
});
// ******** END DB *********

// ******** ROUTING *********
app.use(express.json()); // body-parser is included in the core Express framework now https://medium.com/@mmajdanski/express-body-parser-and-why-may-not-need-it-335803cd048c
app.use(verifyToken);

// TODO: figure out logout. maybe it should only be handled on the client side. Since the Bearer Token is sent as part of each request
// app.use('/logout', (req, res) => {
//   req.headers.authorization = null;
//   res.locals.loggedInUser = null;
//   res.status(200).json({ success: 'User has been successfully logged out' });
// });

app.use('/ingredients', ingredientRoutes);
app.use('/users', userRoutes);
app.use('/recipes', recipeRoutes);
app.use('/mealplans', mealplanRoutes);

// ******** END ROUTING *********

// ******** SERVER INITIALIZATION *********
const hostname = 'localhost';
const port = 8080;

app.listen(port, () => {
  console.log(`\n 🗄️  server is running in ${process.env.NODE_ENV} mode at http://${hostname}:${port} \n`);
});
// ******** END SERVER INITIALIZATION *********
