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

module.exports = router;
