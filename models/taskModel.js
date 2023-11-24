// models/taskModel.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  job: {
    type: String,
    trim: true,
    // If this is supposed to be a reference to another model, you might want to use a ref like below
    // ref: 'Job'
  },
  // Update assignedTo to be a String type
  assignedTo: {
    type: String, // Changed from ObjectId to String
    required: false, 
    default: null, 
  },
  assignedBy: {
    type: String, // Reference to User model
    ref: 'User', // Assuming your User model is named 'User'
    required: false,
  },
  image: {
    type: String,
    trim: true,
    // You can set default to a placeholder image if you want
    default: '',
  },
  status: {
    type: String,
    default: 'pending', // Default status
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // Add other new fields here as needed
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
