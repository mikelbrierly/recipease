const mongoose = require('mongoose');

const { Schema } = mongoose;

const IngredientSchema = new Schema({
  name: String,
  aliases: [String],
  substitutions: [String],
  image_url: String,
  category: String,
  shelf_life: Number,
  units: [String],
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
