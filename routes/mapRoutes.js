// server/routes/mapRoutes.js
const express = require('express');
const router = express.Router();

router.get('/api/maps/key', (req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

module.exports = router;
