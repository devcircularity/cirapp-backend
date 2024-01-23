// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/userModel'); // Adjust with your user model
const router = express.Router();

// server/routes/userRoutes.js
router.get('/', async (req, res) => {
  try {
    const supervisorId = req.query.supervisorId; // Extract supervisorId from query parameters
    let users;

    if (supervisorId) {
      // If supervisorId is provided, fetch only users assigned to that supervisor
      users = await User.find({ supervisor: supervisorId });
    } else {
      // If supervisorId is not provided, fetch all users
      users = await User.find({});
    }

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

router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const users = await User.find({
          // Assuming 'username' or 'fullName' field exists. Adjust as per your schema.
          // Use a regex for partial matching and case-insensitive search
          fullName: { $regex: searchQuery, $options: "i" }
        });
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
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


router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Update user by userId
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// server/routes/userRoutes.js
// server/routes/userRoutes.js
router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




module.exports = router;
