const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

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

module.exports = router;
