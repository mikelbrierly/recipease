const jwt = require('jsonwebtoken');
const { hash, validate } = require('../auth/middleware/password');
const { roles } = require('../auth/middleware/roles');

// tmp local config is used until we can store sensitive data in AWS secrets manager.
// config file is gitignored so it will never be availabe off of local
const tmpLocalConfig = require('../../config');
// const config = require('../config');

const User = require('../models/userModel');

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPw = await hash(password);
      const newUser = new User({
        name: name.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPw,
        role: role || 'basic',
      });
      const accessToken = jwt.sign({ userId: newUser._id }, tmpLocalConfig.secret, {
        expiresIn: '1d',
      });
      newUser.accessToken = accessToken;
      newUser.save();
      res.json({
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ error: 'Email does not exist' });

      const validPw = await validate(password, user.password);
      if (!validPw) return res.status(401).json({ error: 'Incorrect password' });

      const accessToken = jwt.sign({ userId: user._id }, tmpLocalConfig.secret, {
        expiresIn: '1d',
      });
      await User.findByIdAndUpdate(user._id, { accessToken });
      return res.status(200).json({
        data: { email: user.email, role: user.role },
        accessToken,
      });
    } catch (error) {
      return next(error);
    }
  },

  getUsers: async (_req, res) => {
    // TODO: paginate
    const users = await User.find({});
    res.status(200).json({
      data: users,
    });
  },

  getUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(
        userId,
        { password: 0 } // projection to omit the pw from the response
      );
      if (!user) return res.status(404).json({ error: 'User does not exist' });
      return res.status(200).json({
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      // TODO: lowercase all updates
      const update = req.body;
      const { userId } = req.params;
      await User.findByIdAndUpdate(userId, update);
      const user = await User.findById(
        userId,
        { password: 0 } // projection to omit the pw from the response
      );
      res.status(200).json({
        data: user,
        message: 'User has been updated',
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      await User.findByIdAndDelete(userId);
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
        const permission = roles.can(req.user.role)[action](resource).granted; // allow access to supervisors and admins
        if (req.userId === req.params.userId) return next(); // if user is accessing their own profile, allow access
        if (!permission) {
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
