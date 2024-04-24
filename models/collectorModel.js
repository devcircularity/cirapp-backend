// collectorModel.js
const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  idNumber: String,
  collectionArea: String,
});

module.exports = mongoose.model('Collector', collectorSchema);
