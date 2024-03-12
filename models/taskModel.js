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
    type: mongoose.Schema.Types.ObjectId, // Corrected type for ObjectId reference
    ref: 'Job', // Assuming 'Job' is the name of the model you're referencing
    required: false, // Adjust based on your requirements
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId, // Defined as an array of ObjectId references
    ref: 'User',
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId, // Corrected type for ObjectId reference
    ref: 'User',
    required: true, // Adjust based on your requirements
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Adjust based on your requirements
    default: null,
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    default: 'pending',
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
