const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MatchSet=require('./MatchSet');
const Team=require('./Team');

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
        },
        onDelete:'CASCADE',
    },
    sport: {
        type:DataTypes.STRING,
        allowNull: false
    },
    round:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    bracket:{
        type: DataTypes.ENUM('upper','lower','semifinal','final','third_place'),
        allowNull:true,
    },
    homeTeamID: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'Teams',
            key: 'id'
        },
    },
    awayTeamID:{
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:'Teams',
            key: 'id'
        },
    
    },
    homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true

    },
    awayScore:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    group: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    
});

Match.associate=(models)=>{
    Match.belongsTo(models.Tournament,{
        foreignKey: 'tournamentId',
        as: 'tournament',
    });
};
Match.hasMany(MatchSet,{
    foreignKey: 'matchId',
    as: 'sets'
});

Match.belongsTo(Team,{
    foreignKey:'homeTeamID',
    as: 'homeTeam',
});

Match.belongsTo(Team,{
    foreignKey:'awayTeamID',
    as: 'awayTeam'
});
module.exports=Match;   