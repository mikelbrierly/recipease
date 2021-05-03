const ingredientsController = require('../controllers/ingredientController');

module.exports = (req, cb) => {
  if (req.method === 'GET')
    return ingredientsController.getIngredients(req, cb);
  if (req.method === 'POST')
    return ingredientsController.createIngredients(req, cb);
  if (req.method === 'PUT')
    return ingredientsController.updateIngredients(req, cb);
  if (req.method === 'DELETE')
    return ingredientsController.deleteIngredients(req, cb);
  return cb('Unsupported HTTP method');
};
