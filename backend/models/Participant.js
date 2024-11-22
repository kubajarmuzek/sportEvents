const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participant = sequelize.define('Participant', {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tournaments',
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Teams',
        key: 'id',
      },
    },
  });

  Participant.associate = (models) => {
    Participant.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });
    Participant.belongsTo(models.Tournament, {
        foreignKey: 'tournamentId',
        as: 'tournament',
    });
};
  
  module.exports = Participant;
