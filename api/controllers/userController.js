const jwt = require('jsonwebtoken');
const { hash, validate } = require('../auth/middleware/password');
const { roles } = require('../auth/middleware/roles');

// const express = require('express');
// const router = express.Router();
// router.use(express.urlencoded({ extended: false }));
// router.use(express.json());

// const bcrypt = require('bcrypt');

// tmp local config is used until we can store sensitive data in AWS secrets manager.
// config file is gitignored so it will never be availabe off of local
const tmpLocalConfig = require('../../config');
// const config = require('../config');

const User = require('../models/userModel');
// const verifyToken = require('../auth/middleware/verifyToken');

module.exports = {
  signup: (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      const hashedPw = hash(password);
      const newUser = new User({ email, password: hashedPw, role: role || 'basic' });
      const accessToken = jwt.sign({ userId: newUser._id }, tmpLocalConfig.secret, {
        expiresIn: '1d',
      });
      newUser.accessToken = accessToken;
      newUser.save();
      res.json({
        data: newUser,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  login: (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = User.findOne({ email });
      if (!user) return next(new Error('Email does not exist'));
      const validPw = validate(password, user.password);
      if (!validPw) return next(new Error('Incorrect password'));
      const accessToken = jwt.sign({ userId: user._id }, tmpLocalConfig.secret, {
        expiresIn: '1d',
      });
      User.findByIdAndUpdate(user._id, { accessToken });
      return res.status(200).json({
        data: { email: user.email, role: user.role },
        accessToken,
      });
    } catch (error) {
      return next(error);
    }
  },

  logout: (_req, res) => {
    // There is no actual difference between res.send and res.json, both methods are almost identical. res.json calls res.send at the end
    // main difference is res.json will convert non objects to json
    res.status(200).send({ auth: false, token: null });
  },

  getUsers: (_req, res) => {
    // TODO: paginate
    const users = User.find({});
    res.status(200).json({
      data: users,
    });
  },

  getUser: (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = User.findById(userId);
      if (!user) return next(new Error('User does not exist'));
      return res.status(200).json({
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  },

  updateUser: (req, res, next) => {
    try {
      const update = req.body;
      const { userId } = req.params;
      User.findByIdAndUpdate(userId, update);
      const user = User.findById(userId);
      res.status(200).json({
        data: user,
        message: 'User has been updated',
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: (req, res, next) => {
    try {
      const { userId } = req.params;
      User.findByIdAndDelete(userId);
      res.status(200).json({
        data: null,
        message: 'User has been deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  // eslint-disable-next-line arrow-body-style
  grantAccess: (action, resource) => {
    return (req, res, next) => {
      try {
        const permission = roles.can(req.user.role)[action](resource);
        if (!permission.granted) {
          return res.status(401).json({
            error: "You don't have enough permission to perform this action",
          });
        }
        return next();
      } catch (error) {
        return next(error);
      }
    };
  },

  allowIfLoggedIn: (req, res, next) => {
    try {
      const user = res.locals.loggedInUser;
      if (!user) {
        return res.status(401).json({
          error: 'You need to be logged in to access this route',
        });
      }
      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  },
};

/*

router.post('/register', (req, res, next) => {
  const hashedPw = bcrypt.hashSync(req.body.password, 12);

  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPw,
    },
    (err, user) => {
      if (err) return next(new Error(err));

      // create JWT
      const token = jwt.sign({ id: user._id }, tmpLocalConfig.secret, {
        expiresIn: 86400, // 24 hrs
      });
      return res.status(200).send({ auth: true, token });
    }
  );
});

// eslint-disable-next-line arrow-body-style
router.get('/get-user', verifyToken, (req, res) => {
  return User.findById(
    req.userId,
    { password: 0 }, // projection to omit the pw from the response
    (error, user) => {
      if (error) return res.status(500).send(`Error looking up user. ${error}`);
      if (!user) return res.status(400).send('No user found');

      return res.status(200).json(user);
    }
  );
});

router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send('Server error');
    if (!user) return res.status(404).send('No user found');

    const pwIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!pwIsValid) return res.status(401).send({ auth: false, token: null });
    const token = jwt.sign({ id: user._id }, tmpLocalConfig.secret, {
      expiresIn: 86400,
    });
    return res.status(200).send({ auth: true, token });
  });
});

router.get('/logout', (req, res) => {
  // There is no actual difference between res.send and res.json, both methods are almost identical. res.json calls res.send at the end
  // main difference is res.json will convert non objects to json
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;

*/
