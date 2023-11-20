const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const Report = require('../models/reportModel');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/', upload.fields([
  { name: 'clockInImage', maxCount: 1 },
  { name: 'clockOutImage', maxCount: 1 }
]), async (req, res) => {
    try {
        // Extracting text fields from the request
        const { taskName, jobName, notes, taskStatus, visibility } = req.body;

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

        // Create a new report with the data and image URLs
        const newReport = new Report({
            taskName,
            jobName,
            notes,
            taskStatus,
            visibility,
            clockInImage: clockInImageUrl,
            clockOutImage: clockOutImageUrl
        });

        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error while creating report:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route to get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
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
