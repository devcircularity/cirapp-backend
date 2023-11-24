const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true
  },
  taskName: {
    type: String,
    required: true
  },
  jobName: {
    type: String,
    required: true
  },
  notes: String,
  taskStatus: {
    type: String,
    required: true,
    default: 'Pending'
  },
  supervisor: String, // Add supervisor field
  lineManager: String, // Add lineManager field
  clockInImage: String,
  clockOutImage: String,
  taskItems: [{
    type: mongoose.Schema.Types.ObjectId, // Array of task IDs
    ref: 'Task' // Assuming 'Task' is your task model name
  }]
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
