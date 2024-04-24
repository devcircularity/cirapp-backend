// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/userModel'); // Adjust with your user model
const router = express.Router();
const { cloudinary } = require('../utils/cloudinary');
const multer = require('multer');
const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ storage: storage });


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


// Example route to update a user's avatar
// Apply Multer middleware to this route specifically for handling 'avatar' file uploads
router.put('/:uid/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Convert the uploaded file buffer to a Base64 string
    const fileStr = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(fileStr);

    // Update user document with new avatar URL
    user.avatar = result.secure_url;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Failed to update avatar:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
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
    const lineManagers = await User.find({ role: 'LineManager' });
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

// Fetch a specific user by UID and include the points data
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid }).select("+points"); // Ensure points data is included
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user points
router.get('/:uid/points', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid }).select("points");
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ points: user.points }); // Return the points data
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
