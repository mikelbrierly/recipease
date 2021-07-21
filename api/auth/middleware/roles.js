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
      .deleteOwn('mealplan')
      .createOwn('fridgeIngredient')
      .readOwn('fridgeIngredient')
      .updateOwn('fridgeIngredient')
      .deleteOwn('fridgeIngredient')
      .createOwn('shoppingList')
      .readOwn('shoppingList')
      .updateOwn('shoppingList')
      .deleteOwn('shoppingList');

    ac.grant('supervisor')
      .extend('basic')
      .readAny('profile')
      .readAny('ingredient')
      .readAny('recipe')
      .readAny('mealplan')
      .readAny('fridgeIngredient')
      .readAny('shoppingList');

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
      .deleteAny('mealplan')
      .updateAny('fridgeIngredient')
      .deleteAny('fridgeIngredient')
      .updateAny('shoppingList')
      .deleteAny('shoppingList');

    return ac;
  })(),
};
