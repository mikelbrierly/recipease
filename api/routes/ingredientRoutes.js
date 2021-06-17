const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const ingredientController = require('../controllers/ingredientController');
const userController = require('../controllers/userController');
// const { permissionTo } = require('../helpers/genericHelpers');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // ingredientController.permissionTo('readAny', 'ingredient'), // TODO: look at all the permissions in this file and re-evaluate
  ingredientController.getIngredients
);

router.get(
  '/:ingredientId',
  userController.allowIfLoggedIn,
  // ingredientController.permissionTo('readAny', 'ingredient'), // TODO: look at all the permissions in this file and re-evaluate
  // permissionTo('readAny', 'ingredient'),
  ingredientController.getIngredient
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  ingredientController.permissionTo('createOwn', 'ingredient'),
  ingredientController.createIngredient
);

router.put(
  '/:ingredientId/update',
  userController.allowIfLoggedIn,
  ingredientController.permissionTo('updateOwn', 'ingredient'),
  ingredientController.updateIngredient
);

router.delete(
  '/:ingredientId/delete',
  userController.allowIfLoggedIn,
  ingredientController.permissionTo('deleteOwn', 'ingredient'),
  ingredientController.deleteIngredient
);

// TODO: figure out better way to seed db
router.post('/seed', (req, res, next) => ingredientController.seedDb(req, res, next));

module.exports = router;
