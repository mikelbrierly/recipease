/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/recipeModel');
const { roles } = require('../auth/middleware/roles');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Recipe = mongoose.model('Recipe');

// TODO: take a look at this and see if it can be refactored into a middleware or something. Feels a little funky to me
const isAccessingOwn = (userId, createdById) => !createdById || userId === createdById;

module.exports = {
  // TODO: break this out into an exported helper function since it's used all over the controllers
  permission: (action, resource) => {
    return (req, res, next) => {
      try {
        const permission = roles.can(req.user.role)[action](resource).granted;
        if (!permission) {
          return res.status(401).json({
            error: "You don't have enough permission to perform this action",
          });
        }
        return next();
      } catch (error) {
        return next(error);
      }
    };
  },

  createRecipe: (req, res, next) => {
    const newRecipe = new Recipe(req.body);
    if (!req.user.id) return next('ERROR: no user found to associate with this resource');
    newRecipe.createdBy = req.user.id; // this allows us to return recipes only that user had created
    return newRecipe.save((err, recipe) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${recipe._id}`);
    });
  },

  getRecipe: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.recipeId))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.recipeId}`));
    return Recipe.findById(req.params.recipeId, (err, recipe) => {
      if (err) return next(new Error(err));
      // return the recipe only if it was created by the calling user, or if it is generic
      if (isAccessingOwn(req.user.id, recipe.createdBy)) return res.json(recipe);
      return next(new Error("ERROR: you don't have permission to access this resource"));
    });
  },

  getRecipes: (req, res, next) => {
    // TODO: paginate responses
    Recipe.find({}, (err, recipes) => {
      if (err) return next(new Error(err));
      // this filters the recipes to only return generic and the users own recipes
      const allowedRecipes = recipes.filter((recipe) => isAccessingOwn(req.user.id, recipe.createdBy));
      return res.json(allowedRecipes);
    });
  },

  updateRecipe: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Recipe.findById(req.params.recipeId).then((doc) => {
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.recipeId}`));
      // look up recipe before updating to make sure it is owned by the caller
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Recipe.findByIdAndUpdate(req.params.recipeId, { $set: req.body }, (err, recipe) => {
          if (err) return next(new Error(err));
          return res.json(`successfully updated ${recipe._id}`);
        });
      } else {
        return next(new Error("ERROR: you don't have permission to access this resource"));
      }
    });
  },

  deleteRecipe: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Recipe.findById(req.params.recipeId).then((doc) => {
      // look up recipe before deleting to make sure it is owned by the caller
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.recipeId}`));
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Recipe.findOneAndDelete({ _id: req.params.recipeId }, (err, deletedDoc) => {
          // TODO: add 404 check
          if (err) return next(new Error(err));
          console.info(
            `Here's the deletedDoc in case we wanted to do an undo action or something like that - ${deletedDoc}`
          );
          return res.json(`${deletedDoc._id} was deleted`);
        });
      } else {
        return next(new Error("ERROR: you don't have permission to delete this resource"));
      }
    });
  },
};
