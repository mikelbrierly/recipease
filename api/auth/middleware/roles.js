const AccessControl = require('accesscontrol');

const ac = new AccessControl();

module.exports = {
  roles: (() => {
    ac.grant('basic')
      .readOwn('profile')
      .updateOwn('profile')
      .createOwn('ingredient')
      .readOwn('ingredient')
      .updateOwn('ingredient')
      .deleteOwn('ingredient')
      .createOwn('recipe')
      .readOwn('recipe')
      .updateOwn('recipe')
      .deleteOwn('recipe');

    ac.grant('supervisor').extend('basic').readAny('profile').readAny('ingredient').readAny('recipe');

    ac.grant('admin')
      .extend('basic')
      .extend('supervisor')
      .updateAny('profile')
      .deleteAny('profile')
      .updateAny('ingredient')
      .deleteAny('ingredient')
      .updateAny('recipe')
      .deleteAny('recipe');

    return ac;
  })(),
};
