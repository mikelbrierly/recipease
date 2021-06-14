/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/ingredientModel');
const { roles } = require('../auth/middleware/roles');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Ingredient = mongoose.model('Ingredient');

// TODO: take a look at this and see if it can be refactored into a middleware or something. Feels a little funky to me
const isAccessingOwn = (userId, createdById) => !createdById || userId === createdById;

module.exports = {
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
      // return the ingredient only if it was created by the calling user, or if it is generic
      if (isAccessingOwn(req.user.id, ingredient.createdBy)) return res.json(ingredient);
      return next(new Error("ERROR: you don't have permission to access this resource"));
    });
  },

  getIngredients: (req, res, next) => {
    // TODO: paginate responses
    Ingredient.find({}, (err, ingredients) => {
      if (err) return next(new Error(err));
      // this filters the ingredients to only return generic and the users own ingredients
      const allowedIngredients = ingredients.filter((ingredient) => isAccessingOwn(req.user.id, ingredient.createdBy));
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
