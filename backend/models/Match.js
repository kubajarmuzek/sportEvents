const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match',{
    id: {
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    tournamentId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: 'Tournaments',
            key: 'id'
        }
    },
    sport: {
        type:DataTypes.STRING,
        allowNull: false
    },
    homeTeamId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'Teams',
            key: 'id'
        }
    },
    awayTeamId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'Teams',
            key: 'id'
        }
    },
    homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true

    },
    awayStore:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    
});

Match.associate=(models)=>{
    Match.belongsTo(models.Tournament,{
        foreignKey: 'tournamentId',
        as: 'tournament',
    });
    Match.belongsTo(models.Team,{
        foreignKey:'homeTeamId',
        as: 'homeTeam',
    });
   
    Match.belongsTo(models.Team,{
        foreignKey:'awayTeamId',
        as: 'awayTeam'
    });
    
    Match.hasMany(models.MatchSet,{
        foreignKey: 'matchId',
        as: 'sets'
    });
};

module.exports=Match;   