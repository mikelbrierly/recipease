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
  userController.grantAccess('readAny', 'profile'),
  userController.getUsers
);

router.get(
  '/:userId',
  userController.allowIfLoggedIn,
  userController.grantAccess('readAny', 'profile'),
  userController.getUser
);

router.put(
  '/:userId',
  userController.allowIfLoggedIn,
  userController.grantAccess('updateAny', 'profile'),
  userController.updateUser
);

router.delete(
  '/:userid',
  userController.allowIfLoggedIn,
  userController.grantAccess('deleteAny', 'profile'),
  userController.deleteUser
);

module.exports = router;
