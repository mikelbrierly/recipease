const ingredientRoute = require('./routes/ingredientRoutes');
const recipeRoute = require('./routes/recipeRoutes');
const mealplanRoute = require('./routes/mealplanRoutes');

module.exports = (req, cb) => {
  //specific for create? Rather than just ingredient* ?
  if(req.url.match(/^\/ingredients(.*)/)) ingredientRoute(req, cb);
  if(req.url.match(/^\/recipes(.*)/)) recipeRoute(req, cb);
  if(req.url.match(/^\/mealplans(.*)/)) mealplanRoute(req, cb);
};