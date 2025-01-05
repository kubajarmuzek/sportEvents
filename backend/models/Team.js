const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Participant = require('./Participant');

const Team = sequelize.define('Team', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tournamentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tournaments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  leaderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
});

Team.associate = (models) => {
  Team.belongsTo(models.Tournament, {
    foreignKey: 'tournamentId',
    as: 'tournament',
  });
  Team.hasMany(models.Participant, {
    foreignKey: 'teamId',
    as: 'members',
  });
};
module.exports = Team;
