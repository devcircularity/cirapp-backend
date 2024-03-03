const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  businessNature: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Specify that this is an ObjectId
    required: true,
    ref: 'User' // This assumes your User model is named 'User'
  },
  image: {
    type: String, // URL of the image
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // References a Job document
    required: true
  },
}, {
  timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
