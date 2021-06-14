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
      .deleteOwn('ingredient');

    ac.grant('supervisor').extend('basic').readAny('profile').readAny('ingredient');

    ac.grant('admin')
      .extend('basic')
      .extend('supervisor')
      .updateAny('profile')
      .deleteAny('profile')
      .updateAny('ingredient')
      .deleteAny('ingredient');

    return ac;
  })(),
};
