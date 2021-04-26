const ingredients = require('../controllers/ingredientController');

module.exports = (req, cb) => {
  if(req.method === 'GET') return ingredients.getIngredients(req, cb);
  if(req.method === 'POST') return ingredients.createIngredients(req, cb);
  if(req.method === 'PUT') return ingredients.updateIngredients(req, cb);
  if(req.method === 'DELETE') return ingredients.deleteIngredients(req, cb);
};