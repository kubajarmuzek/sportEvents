const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Participant = require('../models/Participant');
const User = require('../models/User');
const Team = require('../models/Team');
const Match = require('../models/Match');

const MatchSet = require('../models/MatchSet');

require('dotenv').config();

const {Op} = require("sequelize");


router.post('/', async (req, res) => {
  const { name, startDate, location, description, organizerId, sport, tournamentSystem, maxTeams, teamSize } = req.body;

  if (!name || !startDate || !location || !organizerId || !sport || !tournamentSystem || !maxTeams || !teamSize) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newTournament = await Tournament.create({
      name,
      startDate,
      location,
      description,
      organizerId,
      sport,
      tournamentSystem,
      maxTeams,
      teamSize,
    });
    res.status(201).json(newTournament); 
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.findAll();
    res.json(tournaments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/:tournamentId/teams', async (req, res) => {
  const { name, leaderId } = req.body;
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    const teamCount = await Team.count({ where: { tournamentId } });
    const leader= await User.findByPk(leaderId);

    if(!leader){
      return res.status(404).json({message: 'Leader not found'});
    }
    
    if(!tournament){
      return res.status(404).json({message: 'Tournament not found'});
    }

    if (teamCount >= tournament.maxTeams) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const team = await Team.create({ name, leaderId, tournamentId });
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating team' });
  }
});

router.get('/:tournamentId/teams', async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const teams = await Team.findAll({ where: { tournamentId } });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});

router.post('/signup', async (req, res) => {
  const { userId, tournamentId, teamId } = req.body;

  try {
    const existingParticipant = await Participant.findOne({
      where: { userId, tournamentId }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'User is already signed up for this team in the tournament' });
    }

    const team = await Team.findByPk(teamId);
    const participantCount = await Participant.count({ where: { teamId } });

    if (participantCount >= team.teamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    const participant = await Participant.create({ userId, tournamentId, teamId, statusUser: 'waiting' });
    res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up for tournament' });
  }
});

router.get('/:tournamentId/teams', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const teams = await Team.findAll({ where: { tournamentId } });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

router.delete('/:tournamentId/delete',async(req,res)=>{
  const { tournamentId }=req.params;
  try {
    
    const deletedTournament=await Tournament.findByPk(tournamentId);

    if(!deletedTournament){
      return res.status(404).json({message:'Tournament not found'});
    }

    const tournamentStart=await Match.findOne({
      where:{
          tournamentId:tournamentId,
      [Op.and]:[
        {homeScore:{[Op.ne]: null}},
        {awayScore:{[Op.ne]:null}},
      ],},
    });
    if(tournamentStart){
      return res.status(400).json({message: 'Cannot delete tournament because it started'});
    }

    await deletedTournament.destroy();
    res.status(200).json({message: 'Tournament deleted successfully'});

  }catch (err){
    res.status(500).json({message:'Failed to remove the tournament',error:err})
  }
});

router.patch('/:tournamentId/edit',async (req,res) => {
  const {tournamentId} =req.params;
  const updates= req.body;

  try{
    const tournament= await Tournament.findByPk(tournamentId);

    if(!tournament){
      return res.status(404).json({message: 'Tournament not found'});
    }

    await Tournament.update(
      updates,
      {where:{id: tournamentId}}
    )
    res.json({message: 'Tournament updated successfully'});

  } catch(err){
    res.status(500).json({message:'Failed to edit the tournament',error:err})
  }
});

router.get('/:tournamentId/downloadingMatches',async (req,res)=>{
  const {tournamentId}=req.params;
  try{
      const tournament=await Tournament.findByPk(tournamentId);

      if(!tournament){
        return res.status(404).json({message:'Tournament not found'});
      }

      const matches = await Match.findAll({
        where: { tournamentId } ,
        include: [
          {
          model: MatchSet,
          as: 'sets',
      },
    ],
  });

  return res.json(matches);

  }catch(err){
    res.status(500).json({message:'Failed to download matches',error:err})
  }

});

router.post("/:tournamentId/cup/generate-first-round", async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const teams = await Team.findAll({ 
      where: { 
        tournamentId, 
        name: { [Op.ne]: 'bye' }
      }
    });
    
    if (teams.length < 2) {
      return res
        .status(400)
        .json({ message: "Not enough teams to start the tournament." });
    }

    const shuffledTeams = teams.sort(() => 0.5 - Math.random());
    const nextPowerOf2 = Math.pow(
      2,
      Math.ceil(Math.log2(shuffledTeams.length))
    );
    const byesNeeded = nextPowerOf2 - shuffledTeams.length;

    let byeTeam = await Team.findOne({ where: { name: "Bye", tournamentId } });
    if (!byeTeam) {
      byeTeam = await Team.create({
        name: "Bye",
        tournamentId,
        leaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (let i = 0; i < byesNeeded; i++) {
      shuffledTeams.push(byeTeam);
    }

    const firstRoundMatches = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      console.log(shuffledTeams[i].id)
      if (
        shuffledTeams[i].id !== byeTeam.id &&
        shuffledTeams[i + 1].id !== byeTeam.id
      ) {
        firstRoundMatches.push({
          tournamentId,
          sport: tournament.sport,
          homeTeamID: shuffledTeams[i].id,
          awayTeamID: shuffledTeams[i + 1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
          round: 0,
        });
      } else {
        const realTeamID =
          shuffledTeams[i].id === byeTeam.id
            ? shuffledTeams[i + 1].id
            : shuffledTeams[i].id;
        firstRoundMatches.push({
          tournamentId,
          sport: tournament.sport,
          homeTeamID: realTeamID,
          awayTeamID: byeTeam.id,
          homeScore: 1,
          awayScore: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          round: 0,
        });
      }
    }

    console.log(firstRoundMatches)

    if (firstRoundMatches.length > 0) {
      await Match.bulkCreate(firstRoundMatches);
    }

    res
      .status(201)
      .json({
        message: "First round matches generated successfully.",
        matches: firstRoundMatches,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/:tournamentId/cup/generate-next-round", async (req, res) => {
  const { tournamentId } = req.params;
  try {
    const tournament = await Tournament.findByPk(tournamentId);
    const latestRound = await Match.max("round", { where: { tournamentId } });
    if (latestRound === null) {
      return res.status(400).json({ message: "No matches found in the tournament." });
    }
    const latestRoundMatches = await Match.findAll({
      where: { tournamentId, round: latestRound },
    });
    const unfinishedMatches = latestRoundMatches.filter(
      (match) => match.homeScore === null || match.awayScore === null
    );
    if (unfinishedMatches.length > 0) {
      return res.status(400).json({
        message: "Not all matches in the latest round are finished.",
        unfinishedMatches,
      });
    }
    const winners = latestRoundMatches.map((match) => {
      return match.homeScore > match.awayScore ? match.homeTeamID : match.awayTeamID;
    });
    if (winners.length < 2) {
      return res.status(400).json({ message: "Not enough winners to generate the next round." });
    }
    const shuffledWinners = winners.sort(() => 0.5 - Math.random());
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffledWinners.length)));
    const byesNeeded = nextPowerOf2 - shuffledWinners.length;
    let byeTeam = await Team.findOne({ where: { name: "Bye", tournamentId } });
    if (!byeTeam) {
      byeTeam = await Team.create({
        name: "Bye",
        tournamentId,
        leaderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    for (let i = 0; i < byesNeeded; i++) {
      shuffledWinners.push(byeTeam.id);
    }
    const nextRoundMatches = [];
    for (let i = 0; i < shuffledWinners.length; i += 2) {
      if (shuffledWinners[i] !== byeTeam.id && shuffledWinners[i + 1] !== byeTeam.id) {
        nextRoundMatches.push({
          tournamentId,
          sport: tournament.sport,
          homeTeamID: shuffledWinners[i],
          awayTeamID: shuffledWinners[i + 1],
          round: parseInt(latestRound) + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        const realTeamID =
          shuffledWinners[i] === byeTeam.id ? shuffledWinners[i + 1] : shuffledWinners[i];
        nextRoundMatches.push({
          tournamentId,
          sport: tournament.sport,
          homeTeamID: realTeamID,
          awayTeamID: byeTeam.id,
          homeScore: 1,
          awayScore: 0,
          round: latestRound + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    await Match.bulkCreate(nextRoundMatches);
    res.status(201).json({
      message: `Round ${parseInt(latestRound) + 1} matches generated successfully.`,
      matches: nextRoundMatches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/:tournamentId/round-robin/generate",async (req,res)=>{
    const {tournamentId}=req.params;

    try{
      const tournament = await Tournament.findByPk(tournamentId);
      if(!tournament){
        return res.status(404).json({message: 'Tournament not found'});
      }

      const teams = await Team.findAll({
        where: {
          tournamentId:tournamentId
        }
      });

      if (teams.length < 2){
        return res.status(400).json({message: "Not enough teams to start the tournament"});
      }

    if (teams.length%2!=0){
      let pauseTeam= await Team.create({
        name:"pause",
        tournamentId,
      })
    }
    const rounds=[];
    const totalRounds=teams.length-1;
    const rotatingTeam=teams.slice(1);
    const half=Math.floor(teams.length/2);

    
    for (let i=0;i<totalRounds;i++){
      const matches=[];

      matches.push({
        tournamentId,
        sport: tournament.sport,
        homeTeamID:teams[0].id,
        awayTeamID:rotatingTeam[rotatingTeam.length-1].id,
      });

      for(let i=0;i<half-1;i++){
        matches.push({
          tournamentId,
          sport: tournament.sport,
          homeTeamID: rotatingTeam[i].id,
          awayTeamID: rotatingTeam[rotatingTeam.length-2-i].id,

        });


      }
      rotatingTeam.unshift(rotatingTeam.pop());
      rounds.push(matches);
    }

    const allMatches=rounds.flat();
    await Match.bulkCreate(allMatches);

    res.status(201).json({message: "Generated games for round-robin"});;

    }catch(err){
      res.status(500).json({message: "Tournament generation failed"})
    }
});

router.post("/:tournamentId/group/generate-groups", async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const teams = await Team.findAll({
      where: { tournamentId },
    });

    if (teams.length < 2) {
      return res
          .status(400)
          .json({ message: "Not enough teams to start the tournament." });
    }

    const shuffledTeams = teams.sort(() => 0.5 - Math.random());

    const groups = [];
    const groupSize = 4;
    let currentGroup = [];

    shuffledTeams.forEach((team, index) => {
      currentGroup.push(team);
      if (currentGroup.length === groupSize || index === shuffledTeams.length - 1) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });

    const groupMatches = [];

    groups.forEach((group, groupIndex) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          groupMatches.push({
            tournamentId,
            sport: tournament.sport,
            homeTeamID: group[i].id,
            awayTeamID: group[j].id,
            createdAt: new Date(),
            updatedAt: new Date(),
            group: groupIndex + 1,
            round: 0,
          });
        }
      }
    });

    if (groupMatches.length > 0) {
      await Match.bulkCreate(groupMatches);
    }

    res.status(201).json({
      message: "Group stage matches generated successfully.",
      matches: groupMatches,
      groups: groups.map((group, index) => ({
        group: index + 1,
        teams: group.map((team) => team.name),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:tournamentId/table",async(req,res)=>{
  const {tournamentId}=req.params;

  try{
        const matches= await Match.findAll({
          where: {tournamentId},
          include: [
            {
              model: Team, as: 'homeTeam', atrributes:['id','name']
            },
            {
              model: Team, as:'awayTeam', attributes:['id','name']
            },
          ],
        });
        const statistics= {};
        matches.forEach((match) => {
            const { homeTeam, awayTeam, homeScore, awayScore } = match;
            if (homeScore !== null && awayScore !== null) {
                if (!statistics[homeTeam.id]) {
                    statistics[homeTeam.id] = {
                        teamName: homeTeam.name,
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        goalDifference: 0,
                        points: 0,
                    };
                }

                if (!statistics[awayTeam.id]) {
                    statistics[awayTeam.id] = {
                        teamName: awayTeam.name,
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        goalDifference: 0,
                        points: 0,
                    };
                }

                statistics[homeTeam.id].played += 1;
                statistics[homeTeam.id].goalsFor += homeScore;
                statistics[homeTeam.id].goalsAgainst += awayScore;
                statistics[homeTeam.id].goalDifference += homeScore - awayScore;

                statistics[awayTeam.id].played += 1;
                statistics[awayTeam.id].goalsFor += awayScore;
                statistics[awayTeam.id].goalsAgainst += homeScore;
                statistics[awayTeam.id].goalDifference += awayScore - homeScore;
                if (homeScore > awayScore) {
                    statistics[homeTeam.id].won += 1;
                    statistics[awayTeam.id].lost += 1;
                    statistics[homeTeam.id].points += 3;
                } else if (homeScore < awayScore) {
                    statistics[awayTeam.id].won += 1;
                    statistics[homeTeam.id].lost += 1;
                    statistics[awayTeam.id].points += 3;
                } else {
                    statistics[homeTeam.id].drawn += 1;
                    statistics[awayTeam.id].drawn += 1;
                    statistics[homeTeam.id].points += 1;
                    statistics[awayTeam.id].points += 1;
                }
            }
        });

        const statisticsArray = Object.values(statistics).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        res.json(statisticsArray);
  }catch(err){
    res.status(500).json({message: "The competition table could not be created",error:err});
  }
});


module.exports = router;
