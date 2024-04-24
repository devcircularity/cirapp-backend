// collectorRoutes.js
const express = require('express');
const router = express.Router();
const Collector = require('../models/collectorModel');

// Route to add a collector
router.post('/add', async (req, res) => {
  try {
    const collector = new Collector(req.body);
    await collector.save();
    res.status(201).send(collector);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to get all collectors
router.get('/', async (req, res) => {
  try {
    const collectors = await Collector.find({});
    res.send(collectors);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
