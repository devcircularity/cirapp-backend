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

    // Ensure the supervisor ID is received from the request
    const { title, description, duration, numberOfTasks, startDate, endDate, supervisor, users } = req.body;

    // Parse the users array if it's a string of JSON
    let parsedUsers = users;
    if (typeof users === 'string') {
      parsedUsers = JSON.parse(users);
    }

    const job = new Job({
      title,
      image: imageUrl,
      description,
      duration,
      numberOfTasks,
      startDate,
      endDate,
      supervisor, // Now assigning the supervisor ID received from the request
      users: parsedUsers,
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
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = { isHidden: { $ne: true } }; // Assume all jobs are not hidden by default

    if (user.role !== 'lineManager') {
      // For non-lineManagers, ensure the job is not hidden and they are either the supervisor or in the users list
      query = {
        ...query,
        $or: [
          { supervisor: userId },
          { users: { $elemMatch: { $eq: userId } } } // Adjusted for array querying
        ]
      };
    } // No additional filter needed for lineManagers as they can see all jobs including hidden ones

    console.log("Final query:", query); // Debugging to see the final query

    const jobs = await Job.find(query).populate('supervisor', 'fullName').populate('users', 'fullName');
    console.log("Fetched jobs:", jobs); // Debug to check fetched jobs

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(`PUT /api/jobs/${req.params.id} request received`);

    const { title, description, duration, numberOfTasks, startDate, endDate, supervisor, users } = req.body;

    const { hidden } = req.body;

    // Handle image upload if a new image is provided
    let imageUrl;
    if (req.file) {
      const uploadResponse = await new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });

        cloudinaryStream.end(req.file.buffer);
      });

      imageUrl = uploadResponse.url;
    }

    // Parse the users array if it's a string of JSON
    let parsedUsers = users;
    if (typeof users === 'string') {
      parsedUsers = JSON.parse(users);
    }

    // Find the job by ID and update it with new details
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, {
      title,
      ...(req.file && { image: imageUrl }), // Only update image if a new one is uploaded
      description,
      duration,
      numberOfTasks,
      startDate,
      endDate,
      supervisor,
      hidden,
      users: parsedUsers,
    }, { new: true }); // { new: true } returns the updated object

    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });

    res.json(updatedJob);
  } catch (err) {
    console.error("Error while updating job:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add a route to toggle the 'hide' status of a job
// Backend: routes/jobRoutes.js
router.put('/:id/hide', async (req, res) => {
  const jobId = req.params.id;
  const { isHidden } = req.body; // Expect 'isHidden' to be passed in the request body

  try {
    const updatedJob = await Job.findByIdAndUpdate(jobId, { hidden: isHidden }, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (err) {
    console.error("Error while toggling job visibility:", err);
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;
