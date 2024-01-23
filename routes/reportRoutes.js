const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const Job = require('../models/Job');
const mongoose = require('mongoose');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/', upload.fields([
  { name: 'clockInImage', maxCount: 1 },
  { name: 'clockOutImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { createdBy, taskName, jobName, notes, taskStatus, taskItems, supervisor, lineManager } = req.body;

    let clockInImageUrl = '';
    let clockOutImageUrl = '';

    // Function to upload image to Cloudinary
    const uploadImageToCloudinary = async (fileBuffer) => {
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
        uploadStream.end(fileBuffer);
      });
    };

    // Handle clockInImage upload
    if (req.files.clockInImage && req.files.clockInImage[0]) {
      clockInImageUrl = await uploadImageToCloudinary(req.files.clockInImage[0].buffer);
    }

    // Handle clockOutImage upload
    if (req.files.clockOutImage && req.files.clockOutImage[0]) {
      clockOutImageUrl = await uploadImageToCloudinary(req.files.clockOutImage[0].buffer);
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
      jobName: jobDetailsData, // Store the job details
      notes,
      taskStatus,
      clockInImage: clockInImageUrl,
      clockOutImage: clockOutImageUrl,
      taskItems: taskObjectIds,
      supervisor: supervisorDetails, // Store the supervisor details
      lineManager
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




module.exports = router;
