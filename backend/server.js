const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');
const Tournament = require('./models/Tournament')
const Teams=require('./models/Team')
const Participant=require('./models/Participant')
const Match=require('./models/Match');
const MatchSet=require('./models/MatchSet');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  credentials: true,
}));
app.use(bodyParser.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/participants',require('./routes/participants'));
app.use('/api/match',require('./routes/match'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('Database synced');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
