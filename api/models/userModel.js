const mongoose = require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'basic',
    enum: ['basic', 'supervisor', 'admin'],
  },
  accessToken: {
    type: String,
  },
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
