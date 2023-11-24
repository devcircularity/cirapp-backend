const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: String,
  fullName: String,
  phoneNumber: String,
  role: {
    type: String,
    required: true,
    enum: ['user', 'supervisor', 'admin'],
    default: 'user'
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Add the LineManager field as a reference to another User document
  LineManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // ... any other fields you may need
});

const User = mongoose.model('User', userSchema);

module.exports = User;
