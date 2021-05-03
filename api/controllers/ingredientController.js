const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#findandmodify
const Ingredient = mongoose.model('Ingredient');

// this is like the equivalent of /ingredient/:id
const id = (url) => url.match(/^\/ingredients(.*)/)[1];

// =========== jank-ass body-parser ============
const parseBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (buffer) => {
      body += buffer.toString();
    });
    request.on('end', () => {
      if (!body) return reject(new Error('ERROR: missing required parameters'));
      return resolve(JSON.parse(body));
    });
  });
// ======== end of jank-ass body parser =========

const actions = {
  createIngredients: (req, cb) => {
    if (id(req.url) !== '/create' && id(req.url) !== '/seed')
      return cb(
        'ERROR: hit /ingredients/create to add item to maintain function signature integrity'
      );

    return parseBody(req)
      .then((resp) => {
        req.body = resp;

        // === seed db ===
        if (id(req.url) === '/seed') return actions.seed(req.body, cb);
        // === end seed db ===

        const newIngredient = new Ingredient(req.body);
        return newIngredient.save((err, ingredient) => {
          if (err) return cb(err.message || err);
          return cb(`successfully added ${ingredient}`);
        });
      })
      .catch((err) => {
        cb(err);
      });
  },

  getIngredients: (req, cb) => {
    // single ingredient
    if (id(req.url)) {
      return Ingredient.findById(
        id(req.url).split('/')[1],
        (err, ingredient) => {
          if (err) return cb(err);
          return cb(ingredient);
        }
      );
    }

    // all ingredients
    // TODO: paginate responses
    return Ingredient.find({}, (err, ingredient) => {
      if (err) return cb(err.message || err);
      return cb(ingredient);
    });
  },

  updateIngredients: (req, cb) => {
    const strippedId = id(req.url).split('/')[1];
    if (!id(req.url)) {
      return cb(
        'ERROR: Missing unique identifier for ingredient. did you mean to retrieve all ingredients instead?'
      );
    }

    return parseBody(req)
      .then((resp) => {
        req.body = resp;
        Ingredient.findByIdAndUpdate(
          strippedId,
          { $set: req.body },
          (err, ingredient) => {
            if (err) return cb(err.message || err);
            return cb(`successfully updated ${ingredient}`);
          }
        );
      })
      .catch((err) => {
        cb(err);
      });
  },

  deleteIngredients: (req, cb) => {
    const strippedId = id(req.url).split('/')[1];
    if (!strippedId)
      return cb(
        'ERROR: Missing unique identifier for item to be deleted. No changes made.'
      );

    // do db work to delete item maybe return delta? save that change somewhere so it can be undone?
    return Ingredient.findOneAndDelete(strippedId, (err, deletedDoc) => {
      if (err) return cb(err.message || err);
      console.info(
        `Here's the deletedDoc in case we wanted to do an undo action or something like that - ${deletedDoc}`
      );
      return cb(`${deletedDoc} was deleted`);
    });
  },

  seed: (ingredients, cb) => {
    Ingredient.collection.insertMany(ingredients, (err, addedIngredients) => {
      if (err) cb(err.message || err);
      cb(`seeded the db with ${addedIngredients}`);
    });
  },
};

module.exports = actions;
