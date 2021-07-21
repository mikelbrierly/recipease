const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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

IngredientSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ingredient', IngredientSchema);
