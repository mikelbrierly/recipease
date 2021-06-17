const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const recipeController = require('../controllers/recipeController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // recipeController.permissionTo('readAny', 'recipe'), // TODO: look at all the permissionTos in this file and re-evaluate
  recipeController.getRecipes
);

router.get(
  '/:recipeId',
  userController.allowIfLoggedIn,
  // recipeController.permissionTo('readAny', 'recipe'), // TODO: look at all the permissionTos in this file and re-evaluate
  recipeController.getRecipe
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  recipeController.permissionTo('createOwn', 'recipe'),
  recipeController.createRecipe
);

router.put(
  '/:recipeId/update',
  userController.allowIfLoggedIn,
  recipeController.permissionTo('updateOwn', 'recipe'),
  recipeController.updateRecipe
);

router.delete(
  '/:recipeId/delete',
  userController.allowIfLoggedIn,
  recipeController.permissionTo('deleteOwn', 'recipe'),
  recipeController.deleteRecipe
);

module.exports = router;
