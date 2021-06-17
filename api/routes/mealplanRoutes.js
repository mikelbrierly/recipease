const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const mealplanController = require('../controllers/mealplanController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // mealplanController.permissionTo('readAny', 'mealplan'), // TODO: look at all the permissionTos in this file and re-evaluate
  mealplanController.getMealplans
);

router.get(
  '/:mealplanId',
  userController.allowIfLoggedIn,
  // mealplanController.permissionTo('readAny', 'mealplan'), // TODO: look at all the permissionTos in this file and re-evaluate
  mealplanController.getMealplan
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  mealplanController.permissionTo('createOwn', 'mealplan'),
  mealplanController.createMealplan
);

router.put(
  '/:mealplanId/update',
  userController.allowIfLoggedIn,
  mealplanController.permissionTo('updateOwn', 'mealplan'),
  mealplanController.updateMealplan
);

router.delete(
  '/:mealplanId/delete',
  userController.allowIfLoggedIn,
  mealplanController.permissionTo('deleteOwn', 'mealplan'),
  mealplanController.deleteMealplan
);

module.exports = router;
