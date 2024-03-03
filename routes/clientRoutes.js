const express = require('express');
const multer = require('multer');
const Client = require('../models/clientModel');
const { cloudinary } = require('../utils/cloudinary');
const streamifier = require('streamifier'); // Make sure you have installed streamifier

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
  const { fullName, phoneNumber, countryCode, businessName, businessNature, createdBy, jobId } = req.body;
  
  let imageUrl = '';
  if (req.file) {
    try {
      // Wrap the cloudinary upload_stream in a promise
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Use streamifier to convert buffer to a stream
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      
      imageUrl = result.url; // Get the URL from the result
    } catch (error) {
      console.error('Failed to upload image to Cloudinary:', error);
      return res.status(500).send('Error uploading image');
    }
  }

  const client = new Client({
    fullName,
    phoneNumber: `${countryCode}${phoneNumber}`,
    countryCode,
    businessName,
    businessNature,
    createdBy,
    image: imageUrl,
    job: jobId, // Make sure this line correctly references the jobId
  });
  

  try {
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error('Failed to save client:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET all clients
// GET all clients
router.get('/', async (req, res) => {
  const { jobId } = req.query;

  try {
    let query = {};
    if (jobId) {
      query.job = jobId;
    }
    
    const clients = await Client.find(query)
      .populate('job', 'title')
      .populate('createdBy', 'fullName'); // Populate the 'fullName' from the User model

    // Transform the clients data to include the user's fullName in a more accessible way
    const transformedClients = clients.map(client => {
      const clientObj = client.toObject();
      clientObj.createdByName = client.createdBy ? client.createdBy.fullName : 'Unknown'; // Add a new field or adjust as needed
      return clientObj;
    });

    res.json(transformedClients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
