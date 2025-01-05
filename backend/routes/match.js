const express = require('express');
const router = express.Router();
const Match =require('../models/Match');

require('dotenv').config();

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
        res.json({message: 'Match result added'});
        

    }catch(err){
        res.status(500).json({message: 'Failed to add result'});
    }
});

module.exports=router;