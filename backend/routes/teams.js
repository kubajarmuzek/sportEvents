const express = require('express');
const router = express.Router();
const  Participant  = require('../models/Participant');
const  User  = require('../models/User');
const Team = require('../models/Team');

require('dotenv').config();

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
  try{
      const {teamId} = req.params;
      const deletedTeam=await Team.destroy({
        where:{id:teamId},
      })

      if(!deletedTeam){
        return res.status(404).json({message: 'Team not found'});
      }

      res.status(200).json({message: 'Team deleted successfully'});
  } catch (err){
    res.status(500).json({message:'Failed to remove the team',error:err})
  }

});
  

module.exports = router;
