const express = require('express');

const router = express.Router();
const ingredients = require('../controllers/ingredientController');

// middleware to be run specific for the ingredient routes
router.use((req, res, next) => {
  console.log('log from ingredients route middleware');
  next();
});

router.get('/', (req, res, next) => ingredients.getIngredients(req, res, next));
router.get('/:id', (req, res, next) => ingredients.getIngredient(req, res, next));
router.put('/:id/update', (req, res, next) => ingredients.updateIngredient(req, res, next));
router.post('/create', (req, res, next) => ingredients.createIngredient(req, res, next));
router.delete('/:id/delete', (req, res, next) => ingredients.deleteIngredient(req, res, next));

// figure out better way to seed db
router.post('/seed', (req, res, next) => ingredients.seedDb(req, res, next));

module.exports = router;
