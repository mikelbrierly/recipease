const jwt = require('jsonwebtoken');
const { getSecret } = require('../../../secrets');
const User = require('../../models/userModel');

module.exports = (req, res, next) => {
  // todo: wrap in try/catch block?
  if (!(req.headers && req.headers.authorization)) {
    // return res.status(403).json({ auth: false, message: 'No token provided' });
    return next(); // since this is used as a middleware we don't want to block continuing in case of login
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(403).json({ auth: false, message: 'No token provided' });

  // TODO: refactor this to use async/await instead of a callback
  // also TODO: fix the linter so it doesnt remove brackets from immediate return arrow funcs
  return getSecret((secrets) =>
    jwt.verify(token, secrets.secret, async (err, decoded) => {
      if (err)
        return res.status(500).json({ auth: false, message: 'Could not authenticate token', error: err.message });

      req.userId = decoded.userId;
      res.locals.loggedInUser = await User.findById(decoded.userId);
      const { exp } = decoded;

      if (exp < Date.now().valueOf() / 1000) {
        return res.status(401).json({ error: 'JWT token has expired, please login again' });
      }
      return next();
    })
  );
};
