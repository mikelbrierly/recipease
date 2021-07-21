/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/shoppingListModel');
const { roles } = require('../auth/middleware/roles');
const { isAccessingOwn } = require('../helpers/genericHelpers');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const ShoppingList = mongoose.model('ShoppingList');

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

  createShoppingList: (req, res, next) => {
    const newShoppingList = new ShoppingList(req.body);
    if (!req.user.id) return next('ERROR: no user found to associate with this resource');
    newShoppingList.createdBy = req.user.id; // this allows us to return shoppingLists only that user had created
    return newShoppingList.save((err, shoppingList) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${shoppingList._id}`);
    });
  },

  getShoppingList: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.shoppingListId))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.shoppingListId}`));
    return ShoppingList.findById(req.params.shoppingListId, (err, shoppingList) => {
      if (err) return next(new Error(err));
      // return the shoppingList only if it was created by the calling user, or if it is generic
      // TODO: allow access to admins
      if (isAccessingOwn(req.user.id, shoppingList.createdBy)) return res.json(shoppingList);
      return next(new Error("ERROR: you don't have permissionTo to access this resource"));
    });
  },

  getShoppingLists: (req, res, next) => {
    ShoppingList.find({}, (err, shoppingLists) => {
      if (err) return next(new Error(err));
      // this filters out shoppingLists owned by other users
      const allowedshoppingLists = shoppingLists.filter((shoppingList) =>
        isAccessingOwn(req.user.id, shoppingList.createdBy)
      );
      return res.json(allowedshoppingLists);
    });
  },

  updateShoppingList: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    ShoppingList.findById(req.params.shoppingListId).then((doc) => {
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.shoppingListId}`));
      // look up shoppingList before updating to make sure it is owned by the caller
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        ShoppingList.findByIdAndUpdate(req.params.shoppingListId, { $set: req.body }, (err, shoppingList) => {
          if (err) return next(new Error(err));
          return res.json(`successfully updated ${shoppingList._id}`);
        });
      } else {
        return next(new Error("ERROR: you don't have permissionTo to access this resource"));
      }
    });
  },

  deleteShoppingList: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    ShoppingList.findById(req.params.shoppingListId).then((doc) => {
      // look up shoppingList before deleting to make sure it is owned by the caller
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.shoppingListId}`));
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        ShoppingList.findOneAndDelete({ _id: req.params.shoppingListId }, (err, deletedDoc) => {
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
