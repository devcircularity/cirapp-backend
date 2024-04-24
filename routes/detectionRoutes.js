const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose
const ObjectId = mongoose.Types.ObjectId; // Get the ObjectId class
const Detection = require('../models/detectionModel');

// In your route
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    //console.log(`Querying for userId: ${userId}`);
    const query = { userId: new ObjectId(userId) };
    //console.log(`Executing query:`, query);

    // Log the database and collection being queried
    const dbName = mongoose.connection.db.databaseName;
    const collectionName = Detection.collection.collectionName;
    //console.log(`Querying database: ${dbName}, collection: ${collectionName}`);

    const detections = await Detection.find(query).lean();
    //console.log(`Query result: ${detections.length} detections found`, detections);
    res.json(detections);
  } catch (error) {
    console.error('Error fetching detection data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Make sure to export the router
module.exports = router;
