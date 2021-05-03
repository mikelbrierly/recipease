const actions = {
  getRecipe: (req, cb) => {
    cb('here is recipe data bubbling up');
    // using the req.url, determine what we are retrieving from the DB here, and then returning to the caller via mongoose
  },
};

module.exports = actions;
