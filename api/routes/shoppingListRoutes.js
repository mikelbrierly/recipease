const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const shoppingListController = require('../controllers/shoppingListController');
const userController = require('../controllers/userController');

router.get(
  '/',
  userController.allowIfLoggedIn,
  // shoppingListController.permissionTo('readAny', 'shoppingList'), // TODO: look at all the permissionTos in this file and re-evaluate
  shoppingListController.getShoppingLists
);

router.get(
  '/:shoppingListId',
  userController.allowIfLoggedIn,
  // ingredientController.permissionTo('readAny', 'ingredient'), // TODO: look at all the permissions in this file and re-evaluate
  // permissionTo('readAny', 'ingredient'),
  shoppingListController.getShoppingList
);

router.post(
  '/create',
  userController.allowIfLoggedIn,
  shoppingListController.permissionTo('createOwn', 'shoppingList'),
  shoppingListController.createShoppingList
);

router.put(
  '/:shoppingListId/update',
  userController.allowIfLoggedIn,
  shoppingListController.permissionTo('updateOwn', 'shoppingList'),
  shoppingListController.updateShoppingList
);

router.delete(
  '/:shoppingListId/delete',
  userController.allowIfLoggedIn,
  shoppingListController.permissionTo('deleteOwn', 'shoppingList'),
  shoppingListController.deleteShoppingList
);

module.exports = router;
