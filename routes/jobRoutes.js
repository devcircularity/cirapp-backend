// routes/jobRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/userModel');
const { cloudinary } = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log("POST /api/jobs request received");
    
    let imageUrl = '';
    if (req.file) {
      const uploadResponse = await new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });

        cloudinaryStream.end(req.file.buffer);
      });

      imageUrl = uploadResponse.url;
    }

    const job = new Job({
      title: req.body.title,
      image: imageUrl, // Set the image URL
      description: req.body.description,
      duration: req.body.duration,
      numberOfTasks: req.body.numberOfTasks,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error while creating job:", err);
    res.status(400).json({ message: err.message });
  }
});

router.get('/count', async (req, res) => {
  try {
    console.log("GET /api/jobs/count request received");
    
    const count = await Job.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log("GET /api/jobs request received");
    
    const { userId } = req.query; // Assuming you pass the user ID as a query parameter
    const user = await User.findById(userId);

    let jobs;
    if (user.role === 'LineManager') {
      jobs = await Job.find({}); // If the user is a LineManager, fetch all jobs
    } else {
      jobs = await Job.find({
        $or: [
          { supervisor: userId },
          { users: userId }
        ]
      });
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log("GET /api/jobs/:id request received");
    
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
