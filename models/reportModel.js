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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  notes: String,
  taskStatus: {
    type: String,
    required: true,
    default: 'Pending'
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId, // Change the type to ObjectId
    ref: 'User', // Reference the 'User' model
    required: true,
    default: null
  },
  lineManager: String,
  clockInImage: String,
  clockOutImage: String,
  taskItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
