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
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lineManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' is the model name
    default: null
  },

});

const User = mongoose.model('User', userSchema);

module.exports = User;
