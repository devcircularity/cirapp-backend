// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/userModel'); // Adjust with your user model
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const userData = req.body; // Ensure the request body contains user data
    const newUser = await User.create(userData); // Create a new user in MongoDB
    res.status(201).json(newUser); // Respond with the newly created user
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});


// New route to get a specific user by UID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
