const AccessControl = require('accesscontrol');

const ac = new AccessControl();

// TODO: there has to be a shorthand for this chaining
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
      .deleteOwn('recipe')
      .createOwn('mealplan')
      .readOwn('mealplan')
      .updateOwn('mealplan')
      .deleteOwn('mealplan');

    ac.grant('supervisor')
      .extend('basic')
      .readAny('profile')
      .readAny('ingredient')
      .readAny('recipe')
      .readAny('mealplan');

    ac.grant('admin')
      .extend('basic')
      .extend('supervisor')
      .updateAny('profile')
      .deleteAny('profile')
      .updateAny('ingredient')
      .deleteAny('ingredient')
      .updateAny('recipe')
      .deleteAny('recipe')
      .updateAny('mealplan')
      .deleteAny('mealplan');

    return ac;
  })(),
};
