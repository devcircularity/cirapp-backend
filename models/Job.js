// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  numberOfTasks: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
