const mongoose = require('mongoose');

const { Schema } = mongoose;

const Item = {
  name: String,
  qty: Number,
  unit: String,
  category: String,
  image: String,
  notes: String,
};

const shoppingListSchema = new Schema({
  meal_plan_shopping_list_ingredients: [Item],
  other_shopping_list_items: [Item],
  createdBy: {
    type: String,
  },
});

// I don't think we want to paginate the shopping list
// shoppingListSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
