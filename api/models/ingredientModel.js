const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IngredientSchema = new Schema({
  id: Number,
  name: String,
  aliases: [String],
  substitutions: [String],
  image_url: String,
  category: String,
  shelf_life: Number,
  units: [String]
});

moodule.exports = mongoose.model('Ingredient', IngredientSchema);