const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchSet=sequelize.define('MatchSet',{
    id: {
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    matchId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
            model: 'Matches',
            key: 'id'
        },
    },
    setNumber:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    homeScore:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    awayScore:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
});

MatchSet.associate = (models) =>{
    MatchSet.belongsTo(models.Match,{
        foreignKey: 'matchId',
        as: 'match'
    })
};
module.exports=MatchSet;