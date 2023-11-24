const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const Report = require('../models/reportModel');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/', upload.fields([
    { name: 'clockInImage', maxCount: 1 },
    { name: 'clockOutImage', maxCount: 1 }
  ]), async (req, res) => {
    console.log(`Received request with size: ${req.headers['content-length']}`);

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

    const newReport = new Report({
      createdBy,
      taskName,
      jobName,
      notes,
      taskStatus,
      clockInImage: clockInImageUrl,
      clockOutImage: clockOutImageUrl,
      taskItems: taskIds,
      supervisor,
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
        console.log("Fetching reports for UID:", uid); // Log the UID being queried

        // Fetch reports based on the UID
        const reports = await Report.find({ createdBy: uid }); // Assuming 'createdBy' is the correct field in your Report model
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route to get a single report by id
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
