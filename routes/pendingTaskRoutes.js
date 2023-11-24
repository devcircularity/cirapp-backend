const express = require('express');
const PendingTask = require('../models/pendingTaskModel'); // Update this path as per your project structure
const router = express.Router();

// Middleware (if any) goes here

// POST route to create a new pending task
router.post('/pendingtasks', async (req, res) => {
    console.log('Received data:', req.body); // Add this line
  try {
    const {
      taskId, // Task ID
      assignedTo, // User UID assigned to the task
      assignedBy, // User UID who assigned the task
      dueDate, // Due date for the task
      job // Job associated with the task
    } = req.body;

    // Validate required fields
    if (!taskId || !assignedTo || !assignedBy || !dueDate || !job) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Creating a new PendingTask instance
    const newPendingTask = new PendingTask({
      taskId,
      assignedTo,
      assignedBy,
      dueDate,
      job
    });

    // Save the new pending task to the database
    await newPendingTask.save();

    // Send back the newly created task as a response
    res.status(201).json(newPendingTask);
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: error.message });
  }
});

// Other routes go here

module.exports = router; // Exporting the router for use in your main server file
