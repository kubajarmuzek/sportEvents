const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Team = require('../models/Team');
const User = require('../models/User');
const Tournament = require('../models/Tournament');


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

        if(team.leaderId!=leaderId){
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


router.get('/pending-approvals/:leaderId', async (req, res) => {
    const { leaderId } = req.params;

    try {
        const teams = await Team.findAll({ where: { leaderId } });

        if (!teams.length) {
            return res.status(404).json({ message: 'No teams found for this leader' });
        }

        const teamIds = teams.map(team => team.id);

        const pendingParticipants = await Participant.findAll({
            where: {
                teamId: teamIds,
                statusUser: 'waiting'
            },
            include: [
                {
                    model: User,
                    as: 'user', 
                    attributes: ['nickname']
                },
                {
                    model: Tournament,
                    as: 'tournament',
                    attributes: ['name']
                }
            ]
        });

        if (!pendingParticipants.length) {
            return res.status(404).json({ message: 'No pending approvals found' });
        }

        const formattedResponse = pendingParticipants.map(participant => ({
            id: participant.id,
            participantName: participant.user.nickname,
            tournamentName: participant.tournament.name, 
            teamId: participant.teamId,
            statusUser: participant.statusUser
        }));

        res.status(200).json(formattedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pending approvals' });
    }
});





module.exports=router;