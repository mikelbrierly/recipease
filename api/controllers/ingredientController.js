//this is like the equivalent of /ingredient/:id
const id = url => url.match(/^\/ingredients(.*)/)[1];

// plural/singular for methods?
const actions = {

  createIngredients: (req, cb) => {

    if(id(req.url) !== '/create') {
      // throw error since it needs to maintain function signature integrity

      //interesting. actually throwing an error (throw new Error) kills the server, it doesn't actually send a response. So I should send an http response code instead
      return cb("ERROR: hit /ingredients/create to add item to maintain function signature integrity");
      // probably build separate function for just handling the errors
    } 
    
    // =========== This is basically just a jank-ass body-parser ============
    //and it comes baked into Express
    let body = '';
    req.on('data', buffer => {
      body += buffer.toString();
    });
    req.on('end', () => {
      if(!body) return cb("ERROR: missing required parameters");
      req.body = JSON.parse(body);

      //take req.body and update single entry in DB
      cb(`successfully added ${JSON.stringify(req.body)}`);
    });
    // ======================================================================

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