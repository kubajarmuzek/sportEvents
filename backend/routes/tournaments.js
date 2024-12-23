const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Participant = require('../models/Participant');
const User = require('../models/User');
const Team = require('../models/Team');

require('dotenv').config();


router.post('/', async (req, res) => {
  const { name, startDate, location, description, organizerId, sport, maxTeams, teamSize } = req.body;

  if (!name || !startDate || !location || !organizerId || !sport || !maxTeams || !teamSize) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newTournament = await Tournament.create({
      name,
      startDate,
      location,
      description,
      organizerId,
      sport,
      maxTeams,
      teamSize,
    });
    res.status(201).json(newTournament); 
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

router.post('/:tournamentId/teams', async (req, res) => {
  const { name, leaderId } = req.body;
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    const teamCount = await Team.count({ where: { tournamentId } });
    
    if (teamCount >= tournament.maxTeams) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const team = await Team.create({ name, leaderId, tournamentId });
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating team' });
  }
});

router.get('/:tournamentId/teams', async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const teams = await Team.findAll({ where: { tournamentId } });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

router.post('/signup', async (req, res) => {
  const { userId, tournamentId, teamId } = req.body;

  try {
    const existingParticipant = await Participant.findOne({
      where: { userId, tournamentId, teamId }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'User is already signed up for this team in the tournament' });
    }

   
    const team = await Team.findByPk(teamId);
    const participantCount = await Participant.count({ where: { teamId } });

    if (participantCount >= team.teamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    const participant = await Participant.create({ userId, tournamentId, teamId });
    res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up for tournament' });
  }
});


module.exports = router;
