const mongoose = require('mongoose');
require('../models/ingredientModel');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Ingredient = mongoose.model('Ingredient');

// this is like the equivalent of /ingredient/:id
// const id = (url) => url.match(/^\/ingredients(.*)/)[1];

// =========== jank-ass body-parser ============
// const parseBody = (request) =>
//   new Promise((resolve, reject) => {
//     let body = '';
//     request.on('data', (buffer) => {
//       body += buffer.toString();
//     });
//     request.on('end', () => {
//       if (!body) return reject(new Error('ERROR: missing required parameters'));
//       return resolve(JSON.parse(body));
//     });
//   });
// ======== end of jank-ass body parser =========

module.exports = {
  createIngredient: (req, res, next) => {
    // if (id(req.url) !== '/create' && id(req.url) !== '/seed')
    //   return cb(
    //     'ERROR: hit /ingredients/create to add item to maintain function signature integrity'
    //   );

    // return parseBody(req)
    //   .then((resp) => {
    // req.body = resp;

    // === seed db ===
    // if (id(req.url) === '/seed') return actions.seed(req.body, cb);
    // === end seed db ===

    const newIngredient = new Ingredient(req.body);
    return newIngredient.save((err, ingredient) => {
      if (err) return next(new Error(err));
      return res.json(`successfully added ${ingredient._id}`);
    });
    // })
    // .catch((err) => {
    //   cb(err);
    // });
  },

  getIngredient: (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(new Error(`invalid mongo _id, expected 12 bit id, but recieved ${req.params.id}`));
    return Ingredient.findById(req.params.id, (err, ingredient) => {
      // if (err) return res.err(err.message || err);
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
    req.params.id;
    // const strippedId = id(req.url).split('/')[1];
    // if (!id(req.url)) {
    //   return cb('ERROR: Missing unique identifier for ingredient. did you mean to retrieve all ingredients instead?');
    // }

    // return parseBody(req)
    //   .then((resp) => {
    // req.body = resp;
    // Ingredient.findByIdAndUpdate(strippedId, { $set: req.body }, (err, ingredient) => {
    Ingredient.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, ingredient) => {
      if (err) return next(new Error(err));
      res.json(`successfully updated ${ingredient._id}`);
    });
    // })
    // .catch((err) => {
    //   cb(err);
    // });
  },

  deleteIngredient: (req, res, next) => {
    // const strippedId = id(req.url).split('/')[1];
    // if (!strippedId) return cb('ERROR: Missing unique identifier for item to be deleted. No changes made.');

    // do db work to delete item maybe return delta? save that change somewhere so it can be undone?
    // return Ingredient.findOneAndDelete(strippedId, (err, deletedDoc) => {
    Ingredient.findOneAndDelete({ _id: req.params.id }, (err, deletedDoc) => {
      //add 404 check
      if (err) return next(new Error(err));
      console.info(
        `Here's the deletedDoc in case we wanted to do an undo action or something like that - ${deletedDoc}`
      );
      res.json(`${deletedDoc._id} was deleted`);
    });
  },

  seedDb: (req, res, next) => {
    Ingredient.collection.insertMany(req.body, (err, addedIngredients) => {
      if (err) next(new Error(err));
      res.json(`seeded the db with ${addedIngredients}`);
    });
  },
};
