/* eslint-disable arrow-body-style */
const mongoose = require('mongoose');
require('../models/mealplanModel');
const { roles } = require('../auth/middleware/roles');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Mealplan = mongoose.model('Mealplan');

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

  createMealplan: (req, res, next) => {
    const newMealplan = new Mealplan(req.body);
    if (!req.user.id) return next('ERROR: no user found to associate with this resource');
    newMealplan.createdBy = req.user.id; // this allows us to return mealplans only that user had created
    return newMealplan.save((err, mealplan) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${mealplan._id}`);
    });
  },

  getMealplan: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.mealplanId))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.mealplanId}`));
    return Mealplan.findById(req.params.mealplanId, (err, mealplan) => {
      if (err) return next(new Error(err));
      // return the mealplan only if it was created by the calling user, or if it is generic
      // TODO: allow access to admins
      if (isAccessingOwn(req.user.id, mealplan.createdBy)) return res.json(mealplan);
      return next(new Error("ERROR: you don't have permission to access this resource"));
    });
  },

  getMealplans: (req, res, next) => {
    // TODO: paginate responses
    Mealplan.find({}, (err, mealplans) => {
      if (err) return next(new Error(err));
      // this filters the mealplans to only return generic and the users own mealplans
      const allowedMealplans = mealplans.filter((mealplan) => isAccessingOwn(req.user.id, mealplan.createdBy));
      return res.json(allowedMealplans);
    });
  },

  updateMealplan: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Mealplan.findById(req.params.mealplanId).then((doc) => {
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.mealplanId}`));
      // look up mealplan before updating to make sure it is owned by the caller
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Mealplan.findByIdAndUpdate(req.params.mealplanId, { $set: req.body }, (err, mealplan) => {
          if (err) return next(new Error(err));
          return res.json(`successfully updated ${mealplan._id}`);
        });
      } else {
        return next(new Error("ERROR: you don't have permission to access this resource"));
      }
    });
  },

  deleteMealplan: (req, res, next) => {
    // eslint-disable-next-line consistent-return
    Mealplan.findById(req.params.mealplanId).then((doc) => {
      // look up mealplan before deleting to make sure it is owned by the caller
      if (!doc) return next(new Error(`ERROR: no document found with id ${req.params.mealplanId}`));
      if (isAccessingOwn(req.user.id, doc.createdBy)) {
        Mealplan.findOneAndDelete({ _id: req.params.mealplanId }, (err, deletedDoc) => {
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
