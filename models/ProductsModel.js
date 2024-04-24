const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true } // Path or URL to the image of the product
  // Add any additional fields that you require for your application here
}, { collection: 'Redeem' }); // Explicitly specify the collection name here

const Product = mongoose.model('Redeem', productSchema);

module.exports = Product;
