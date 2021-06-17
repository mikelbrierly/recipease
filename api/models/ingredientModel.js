const mongoose = require('mongoose');

const { Schema } = mongoose;

const IngredientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  aliases: {
    type: [String],
  },
  substitutions: {
    type: [String],
  },
  image_url: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  shelf_life: {
    type: Number,
  },
  units: {
    type: [String],
  },
  createdBy: {
    type: String,
  },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
