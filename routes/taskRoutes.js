// server/routes/taskRoutes.js
const express = require('express');
const multer = require('multer');
const stream = require('stream');
const router = express.Router();
const Task = require('../models/taskModel');
const { cloudinary } = require('../utils/cloudinary');
const authenticate = require('../middleware/authenticate'); // Update the path to the actual location

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);
        bufferStream.pipe(cloudinaryStream);
      });

      imageUrl = uploadResponse.url;
    }

    const taskData = {
      name: req.body.name,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      job: req.body.job,
      image: imageUrl, // Using the imageUrl from Cloudinary upload
      // Set assignedTo only if it's provided and not an empty string
      ...(req.body.assignedTo && { assignedTo: req.body.assignedTo }),
    };

    const newTask = new Task(taskData);
    const task = await newTask.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error while creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Middleware to check user role
const checkUserRole = (req, res, next) => {
  // Assuming user role is attached to req.user (adjust as needed)
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

// Route to get all tasks
router.get('/', authenticate, checkUserRole, async (req, res) => {
  try {
    let tasks;
    // Check if the user is a supervisor
    if (req.user.role === 'supervisor') {
      // Fetch all tasks for supervisors
      tasks = await Task.find().populate('assignedTo');
    } else {
      // Fetch only tasks assigned to the specific user
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get a single task by ID
router.get('/:taskId', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignedTo'); // Adjust as per your model relations
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
