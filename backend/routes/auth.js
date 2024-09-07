const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config();

router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body;  
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ email, password, nickname }); 

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname 
      }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const response = {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname
      }
    };

    console.log('Login response:', response);  // Log the response

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);  // Log any backend errors
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
