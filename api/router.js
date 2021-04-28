const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealplanRoutes = require('./routes/mealplanRoutes');

module.exports = (req, cb) => {
  // specific for create? Rather than just ingredient* ?
  if (req.url.match(/^\/ingredients(.*)/)) ingredientRoutes(req, cb);
  if (req.url.match(/^\/recipes(.*)/)) recipeRoutes(req, cb);
  if (req.url.match(/^\/mealplans(.*)/)) mealplanRoutes(req, cb);
};
