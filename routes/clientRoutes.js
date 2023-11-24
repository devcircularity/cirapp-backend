const express = require('express');
const multer = require('multer');
const Client = require('../models/clientModel'); // The path might be different based on your project structure
const { cloudinary } = require('../utils/cloudinary'); // Your cloudinary config

const router = express.Router();

// Set up Multer for file uploading
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
  const { fullName, phoneNumber, countryCode, businessName, businessNature, createdBy } = req.body;
  
  let imageUrl = '';
  if (req.file) {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload_stream({ resource_type: 'auto' });
      imageUrl = result.url;
    } catch (error) {
      return res.status(500).send('Error uploading image');
    }
  }

  const client = new Client({
    fullName,
    phoneNumber: `${countryCode}${phoneNumber}`,
    countryCode,
    businessName,
    businessNature,
    createdBy, // Add createdBy to the client document
    image: imageUrl,
  });

  try {
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
