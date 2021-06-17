const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const recipeController = require('../controllers/recipeController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // recipeController.permission('readAny', 'recipe'), // TODO: look at all the permissions in this file and re-evaluate
  recipeController.getRecipes
);

router.get(
  '/:recipeId',
  userController.allowIfLoggedIn,
  // recipeController.permission('readAny', 'recipe'), // TODO: look at all the permissions in this file and re-evaluate
  recipeController.getRecipe
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  recipeController.permission('createOwn', 'recipe'),
  recipeController.createRecipe
);

router.put(
  '/:recipeId/update',
  userController.allowIfLoggedIn,
  recipeController.permission('updateOwn', 'recipe'),
  recipeController.updateRecipe
);

router.delete(
  '/:recipeId/delete',
  userController.allowIfLoggedIn,
  recipeController.permission('deleteOwn', 'recipe'),
  recipeController.deleteRecipe
);

module.exports = router;
