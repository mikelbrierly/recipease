/* eslint-disable arrow-body-style */
const jwt = require('jsonwebtoken');
const { hash, validate } = require('../auth/middleware/password');
const { roles } = require('../auth/middleware/roles');

// TODO: this is still a problem because we make a request to AWS to retrieve secrets every time this func is called. We need to cache the value of the secrets somewhere like res.locals
const { getSecret } = require('../../secrets');

const User = require('../models/userModel');

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const hashedPw = await hash(password);
      const secrets = await getSecret();
      const newUser = new User({
        name: name.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPw,
        role: 'basic',
      });
      const accessToken = jwt.sign({ userId: newUser._id }, secrets.secret, {
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

      const secrets = await getSecret();
      const accessToken = jwt.sign({ userId: user._id }, secrets.secret, {
        expiresIn: '1d',
      });
      await User.findByIdAndUpdate(user._id, { accessToken });
      return res.status(200).json({
        data: { email: user.email, role: user.role, _id: user._id },
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
      const { userId } = req.params;

      // prevent sensitive data from being updated by creating a safeUpdate that removes role, _id, and JWT
      const { role, _id, accessToken, ...safeUpdate } = req.body;

      // sanitize (lowercase) all string updates to the user object
      const sanitizedUpdate = Object.keys(safeUpdate).reduce((acc, item) => {
        if (typeof item === 'string') {
          acc[item] = safeUpdate[item].toLowerCase();
        }
        return acc;
      }, {});

      if (!Object.keys(sanitizedUpdate).length) return res.status(200).json('No valid changes made to user');

      // update user in the db
      await User.findByIdAndUpdate(userId, sanitizedUpdate);
      const user = await User.findById(
        userId,
        { password: 0 } // projection to omit the pw from the response
      );
      return res.status(200).json({
        message: 'User has been updated',
        updatedUser: user,
      });
    } catch (error) {
      return next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!userId) res.status(500).json({ error: 'no userId passed in to delete call' });
      await User.findByIdAndDelete(userId);
      res.status(200).json({
        message: 'User has been deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  registerAdmin: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // TODO: create separate helper function for trimming and sanitizing inputs
      if (!userId || !userId.trim())
        return res
          .status(200)
          .json('Missing userId. You must create a base user before upgrading the role to admin/supervisor');
      if (!role || !role.trim()) return res.status(200).json('No role change passed in');

      // update user in the db
      await User.findByIdAndUpdate(userId, { role: role.toLowerCase() });
      const user = await User.findById(
        userId,
        { password: 0 } // projection to omit the pw from the response
      );
      return res.status(200).json({
        message: `User role has successfully been updated to ${role.toLowerCase()}.`,
        updatedUser: user,
      });
    } catch (error) {
      return next(error);
    }
  },

  grantAdminAccess: (action, resource) => {
    return (req, res, next) => {
      try {
        const permission = roles.can(req.user.role)[action](resource).granted; // allow access to admins
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
