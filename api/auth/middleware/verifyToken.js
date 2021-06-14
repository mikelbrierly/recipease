const jwt = require('jsonwebtoken');
// TODO: this is still a problem because we make a request to AWS to retrieve secrets every time this func is called. We need to cache the value of the secrets somewhere like res.locals
const { getSecret } = require('../../../secrets');
const User = require('../../models/userModel');

module.exports = (req, res, next) => {
  // TODO: wrap in try/catch block?
  if (!(req.headers && req.headers.authorization) && req.url.includes('login')) return next(); // since this is used as a middleware we don't want to block continuing in case of login

  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''; // prevent undefined typeError
  if (!token) return res.status(403).json({ auth: false, message: 'No token provided' });

  // TODO: fix the linter so it doesnt remove brackets from immediate return arrow funcs
  const verify = async () => {
    const setLocalSecrets = async () => {
      res.locals.secrets = await getSecret();
      return res.locals.secrets;
    };

    // if we have previously retrieved the secrets, then just get the cached ones from res.locals
    const secrets = res.locals.secrets ? res.locals.secrets : await setLocalSecrets();

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
    });
  };
  return verify().catch((err) => res.status(500).json({ error: err }));
};
