// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/userModel'); // Adjust with your user model
const router = express.Router();

// Fetch all users based on the user's role
// server/routes/userRoutes.js
router.get('/', async (req, res) => {
  try {
    const { supervisorId } = req.query;

    let query = {};

    if (supervisorId) {
      // Find users where the 'supervisor' field matches the supervisorId
      query.supervisor = supervisorId;
    }

    // Populate 'supervisor' and 'lineManager' fields with their 'fullName' from the User collection
    const users = await User.find(query)
      .populate('supervisor', 'fullName')
      .populate('lineManager', 'fullName');

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});



// Fetch all supervisors
router.get('/supervisors', async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' });
    res.json(supervisors);
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch all line managers
router.get('/lineManagers', async (req, res) => {
  try {
    const lineManagers = await User.find({ role: 'lineManager' });
    res.json(lineManagers);
  } catch (error) {
    console.error("Error fetching line managers:", error);
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
