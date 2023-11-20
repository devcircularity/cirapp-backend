// routes/jobRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const Job = require('../models/Job');
const { cloudinary } = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
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
      numberOfTasks: req.body.numberOfTasks
    });

    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error while creating job:", err);
    res.status(400).json({ message: err.message });
  }
});


// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new job
router.post('/', async (req, res) => {
  const job = new Job({
    title: req.body.title,
    image: req.body.image,
    description: req.body.description,
    // Add more fields as needed
  });

  try {
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add other CRUD operations as needed

module.exports = router;
