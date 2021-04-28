const mealplan = require('../controllers/mealplanController');

module.exports = (req, cb) => {
  if (req.method === 'GET') return mealplan.getMealplan(req, cb);
  if (req.method === 'POST') return mealplan.updateMealplan(req, cb);
  if (req.method === 'DELETE') return mealplan.deleteMealplan(req, cb);
  return cb('Unsupported HTTP method');
};
