const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

require('dotenv').config();


router.post('/', async (req, res) => {
    const { name, startDate, location, description, organizerId } = req.body;
  
    if (!name || !startDate || !location || !organizerId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const newTournament = await Tournament.create({
        name,
        startDate,
        location,
        description,
        organizerId,
      });
      res.status(201).json(newTournament);  // Success response
    } catch (error) {
      console.error('Error creating tournament:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  


module.exports = router;
