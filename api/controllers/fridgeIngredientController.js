/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/fridgeIngredientModel');
const { roles } = require('../auth/middleware/roles');
const { isAccessingOwn } = require('../helpers/genericHelpers');
const ingredientController = require('./ingredientController');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const FridgeIngredient = mongoose.model('FridgeIngredient');

module.exports = {
  // TODO: break this out into an exported helper function since it's used all over the controllers
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

  createFridgeIngredient: (req, res, next) => {
    const newFridgeIngredient = new FridgeIngredient(req.body);
    if (!req.user.id) return next('ERROR: no user found to associate with this resource');
    newFridgeIngredient.createdBy = req.user.id; // this allows us to return fridgeIngredients only that user had created
    return newFridgeIngredient.save((err, fridgeIngredient) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${fridgeIngredient._id}`);
    });
  },

  getFridgeIngredient: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.fridgeIngredientId))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.fridgeIngredientId}`));
    return FridgeIngredient.findById(req.params.fridgeIngredientId, (err, fridgeIngredient) => {
      if (err) return next(new Error(err));
      // return the fridgeIngredient only if it was created by the calling user, or if it is generic
      // TODO: allow access to admins
      if (isAccessingOwn(req.user.id, fridgeIngredient.createdBy)) return res.json(fridgeIngredient);
      return next(new Error("ERROR: you don't have permissionTo to access this resource"));
    });
  },

  // TODO: need to build a service and break out the business(service) logic from the orchestration(controller) logic
  // https://www.coreycleary.me/should-one-express-controller-call-another
  getFridgeIngredients: (req, res, next) => {
    // TODO: need to do more with the pagination response instead of just calling .docs.filter
    // for example "hasNextPage", "hasPrevPage", "totalDocs", etc. (will be useful for the frontend)
    const paginateOptions = {
      page: req.query.page || 1,
      limit: 5,
    };
    if (req.query.noPagination) paginateOptions.pagination = false;

    FridgeIngredient.paginate({}, paginateOptions, (err, fridgeIngredients) => {
      if (err) return next(new Error(err));
      // this filters out fridgeIngredients owned by other users
      const allowedfridgeIngredients = fridgeIngredients.docs.filter((fridgeIngredient) =>
        isAccessingOwn(req.user.id, fridgeIngredient.createdBy)
      );
      // if we aren't aggregating, just return the normal docs
      if (!req.query.aggregate) return res.json(allowedfridgeIngredients);

      // TODO: this is shit and shouldn't call another controller. needs a service
      return ingredientController.getIngredients(req, (ingredients) => {
        const aggregatedIngredients = [];
        allowedfridgeIngredients.forEach((fridgeItem) => {
          ingredients.forEach((ingredient) => {
            if (fridgeItem.ingredient_id === ingredient.id) {
              const ingredientCopy = fridgeItem;
              ingredientCopy._doc.ingredientDetails = ingredient;
              aggregatedIngredients.push(ingredientCopy);
            }
          });
        });
        return res.json(aggregatedIngredients);
      });
    });
  },

  updateFridgeIngredient: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    FridgeIngredient.findById(req.params.fridgeIngredientId).then((doc) => {
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.fridgeIngredientId}`));
      // look up fridgeIngredient before updating to make sure it is owned by the caller
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        FridgeIngredient.findByIdAndUpdate(
          req.params.fridgeIngredientId,
          { $set: req.body },
          (err, fridgeIngredient) => {
            if (err) return next(new Error(err));
            return res.json(`successfully updated ${fridgeIngredient._id}`);
          }
        );
      } else {
        return next(new Error("ERROR: you don't have permissionTo to access this resource"));
      }
    });
  },

  deleteFridgeIngredient: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    FridgeIngredient.findById(req.params.fridgeIngredientId).then((doc) => {
      // look up fridgeIngredient before deleting to make sure it is owned by the caller
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.fridgeIngredientId}`));
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        FridgeIngredient.findOneAndDelete({ _id: req.params.fridgeIngredientId }, (err, deletedDoc) => {
          // TODO: add 404 check
          if (err) return next(new Error(err));
          console.info(
            `Here's the deletedDoc in case we wanted to do an undo action or something like that - ${deletedDoc}`
          );
          return res.json(`${deletedDoc._id} was deleted`);
        });
      } else {
        return next(new Error("ERROR: you don't have permissionTo to delete this resource"));
      }
    });
  },
};
