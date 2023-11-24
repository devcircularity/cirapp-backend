const express = require('express');
const Report = require('../models/reportModel');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // Destructure the properties directly from req.body as you're no longer handling file uploads here
        const { createdBy, taskName, jobName, notes, taskStatus, clockInImage, clockOutImage, taskItems, supervisor, lineManager } = req.body;

        let taskIds = [];
        if (taskItems) {
            // Assume taskItems is already a properly formatted array of IDs passed from the frontend
            taskIds = taskItems;
        }

        const newReport = new Report({
            createdBy,
            taskName,
            jobName,
            notes,
            taskStatus,
            clockInImage, // This is now a URL string
            clockOutImage, // This is now a URL string
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
