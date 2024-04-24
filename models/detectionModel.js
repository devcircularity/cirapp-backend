const mongoose = require('mongoose');

// Define the schema for the detection data
const detectionSchema = new mongoose.Schema({
  // Define a field 'userId' that references a User and is required
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Using ObjectId to reference another document
    ref: 'User', // This assumes you have a User model defined elsewhere
    required: true // This field is mandatory
  },
  weight: {
    type: Number,
    required: true
  },

  // Timestamp field that records when the detection was made
  timestamp: {
    type: Date, // Storing as a Date object
    required: true // This field is mandatory
  },
  // An array of items detected, each with its own sub-schema
  items: [{
    name: String, // Name of the item detected
    category: String, // Category of the item detected
    brand: String, // Brand of the item detected
    weight: Number,
  }],
  // Photo path to store the location of the photo associated with the detection
  photoPath: {
    type: String, // Path as a string
    required: true // This field is mandatory
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
  collection: 'Detections' // Explicitly setting the collection name
});

// Create a Mongoose model based on the schema
const Detection = mongoose.model('Detection', detectionSchema);

// Export the model to use it in other parts of the application
module.exports = Detection;
