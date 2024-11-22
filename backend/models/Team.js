const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
