const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Team = require('../models/Team');


require('dotenv').config();

router.put('/:participantId/approve',async(req,res)=>{
    const{participantId}=req.params;
    const{leaderId}=req.body;

    try{
        const participant=await Participant.findByPk(participantId);
        if(!participant){
            return res.status(404).json({message: 'Participant not found'});
        }

        const team=await Team.findByPk(participant.teamId);
        if(!team){
            return res.status(404).json({message: 'Team not found'});
        }

        if(team.leaderId!==leaderId){
            return res.status(403).json({message: 'Only the team captain can approve participants'});
        }

        participant.statusUser='approved';
        await participant.save();

        res.status(200).json(participant);
    } catch(error){
        console.error(err);
        res.status(500).json({message: 'Error approving participant'});
    }


});

router.put('/:participantId/reject',async(req,res)=>{
    const{participantId}=req.params;
    const{leaderId}=req.body;

    try{
        const participant=await Participant.findByPk(participantId);
        if(!participant){
            return res.status(404).json({message: 'Participant not found'});
        }

        const team=await Team.findByPk(participant.teamId);
        if(!team){
            return res.status(404).json({message: 'Team not found'});
        }

        if(team.leaderId!==leaderId){
            return res.status(403).json({message: 'Only the team captain can reject participants'});
        }

        participant.statusUser='rejected';
        await participant.save();

        res.status(200).json(participant);
    } catch(error){
        console.error(err);
        res.status(500).json({message: 'Error rejecting participant'});
    }
});

module.exports=router;