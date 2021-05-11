const jwt = require('jsonwebtoken');
const tmpLocalConfig = require('../../../config');
const User = require('../../models/userModel');

module.exports = (req, res, next) => {
  // todo: wrap in try/catch block?
  if (!(req.headers && req.headers.authorization)) {
    // return res.status(403).json({ auth: false, message: 'No token provided' });
    return next(); // since this is used as a middleware we don't want to block continuing
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(403).json({ auth: false, message: 'No token provided' });

  return jwt.verify(token, tmpLocalConfig.secret, (err, decoded) => {
    if (err) return res.status(500).json({ auth: false, message: 'Could not authenticate token' });

    req.userId = decoded.id; // not needed since we're getting the id from res.locals or from /:id?
    res.locals.loggedInUser = User.findById(decoded.id);
    const { exp } = decoded;

    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({ error: 'JWT token has expired, please login again' });
    }
    return next();
  });
};
