// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., '30 days', '3 months'
  numberOfTasks: { type: Number, required: true }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
