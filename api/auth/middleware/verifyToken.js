const jwt = require('jsonwebtoken');
const tmpLocalConfig = require('../../../config');

module.exports = (req, res, next) => {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(403).json({ auth: false, message: 'No token provided' });
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(403).json({ auth: false, message: 'No token provided' });

  return jwt.verify(token, tmpLocalConfig.secret, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Could not authenticate token' });

    req.userId = decoded.id;
    return next();
  });
};
