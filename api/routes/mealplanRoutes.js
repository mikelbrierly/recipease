const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const mealplanController = require('../controllers/mealplanController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // mealplanController.permission('readAny', 'mealplan'), // TODO: look at all the permissions in this file and re-evaluate
  mealplanController.getMealplans
);

router.get(
  '/:mealplanId',
  userController.allowIfLoggedIn,
  // mealplanController.permission('readAny', 'mealplan'), // TODO: look at all the permissions in this file and re-evaluate
  mealplanController.getMealplan
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  mealplanController.permission('createOwn', 'mealplan'),
  mealplanController.createMealplan
);

router.put(
  '/:mealplanId/update',
  userController.allowIfLoggedIn,
  mealplanController.permission('updateOwn', 'mealplan'),
  mealplanController.updateMealplan
);

router.delete(
  '/:mealplanId/delete',
  userController.allowIfLoggedIn,
  mealplanController.permission('deleteOwn', 'mealplan'),
  mealplanController.deleteMealplan
);

module.exports = router;
