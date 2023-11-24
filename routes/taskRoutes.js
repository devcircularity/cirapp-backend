const express = require('express');
const multer = require('multer');
const stream = require('stream');
const router = express.Router();
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const { cloudinary } = require('../utils/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/',  upload.single('image'), async (req, res) => {
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
      image: imageUrl,
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

router.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    // Query tasks where 'assignedTo' matches the 'uid' string
    const tasks = await Task.find({ assignedTo: uid }).populate('assignedTo', 'uid name'); // Adjust the populate method according to your User model
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Example in an Express router file
router.put('/update/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  try {
    // Set status to 'pending' when task is marked as completed
    const updateData = { completed };
    if (completed) updateData.status = 'pending';

    await Task.findByIdAndUpdate(taskId, updateData, { new: true, upsert: true });
    res.status(200).send("Task status updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating task status");
  }
});


// ...

// Route to get tasks assigned by a specific user
// Route to get tasks assigned by a specific user
router.get('/assignedBy/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    console.log('Fetching tasks assigned that have by user ID:', uid); // Add this line to log the user ID

    // Query tasks where 'assignedBy' matches the 'uid' string
    const tasks = await Task.find({ assignedBy: uid }).populate('assignedBy', 'uid name');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks assigned by user:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ...

// routes/taskRoutes.js
router.get('/count', async (req, res) => {
  try {
    const count = await Task.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// Assuming that 'job' and 'assignedTo' fields in Task model store the respective IDs.
router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Fetch additional details using the stored IDs
    const jobDetails = task.job ? await Job.findById(task.job) : null;
    const userDetails = task.assignedTo ? await User.findById(task.assignedTo) : null;

    // Construct a result object with the populated details
    const result = {
      ...task.toObject(), // Convert the task document to a regular object
      jobTitle: jobDetails ? jobDetails.title : 'N/A',
      assignedToFullName: userDetails ? userDetails.fullName : 'N/A'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
