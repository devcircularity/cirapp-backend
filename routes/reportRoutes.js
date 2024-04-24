const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { createdBy, taskName, jobName, notes, taskStatus, taskItems, supervisor, lineManager, clockInImage, clockOutImage, clockInTime, clockOutTime, clockInLocation, clockOutLocation
    } = req.body;

    // Function to upload image to Cloudinary
    const uploadImageToCloudinary = async (base64Image) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.url);
            }
          }
        );

        // Convert base64 string to buffer and upload
        const buffer = Buffer.from(base64Image.split(",")[1], 'base64');
        uploadStream.end(buffer);
      });
    };

    let clockInImageUrl = '';
    let clockOutImageUrl = '';

    // Handle clockInImage upload if present
    if (clockInImage) {
      clockInImageUrl = await uploadImageToCloudinary(clockInImage);
    }

    // Handle clockOutImage upload if present
    if (clockOutImage) {
      clockOutImageUrl = await uploadImageToCloudinary(clockOutImage);
    }

    let taskIds = [];
    if (taskItems) {
      try {
        // Check if taskItems is a string and try to parse it
        if (typeof taskItems === 'string') {
          taskIds = JSON.parse(taskItems);
        } else if (Array.isArray(taskItems)) {
          taskIds = taskItems;
        }
      } catch (error) {
        console.error('Error parsing taskItems:', error);
      }
    }

    // Convert task IDs to mongoose ObjectIds
    const taskObjectIds = taskIds.map(taskId => mongoose.Types.ObjectId(taskId));

    // Fetch supervisor's details based on the supervisor ID
    const supervisorUser = await User.findById(supervisor);
    const supervisorDetails = {
      id: supervisorUser ? supervisorUser._id : 'N/A',
      fullName: supervisorUser ? supervisorUser.fullName : 'N/A'
    };

    // Fetch job details based on the job ID
    const jobDetails = await Job.findById(jobName);
    console.log('Job Details:', jobDetails); // Log the job details
    const jobDetailsData = {
      id: jobDetails ? jobDetails._id : 'N/A',
      title: jobDetails ? jobDetails.title : 'N/A',
      // Include other job details as needed
    };


const newReport = new Report({
  createdBy,
  taskName,
  jobName: jobDetails ? jobDetails._id : null, // Pass only the ObjectId
  notes,
  taskStatus,
  clockInImage: clockInImageUrl,
  clockOutImage: clockOutImageUrl,
  taskItems: taskObjectIds,
  supervisor: supervisorUser ? supervisorUser._id : null, // Pass only the ObjectId
  lineManager,
  clockInTime,
            clockOutTime,
            clockInLocation,
            clockOutLocation,

});


    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error while creating report:', error);
    res.status(500).json({ message: error.message });
  }
});
 
router.get('/createdBy/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("Fetching reports for UID:", uid);

    const reports = await Report.find({ createdBy: uid })
      .populate('supervisor', 'fullName')
      .populate('jobName', 'title'); // Populate the jobName with the title from Job model

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/supervisor/:supervisorId', async (req, res) => {
  try {
    const { supervisorId } = req.params;
    const supervisedUsers = await User.find({ supervisor: supervisorId });
    const supervisedUserIds = supervisedUsers.map(user => user._id);

    const reports = await Report.find({ createdBy: { $in: supervisedUserIds } })
      .populate('createdBy', 'fullName') // Assuming you want to include some user details in the response
      .populate('jobName', 'title')
      .populate('supervisor', 'fullName');

    res.json(reports);
  } catch (error) {
    console.error('Error fetching supervised user reports:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route to fetch all reports
router.get('/all', async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('createdBy', 'fullName') // Populate the createdBy field if you store user's ID in createdBy
      .populate('jobName', 'title') // Assuming jobName stores ObjectId referring to Job model
      .populate('supervisor', 'fullName'); // Assuming supervisor stores ObjectId referring to User model
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({ message: error.message });
  }
});

// In your reports route file
router.get('/details/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('jobName', 'title') // Populate other fields as necessary
      .populate('createdBy', 'fullName'); // Assuming you've adjusted `createdBy` to store ObjectId references
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Failed to fetch report details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
