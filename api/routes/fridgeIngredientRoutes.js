const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const fridgeIngredientController = require('../controllers/fridgeIngredientController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // mealplanController.permissionTo('readAny', 'mealplan'), // TODO: look at all the permissionTos in this file and re-evaluate
  fridgeIngredientController.getFridgeIngredients
);

router.get(
  '/:fridgeIngredientId',
  userController.allowIfLoggedIn,
  // ingredientController.permissionTo('readAny', 'ingredient'), // TODO: look at all the permissions in this file and re-evaluate
  // permissionTo('readAny', 'ingredient'),
  fridgeIngredientController.getFridgeIngredient
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  fridgeIngredientController.permissionTo('createOwn', 'fridgeIngredient'),
  fridgeIngredientController.createFridgeIngredient
);

router.put(
  '/:fridgeIngredientId/update',
  userController.allowIfLoggedIn,
  fridgeIngredientController.permissionTo('updateOwn', 'fridgeIngredient'),
  fridgeIngredientController.updateFridgeIngredient
);

router.delete(
  '/:fridgeIngredientId/delete',
  userController.allowIfLoggedIn,
  fridgeIngredientController.permissionTo('deleteOwn', 'fridgeIngredient'),
  fridgeIngredientController.deleteFridgeIngredient
);

module.exports = router;
