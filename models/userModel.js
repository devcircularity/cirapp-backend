const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: String,
  role: {
    type: String,
    required: true,
    enum: ['user', 'supervisor', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    required: false, // Making it optional
    default: '' // Default avatar URL or leave empty
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
  points: {
    totalPoints: { type: Number, required: true, default: 0 },
    redeemablePoints: { type: Number, required: true, default: 0 }
  },

});

const User = mongoose.model('User', userSchema);

module.exports = User;
