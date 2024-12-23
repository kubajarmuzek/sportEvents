const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { body, validationResult } = require('express-validator');

require('dotenv').config();

router.post('/register',[ 
  body('email').isEmail().withMessage('Invalid email format'),
] ,async (req, res) => {const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password, nickname, gender, birthDate } = req.body;  
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ email, password, nickname, gender, birthDate }); 

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname, 
        gender: user.gender,
        birthDate: user.birthDate,
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
        nickname: user.nickname,
        gender: user.gender,
        birthDate: user.birthDate,
      }
    };

    console.log('Login response:', response); 

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
