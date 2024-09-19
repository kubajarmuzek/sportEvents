const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');
const Tournament = require('./models/Tournament')
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tournaments', require('./routes/tournaments'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })  // Keep a single sync call
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('Database synced');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
