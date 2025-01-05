const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 16,
  },
  sport: {                       
    type: DataTypes.STRING,
    allowNull: false,
  },
  tournamentSystem:{
    type: DataTypes.ENUM('cup','round-robin ','group and cup', 'double elimination system'),
    allowNull: false,
  },
  maxTeams: {                   
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamSize: {                  
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  tournamentStatus:{
    type:DataTypes.ENUM('not started','in progress','completed'),
    allowNull: false,
    defaultValue: 'not started',
  }
}, {
  timestamps: true,
});


Tournament.associate = (models) => {
  Tournament.hasMany(models.Participant, {
    foreignKey: 'tournamentId',
    as: 'participants', 
  });
};

module.exports = Tournament;
