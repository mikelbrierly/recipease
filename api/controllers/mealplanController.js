const actions = {
  getMealplan: (req, cb) => {
    cb('here is mealplan data bubbling up');
    // using the req.url, determine what we are retrieving from the DB here, and then returning to the caller via mongoose
  },
};

module.exports = actions;
