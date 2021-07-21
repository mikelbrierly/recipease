const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const FridgeIngredientSchema = new Schema({
  ingredient_id: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  date_added: {
    type: Date,
    required: true,
  },
  created_by: {
    type: String,
  },
});

FridgeIngredientSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('FridgeIngredient', FridgeIngredientSchema);
