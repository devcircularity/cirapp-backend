// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  numberOfTasks: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  hidden: { type: Boolean, default: false },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of references to User model
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
