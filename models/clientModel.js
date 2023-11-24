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
    type: String, // Assuming UID is an ObjectId; change as per your UID structure
    required: true,
    ref: 'User' // Referencing User model; change this if your user model has a different name
  },
  image: {
    type: String, // URL of the image
  },
}, {
  timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
