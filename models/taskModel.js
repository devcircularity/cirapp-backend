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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, 
    default: null, 
  },
  image: {
    type: String,
    trim: true,
    // You can set default to a placeholder image if you want
    default: '',
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
