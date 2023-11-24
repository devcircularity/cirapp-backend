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
  visibility: {
    type: String,
    required: true,
    default: 'Private'
  },
  clockInImage: String, // URL of the clock-in image
  clockOutImage: String // URL of the clock-out image
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;


