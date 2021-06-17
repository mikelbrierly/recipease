const mongoose = require('mongoose');

const { Schema } = mongoose;

const mealplanSchema = new Schema({
  date_range: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  skips: [
    {
      date: Date,
      recipe: String,
    },
  ],
  recipes: [
    {
      recipe: String,
      date: Date,
      servings: Number,
      completed: Boolean,
    },
  ],
  feeding: {
    type: Number,
  },
  image_url: {
    type: String,
  },
  createdBy: {
    type: String,
  },
});

module.exports = mongoose.model('Mealplan', mealplanSchema);
