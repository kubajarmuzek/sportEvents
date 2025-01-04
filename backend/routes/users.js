const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tournament=require('../models/Tournament'); 
const Participant = require('../models/Participant');
const Team=require('../models/Team');

require('dotenv').config();

router.get('/:id/nickname', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['nickname'], 
    });
    if (user) {
      res.json({ nickname: user.nickname });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:userId/organized-tournaments',async (req,res)=>{
  try{
    const userId=req.params.userId;
    const currentDate=new Date();

    const organizedTournaments=await Tournament.findAll({
      where: {organizerId: userId},
      attributes: ['id','name','startDate','endDate'],
    });
    const pastOrganized = organizedTournaments.filter(
      (t)=>t.endDate && new Date(t.endDate)<currentDate
    );
    const upcomingOrganized = organizedTournaments.filter(
      (t)=>!t.endDate || new Date(t.endDate)>=currentDate
    );
    res.json({
      past: pastOrganized,
      upcoming: upcomingOrganized,
    });
  } catch (err){
    res.status(500).json({message : 'Server error', error: err});
  }
});

router.get('/:userId/participated-tournaments', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentDate = new Date();

    const participatedTournaments = await Participant.findAll({
      where: {
        userId,
        statusUser: 'approved', 
      },
      include: [
        {
          model: Tournament,
          attributes: ['id', 'name', 'startDate', 'endDate'],
          as: 'tournament', 
        },
      ],
    });

    const pastParticipated = participatedTournaments.filter((participant) => {
      const tournament = participant.tournament;
      return tournament.endDate && new Date(tournament.endDate) < currentDate;
    });

    const upcomingParticipated = participatedTournaments.filter((participant) => {
      const tournament = participant.tournament;
      return !tournament.endDate || new Date(tournament.endDate) >= currentDate;
    });

    res.json({
      past: pastParticipated.map((p) => p.tournament),
      upcoming: upcomingParticipated.map((p) => p.tournament),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.delete('/:userId/:tournamentId/signout', async (req, res) => {
  const { userId, tournamentId } = req.params;

  try {
    const participant = await Participant.findOne({
      where: {
        userId: userId,
        tournamentId: tournamentId
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in this tournament' });
    }

    await participant.destroy();
    res.status(200).json({ message: 'Successfully signed out from the tournament' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing out from the tournament' });
  }
});



module.exports = router;
