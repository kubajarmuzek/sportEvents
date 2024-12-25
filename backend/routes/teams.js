const express = require('express');
const router = express.Router();
const  Participant  = require('../models/Participant');
const  User  = require('../models/User');

require('dotenv').config();

router.get('/:teamId/participants', async (req, res) => {
    try {
      const { teamId } = req.params;
      const participants = await Participant.findAll({
        where: { teamId },
        include: [{ model: User, attributes: ['id', 'nickname'], as: 'user' }], // Include alias
      });
      res.json(participants);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch participants' });
    }
});
  

module.exports = router;
