const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const stream = require('stream');
const { cloudinary } = require('../utils/cloudinary');
const Task = require('../models/taskModel');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImageToCloudinary = async (fileBuffer) => {
  let attempts = 0;
  const maxAttempts = 3; // Maximum number of attempts
  while (attempts < maxAttempts) {
      try {
          const uploadResponse = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
              });
              stream.Readable.from(fileBuffer).pipe(uploadStream);
          });
          return uploadResponse.url; // Success
      } catch (error) {
          console.log(`Attempt ${attempts + 1} failed: ${error.message}`);
          attempts += 1;
          if (attempts >= maxAttempts) throw error; // Rethrow after max attempts
      }
  }
};

router.post('/', upload.single('image'), async (req, res) => {
  let imageUrl = '';
  if (req.file) {
      try {
          imageUrl = await uploadImageToCloudinary(req.file.buffer); // Use the retry logic function
      } catch (error) {
          return res.status(500).json({ message: 'Image upload failed', error: error.toString() });
      }
  }

  // Parsing 'assignedTo' and converting to MongoDB ObjectIds
  let assignedToIds = [];
  try {
      const assignedTo = JSON.parse(req.body.assignedTo);
      assignedToIds = assignedTo.map(id => new mongoose.Types.ObjectId(id));
  } catch (error) {
      return res.status(400).json({ message: 'Invalid format for assignedTo field.', error: error.toString() });
  }

  // Convert 'assignedBy' and 'supervisor' from string to ObjectId
  let assignedById, supervisorId;
  try {
      if (req.body.assignedBy) assignedById = new mongoose.Types.ObjectId(req.body.assignedBy);
      if (req.body.supervisor) supervisorId = new mongoose.Types.ObjectId(req.body.supervisor);
  } catch (error) {
      return res.status(400).json({ message: 'Invalid format for assignedBy or supervisor field.', error: error.toString() });
  }

  const taskData = {
      name: req.body.name,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      job: req.body.job, // Assuming this is already a valid ObjectId or that Mongoose will handle conversion
      image: imageUrl,
      assignedTo: assignedToIds,
      assignedBy: assignedById, // Use converted ObjectId
      supervisor: supervisorId, // Use converted ObjectId
  };

  try {
    console.log('Saving task with data:', taskData);
      const newTask = new Task(taskData);
      await newTask.save();
      res.status(201).json(newTask);
  } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Failed to create task', error: error.toString() });
  }
});


module.exports = router;


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
router.get('/assignedBy/:uid', async (req, res) => {
  console.log("Accessed /tasks/assignedBy/:userId route with userId:", req.params.userId);
  const { userId } = req.params; // Extract the user ID from the request parameters
  
  try {
      const tasks = await Task.find({ assignedBy: userId }) // Query for tasks with the specified assignedBy value
          .populate('assignedTo', 'name') // Optionally populate related documents, adjust fields as needed
          .populate('assignedBy', 'name') // Populate the assignedBy field to get the assigner's information
          .populate('supervisor', 'name'); // Adjust based on your schema
      
      if (tasks.length === 0) {
          return res.status(404).json({ message: "No tasks found assigned by the specified user." });
      }
      
      res.json(tasks); // Send the found tasks back in the response
  } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: "Internal Server Error", error: error.toString() });
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




router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'uid fullName')
      .populate('assignedBy', 'uid fullName') // Populate assignedBy
      .populate('supervisor', 'uid fullName') // Populate supervisor
      .populate('job', 'title');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

//    console.log('Task details:', task);

    // Convert task to a plain object to add additional fields
    const taskDetails = task.toObject();
    taskDetails.assignedToFullName = task.assignedTo ? task.assignedTo.fullName : 'N/A';
    taskDetails.jobTitle = task.job ? task.job.title : 'N/A';

//    console.log('Task details after modification:', taskDetails);

    res.json(taskDetails);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
});




module.exports = router;
