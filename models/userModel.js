// server/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  fullName: String,
  phoneNumber: String,
  // Add the role field
  role: {
    type: String,
    required: true,
    enum: ['user', 'supervisor', 'admin'], // if you have predefined roles
    default: 'user' // default value if not provided
  },
  // ... any other fields you may need
});

const User = mongoose.model('User', userSchema);

module.exports = User;
