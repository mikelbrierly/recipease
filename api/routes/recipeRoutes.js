const recipe = require('../controllers/recipeController');

module.exports = (req, cb) => {
  if(req.method === 'GET') return recipe.getRecipe(req, cb);
  if(req.method === 'POST') return recipe.updateRecipe(req, cb);
  if(req.method === 'DELETE') return recipe.deleteRecipe(req, cb);
};