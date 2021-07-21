/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/ingredientModel');
const { roles } = require('../auth/middleware/roles');
const { isAccessingOwn } = require('../helpers/genericHelpers');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Ingredient = mongoose.model('Ingredient');

module.exports = {
  // TODO: break this out into a helper function
  permissionTo: (action, resource) => {
    return (req, res, next) => {
      try {
        const permissionTo = roles.can(req.user.role)[action](resource).granted;
        if (!permissionTo) {
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

  createIngredient: (req, res, next) => {
    const newIngredient = new Ingredient(req.body);
    if (!req.user.id) return next('ERROR: no user found to associate with this resource');
    newIngredient.createdBy = req.user.id; // this allows us to return ingredients only that user had created
    return newIngredient.save((err, ingredient) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${ingredient._id}`);
    });
  },

  getIngredient: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.ingredientId))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.ingredientId}`));
    return Ingredient.findById(req.params.ingredientId, (err, ingredient) => {
      if (err) return next(new Error(err));
      // TODO: maybe just return an empty array instead of an error message?
      if (!ingredient)
        return res.status(404).json([`ERROR: no ingredient found with the id ${req.params.ingredientId}`]);
      // return the ingredient only if it was created by the calling user, or if it is generic
      if (isAccessingOwn(req.user.id, ingredient.createdBy)) return res.json(ingredient);
      return next(new Error("ERROR: you don't have permission to access this resource"));
    });
  },

  getIngredients: (req, res, next) => {
    // TODO: paginate responses
    Ingredient.find({}, (err, ingredients) => {
      if (err) return next(new Error(err));
      // this filters out ingredients owned by other users
      const allowedIngredients = ingredients.filter((ingredient) => isAccessingOwn(req.user.id, ingredient.createdBy));
      // ==== shit ====
      // turns this into a crappy middleware so that it can be used by another controller (?aggregate=true query param)
      if (req.query.aggregate && typeof res === 'function') {
        const cb = res;
        return cb(allowedIngredients);
      }
      // ==== end of shit ====
      return res.json(allowedIngredients);
    });
  },

  updateIngredient: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Ingredient.findById(req.params.ingredientId).then((doc) => {
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.ingredientId}`));
      // look up ingredient before updating to make sure it is owned by the caller
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Ingredient.findByIdAndUpdate(req.params.ingredientId, { $set: req.body }, (err, ingredient) => {
          if (err) return next(new Error(err));
          return res.json(`successfully updated ${ingredient._id}`);
        });
      } else {
        return next(new Error("ERROR: you don't have permission to access this resource"));
      }
    });
  },

  deleteIngredient: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Ingredient.findById(req.params.ingredientId).then((doc) => {
      // look up ingredient before deleting to make sure it is owned by the caller
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.ingredientId}`));
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Ingredient.findOneAndDelete({ _id: req.params.ingredientId }, (err, deletedDoc) => {
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

  seedDb: (req, res, next) => {
    Ingredient.collection.insertMany(req.body, (err, addedIngredients) => {
      if (err) next(new Error(err));
      res.json(`seeded the db with ${addedIngredients}`);
    });
  },
};
