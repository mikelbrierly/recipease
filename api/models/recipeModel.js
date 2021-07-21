const mongoose = require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  metadata: {
    cookbook: {
      type: String,
    },
    author: {
      type: String,
    },
    url: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  image_url: {
    type: String,
  },
  servings: {
    type: Number,
  },
  category: {
    type: String,
  },
  ingredients: [
    {
      qty: Number,
      unit: String,
      preparation: String,
    },
  ],
  details: {
    type: String,
  },
  blog: {
    type: String,
  },
  createdBy: {
    type: String,
  },
});

recipeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Recipe', recipeSchema);
