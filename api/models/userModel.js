const mongoose = require('mongoose');

const { Schema } = mongoose;

// const UserSchema = new Schema({
//   email: String,
//   name: String,
//   password: String,
// });
const UserSchema = new Schema({
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

module.exports = mongoose.model('User', UserSchema);
