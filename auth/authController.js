const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// tmp local config is used until we can store sensitive data in AWS secrets manager.
// config file is gitignored so it will never be availabe off of local
const tmpLocalConfig = require('../config');
// const config = require('../config');

const User = require('../api/models/userModel');

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

router.get('/get-user', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  return jwt.verify(token, tmpLocalConfig.secret, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    return User.findById(
      decoded.id,
      { password: 0 }, // projection to omit the pw from the response
      (error, user) => {
        if (error) return res.status(500).send(`Error looking up user. ${error}`);
        if (!user) return res.status(400).send('No user found');

        return res.status(200).json(user);
      }
    );
  });
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
