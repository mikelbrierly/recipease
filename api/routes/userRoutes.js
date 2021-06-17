const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const userController = require('../controllers/userController');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get(
  '/',
  userController.allowIfLoggedIn,
  userController.permissionTo('readAny', 'profile'),
  userController.getUsers
);

router.get(
  '/:userId',
  userController.allowIfLoggedIn,
  userController.permissionTo('readAny', 'profile'),
  userController.getUser
);

router.put(
  '/:userId',
  userController.allowIfLoggedIn,
  userController.permissionTo('updateAny', 'profile'),
  userController.updateUser
);

router.delete(
  '/:userId',
  userController.allowIfLoggedIn,
  userController.permissionTo('deleteAny', 'profile'),
  userController.deleteUser
);

// admin route for granting supervisor and admin privileges
router.put(
  '/admin/register/:userId',
  userController.allowIfLoggedIn,
  userController.grantAdminAccess('updateAny', 'profile'),
  userController.registerAdmin
);

module.exports = router;
