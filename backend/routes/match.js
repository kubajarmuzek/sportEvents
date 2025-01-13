const express = require('express');
const router = express.Router();
const Match =require('../models/Match');
const Tournament = require('../models/Tournament');

require('dotenv').config();
const {Op} = require("sequelize");

router.patch('/:matchId/addResult',async(req,res)=>{
    const {matchId} =req.params;
    const addResults=req.body;

    try{
        const match=await Match.findByPk(matchId);
        if(!match){
            return res.status(404).json({message: 'Match not found'});
        }

        await Match.update(
            addResults,
            {where:{id: matchId}}
        )
        const tournamentId=match.tournamentId;
        const matchCount = await Match.count({where:{tournamentId}});

        const completedMatches= await Match.count({
            where: {
                tournamentId,
                homeScore:{[Op.not]:null},
                awayScore:{[Op.not]:null},
            }
        });
        
        if(completedMatches>0){
            const tournament=await Tournament.findByPk(tournamentId);
            if(tournament && tournament.tournamentStatus ==='not started'){
                await tournament.update({
                    tournamentStatus: 'in progress'
                });
            }
        }
        res.json({message: 'Match result added'});
        

    }catch(err){
        res.status(500).json({message: 'Failed to add result'});
    }
});

module.exports=router;