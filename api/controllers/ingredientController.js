const mongoose = require('mongoose');
const ingredient = mongoose.model('Ingredient');

//this is like the equivalent of /ingredient/:id
const id = url => url.match(/^\/ingredients(.*)/)[1];

// =========== jank-ass body-parser ============
const retrieveBody = (request) => {
  return new Promise((resolve, reject) => {

    let body = '';
    request.on('data', buffer => {
      body += buffer.toString();
    });
    request.on('end', () => {
      if(!body) return reject("ERROR: missing required parameters");
      resolve(JSON.parse(body));
    });
  });
};
// ======== end of jank-ass body parser =========


const actions = {

  createIngredients: (req, cb) => {

    if(id(req.url) !== '/create') return cb("ERROR: hit /ingredients/create to add item to maintain function signature integrity");

    retrieveBody(req)
      .then(resp => {
        req.body = resp;
        //take request.body and update single entry in DB
        cb(`successfully added ${JSON.stringify(req.body)}`);
      })
      .catch(err => {
        cb(err);
      });
  },

  getIngredients: (req, cb) => {
    if(id(req.url)) {
      cb("here is one single ingredient")
      //get single ingredient from DB
      //return early
      return;
    }

    //return all ingredients from DB (paginated)
    cb("here are all of the ingredients (paginated)");
  },

  updateIngredients: (req, cb) => {
    if(!id(req.url)) {
      return cb("ERROR: Missing unique identifier for ingredient. did you mean to retrieve all ingredients instead?")
    }

    //update single ingredient in DB
    cb("successfully updated one ingredient");
    //add in some error handling
  },

  deleteIngredients: (req, cb) => {
    if(!id(req.url)) return cb("ERROR: Missing unique identifier for item to be deleted. No changes made.");

    //do db work to delete item maybe return delta? save that change somewhere so it can be undone?
    cb(`item ${id(req.url)} was deleted`);
  },

}

module.exports = actions;