const express = require('express');
const router = express.Router();
const  Participant  = require('../models/Participant');
const  User  = require('../models/User');
const Team = require('../models/Team');
const Match =require('../models/Match');

require('dotenv').config();

const {Op} = require("sequelize");

router.get('/:teamId/participants', async (req, res) => {
    try {
      const { teamId } = req.params;
      const participants = await Participant.findAll({
        where: { teamId },
        include: [{ model: User, attributes: ['id', 'nickname'], as: 'user' }],
      });
      res.json(participants);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch participants' });
    }
});

router.delete('/:teamId/delete',async(req,res)=>{
  const {teamId} = req.params;
  try{
      const deletedTeam=await Team.findByPk(teamId);
      if(!deletedTeam){
        return res.status(404).json({message: 'Team not found'});
      }

      const matchPlayed=await Match.findOne({
        where: {
          [Op.or]:[
            {homeTeamID: teamId},
            {awayTeamID: teamId},
          ],
        },
      });

      if(matchPlayed){
        return res.status(400).json({message: 'Cannot delete team because it played match'});
      }

      await deletedTeam.destroy();
      res.status(200).json({message: 'Team deleted successfully'});
  } catch (err){
    res.status(500).json({message:'Failed to remove the team',error:err})
  }

});

router.get('/:id/name', async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findByPk(id, {
      attributes: ['name'],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.json({ name: team.name });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
  

module.exports = router;
