const express = require('express');
const multer = require('multer');
const stream = require('stream');
const Task = require('../models/taskModel'); // Your Task model
const User = require('../models/userModel'); // Your User model
const router = express.Router();
const { cloudinary } = require('../utils/cloudinary'); // Your Cloudinary configuration

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploader = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);
        bufferStream.pipe(uploader);
      });

      imageUrl = uploadResponse.url;
    }

    // Handle 'assignedTo' as an array of IDs
    let assignedTo = req.body.assignedTo;
    if (typeof assignedTo === 'string') {
      try {
        assignedTo = JSON.parse(assignedTo);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid format for assignedTo' });
      }
    }

    // Validate 'assignedTo' as an array of valid MongoDB IDs
    if (!Array.isArray(assignedTo) || !assignedTo.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'assignedTo must be an array of valid user IDs' });
    }

    const supervisorId = req.body.supervisor;
    // Optional: Validate the supervisor ID

    const taskData = {
      name: req.body.name,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      job: req.body.job,
      image: imageUrl,
      assignedTo: assignedTo,
      assignedBy: req.body.assignedBy, // Assuming this is provided and valid
      supervisor: supervisorId,
    };

    const newTask = new Task(taskData);
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error while creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
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
// Route to get tasks assigned by a specific user
// routes/taskRoutes.js
router.get('/assignedBy/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
//    console.log('Fetching tasks assigned that have by user ID:', uid);

    const tasks = await Task.find({ assignedBy: uid })
      .populate({
        path: 'assignedBy',
        select: 'uid fullName',
      })
      .populate({
        path: 'assignedTo',
        select: 'uid fullName',
      })
      .populate({
        path: 'supervisor',
        select: 'uid fullName',
      });

//    console.log('Fetched tasks:', tasks);

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
