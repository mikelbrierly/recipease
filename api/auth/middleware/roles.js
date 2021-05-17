const AccessControl = require('accesscontrol');

const ac = new AccessControl();

module.exports = {
  roles: (() => {
    ac.grant('basic')
      .readOwn('profile')
      .updateOwn('profile')
      .createOwn('ingredients')
      .readOwn('ingredients')
      .updateOwn('ingredients')
      .deleteOwn('ingredients');

    ac.grant('supervisor').extend('basic').readAny('profile');

    ac.grant('admin').extend('basic').extend('supervisor').updateAny('profile').deleteAny('profile');

    return ac;
  })(),
};
