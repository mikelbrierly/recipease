const bcrypt = require('bcrypt');

module.exports = {
  hash: (password) => bcrypt.hash(password, 12),

  validate: (plainPw, hashedPw) => bcrypt.compare(plainPw, hashedPw),
};
