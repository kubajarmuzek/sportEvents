const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Participant = require('../models/Participant');
const User = require('../models/User');

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

router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.findAll();
    res.json(tournaments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/signup', async (req, res) => {
  const { userId, tournamentId } = req.body;

  try {
    const participant = await Participant.create({ userId, tournamentId });
    res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up for tournament' });
  }
});

router.get('/:id/participants', async (req, res) => {
  const tournamentId = req.params.id;

  try {
      const participants = await Participant.findAll({
          where: { tournamentId },
          include: [{ model: User, as: 'user' }],
      });
      console.log(participants)
      res.status(200).json(participants);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching participants' });
  }
});


module.exports = router;
