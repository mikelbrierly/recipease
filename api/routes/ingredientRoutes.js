const ingredients_controller = require('../controllers/ingredientController');

module.exports = (req, cb) => {
  if(req.method === 'GET') return ingredients_controller.getIngredients(req, cb);
  if(req.method === 'POST') return ingredients_controller.createIngredients(req, cb);
  if(req.method === 'PUT') return ingredients_controller.updateIngredients(req, cb);
  if(req.method === 'DELETE') return ingredients_controller.deleteIngredients(req, cb);
};