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

router.post('/:tournamentId/teams', async (req, res) => {
  const { name, leaderId } = req.body;
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    const teamCount = await Team.count({ where: { tournamentId } });
    const leader= await User.findByPk(leaderId);

    if(!leader){
      return res.status(404).json({message: 'Leader not found'});
    }
    
    if(!tournament){
      return res.status(404).json({message: 'Tournament not found'});
    }

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

    const participant = await Participant.create({ userId, tournamentId, teamId, statusUser: 'waiting' });
    res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up for tournament' });
  }
});

router.get('/:tournamentId/teams', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const teams = await Team.findAll({ where: { tournamentId } });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

router.delete('/:tournamentId/delete',async(req,res)=>{
  try {
    const { tournamentId }=req.params;
    const deletedTournament=await Tournament.destroy({
      where: {id:tournamentId},
    })

    if(!deletedTournament){
      return res.status(404).json({message:'Tournament not found'});
    }

    res.status(200).json({message: 'Tournament deleted successfully'});

  }catch (err){
    res.status(500).json({message:'Failed to remove the team',error:err})
  }
});

module.exports = router;
