const express = require('express');
const multer = require('multer');
const stream = require('stream');
const router = express.Router();
const Task = require('../models/taskModel');
const User = require('../models/userModel');
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

router.get('/:uid', async (req, res) => {
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




router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignedTo');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
