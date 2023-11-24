const mongoose = require('mongoose');

// Define the schema for a pending task
const pendingTaskSchema = new mongoose.Schema({
  taskId: {
    type: String, // Task ID
    required: [true, 'Task ID is required']
  },
  assignedTo: {
    type: String, // User UID assigned to the task
    required: [true, 'User UID is required']
  },
  assignedBy: {
    type: String, // User UID who assigned the task
    required: [true, 'Assigner UID is required']
  },
  dueDate: {
    type: Date, // Due date for the task
    required: [true, 'Due date is required']
  },
  job: {
    type: String, // Job associated with the task
    required: [true, 'Job is required']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create the model from the schema
const PendingTask = mongoose.model('PendingTask', pendingTaskSchema);

module.exports = PendingTask;
