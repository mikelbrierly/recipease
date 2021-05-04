const mongoose = require('mongoose');
require('../models/ingredientModel');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Ingredient = mongoose.model('Ingredient');

module.exports = {
  createIngredient: (req, res, next) => {
    const newIngredient = new Ingredient(req.body);
    return newIngredient.save((err, ingredient) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${ingredient._id}`);
    });
  },

  getIngredient: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.id}`));
    return Ingredient.findById(req.params.id, (err, ingredient) => {
      if (err) return next(new Error(err));
      return res.json(ingredient);
    });
  },

  getIngredients: (req, res, next) => {
    // TODO: paginate responses
    Ingredient.find({}, (err, ingredients) => {
      if (err) return next(new Error(err));
      return res.json(ingredients);
    });
  },

  updateIngredient: (req, res, next) => {
    Ingredient.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, ingredient) => {
      if (err) return next(new Error(err));
      return res.json(`successfully updated ${ingredient._id}`);
    });
  },

  deleteIngredient: (req, res, next) => {
    Ingredient.findOneAndDelete({ _id: req.params.id }, (err, deletedDoc) => {
      // add 404 check
      if (err) return next(new Error(err));
      console.info(
        `Here's the deletedDoc in case we wanted to do an undo action or something like that - ${deletedDoc}`
      );
      return res.json(`${deletedDoc._id} was deleted`);
    });
  },

  seedDb: (req, res, next) => {
    Ingredient.collection.insertMany(req.body, (err, addedIngredients) => {
      if (err) next(new Error(err));
      res.json(`seeded the db with ${addedIngredients}`);
    });
  },
};
