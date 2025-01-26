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

router.get('/:tournamentId', async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findOne({
      where: { id: tournamentId },
      attributes: ['id', 'name', 'tournamentSystem'],
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    res.status(500).json({ message: "Failed to fetch tournament.", error });
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

router.post("/:tournamentId/round-robin/generate", async (req, res) => {
  const { tournamentId } = req.params;

  try {
      const tournament = await Tournament.findByPk(tournamentId);
      if (!tournament) {
          return res.status(404).json({ message: 'Tournament not found' });
      }

      let teams = await Team.findAll({
          where: {
              tournamentId: tournamentId
          }
      });

      if (teams.length < 2) {
          return res.status(400).json({ message: "Not enough teams to start the tournament" });
      }

      if (teams.length % 2 !== 0) {
          const pauseTeam = await Team.create({
              name: "pause",
              tournamentId,
          });
          teams.push(pauseTeam); 
      }

      const rounds = [];
      const totalRounds = teams.length - 1;
      const rotatingTeam = teams.slice(1); 
      const half = Math.floor(teams.length / 2);

      for (let i = 0; i < totalRounds; i++) {
          const matches = [];
          matches.push({
              tournamentId,
              sport: tournament.sport,
              homeTeamID: teams[0].id,
              awayTeamID: rotatingTeam[rotatingTeam.length - 1].id,
          });

          for (let j = 0; j < half - 1; j++) {
              matches.push({
                  tournamentId,
                  sport: tournament.sport,
                  homeTeamID: rotatingTeam[j].id,
                  awayTeamID: rotatingTeam[rotatingTeam.length - 2 - j].id,
              });
          }
          rotatingTeam.unshift(rotatingTeam.pop());

          rounds.push(matches);
      }

      const allMatches = rounds.flat();
      await Match.bulkCreate(allMatches);

      res.status(201).json({ message: "Generated games for round-robin" });

  } catch (err) {
      console.error("Error generating tournament:", err);
      res.status(500).json({ message: "Tournament generation failed" });
  }
});


router.post("/:tournamentId/group/generate-first-round", async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const sport = tournament.sport;

    const matches = await Match.findAll({
      where: { tournamentId },
      include: [
        {
          model: Team,
          as: 'homeTeam',
          attributes: ['id', 'name'],
        },
        {
          model: Team,
          as: 'awayTeam',
          attributes: ['id', 'name'],
        },
      ],
    });

    const groupStandings = {};

    matches.forEach((match) => {
      const { homeTeam, awayTeam, homeScore, awayScore, group } = match;

      if (!groupStandings[group]) {
        groupStandings[group] = [];
      }

      if (!groupStandings[group].find(team => team.teamId === homeTeam.id)) {
        groupStandings[group].push({
          teamId: homeTeam.id,
          name: homeTeam.name,
          points: 0,
          goalDifference: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        });
      }

      if (!groupStandings[group].find(team => team.teamId === awayTeam.id)) {
        groupStandings[group].push({
          teamId: awayTeam.id,
          name: awayTeam.name,
          points: 0,
          goalDifference: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        });
      }

      const homeTeamStats = groupStandings[group].find(team => team.teamId === homeTeam.id);
      const awayTeamStats = groupStandings[group].find(team => team.teamId === awayTeam.id);

      homeTeamStats.goalsFor += homeScore;
      homeTeamStats.goalsAgainst += awayScore;
      homeTeamStats.goalDifference += (homeScore - awayScore);

      awayTeamStats.goalsFor += awayScore;
      awayTeamStats.goalsAgainst += homeScore;
      awayTeamStats.goalDifference += (awayScore - homeScore);

      if (homeScore > awayScore) {
        homeTeamStats.points += 3;
      } else if (awayScore > homeScore) {
        awayTeamStats.points += 3;
      } else {
        homeTeamStats.points += 1;
        awayTeamStats.points += 1;
      }
    });

    console.log("Group Standings:", groupStandings);

    const firstPlaceTeams = [];
    const secondPlaceTeams = [];

    for (const group in groupStandings) {
      const groupTeams = groupStandings[group];

      groupTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      console.log(`Sorted teams for group ${group}:`, groupTeams);

      if (groupTeams.length >= 2) {
        firstPlaceTeams.push(groupTeams[0]);
        secondPlaceTeams.push(groupTeams[1]);
      } else {
        console.error(`Group ${group} does not have enough teams.`);
      }
    }

    console.log("First place teams:", firstPlaceTeams);
    console.log("Second place teams:", secondPlaceTeams);

    if (firstPlaceTeams.length === 0 || secondPlaceTeams.length === 0) {
      console.error("No first or second place teams found.");
      return res.status(500).json({ message: "Error: No valid teams found." });
    }

    const firstRoundMatches = [];

    for (let i = 0; i < firstPlaceTeams.length; i++) {
      const firstPlace = firstPlaceTeams[i];

      if (!firstPlace) {
        console.error(`First place team at index ${i} is undefined`);
        continue;
      }

      const availableSecondPlaceTeams = secondPlaceTeams.filter((team, index) => index !== i);

      if (availableSecondPlaceTeams.length === 0) {
        console.error("No second-place teams available for pairing.");
        continue;
      }

      const secondPlace = availableSecondPlaceTeams[Math.floor(Math.random() * availableSecondPlaceTeams.length)];

      if (!secondPlace) {
        console.error(`Second place team for pairing with ${firstPlace.name} is undefined.`);
        continue;
      }

      firstRoundMatches.push({
        tournamentId,
        sport,
        homeTeamID: firstPlace.teamId,
        awayTeamID: secondPlace.teamId,
        createdAt: new Date(),
        updatedAt: new Date(),
        round: 1,
        group: null,
      });
    }

    if (firstRoundMatches.length === 0) {
      console.error("No first round matches were created.");
      return res.status(500).json({ message: "Error: No first round matches generated." });
    }

    await Match.bulkCreate(firstRoundMatches);
    tournament.tournamentSystem = 'cup';
    await tournament.save();

    res.status(201).json({
      message: "First round of the cup generated successfully.",
      matches: firstRoundMatches,
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

router.post('/:tournamentId/doubleEliminationSystem/startTournament', async (req, res) => {
  try {
      const { tournamentId } = req.params;
      const tournament = await Tournament.findByPk(tournamentId);

      if (!tournament) {
          return res.status(404).json({ error: 'The tournament does not exist ' });
      }

      const existingMatches = await Match.findOne({ where: { tournamentId } });

      if (existingMatches) {
          return res.status(400).json({ error: 'The tournament has already started. Matches are already generated.' });
      }

      const teams = await Team.findAll({ where: { tournamentId} });

      if (![8, 16].includes(teams.length)) {
          return res.status(400).json({ error: 'The tournament must have 8 or 16 teams' });
      }

      const shuffledTeams = teams.sort(() => Math.random() - 0.5);
      const initialMatches = [];

      for (let i = 0; i < shuffledTeams.length; i += 2) {
          initialMatches.push({
              tournamentId,
              sport: tournament.sport,
              round: '1',
              bracket: 'upper',
              homeTeamID: shuffledTeams[i].id,
              awayTeamID: shuffledTeams[i + 1].id,
              homeScore: null,
              awayScore: null,
          });
      }

      await Match.bulkCreate(initialMatches);

      res.json({ message: 'First round of the tournament generated successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.post('/:tournamentId/doubleEliminationSystem/generateNextRound', async (req, res) => {
  try {
      const { tournamentId } = req.params;
      const tournament = await Tournament.findByPk(tournamentId);

      if (!tournament) {
          return res.status(404).json({ error: 'The tournament does not exist ' });
      }

      const teams = await Team.findAll({ where: { tournamentId } });

      if (!teams || teams.length === 0) {
          return res.status(400).json({ error: 'No teams in the tournament' });
      }

      const matches = await Match.findAll({
          where: { tournamentId },
          order: [['round', 'DESC']]
      });

      if (matches.length === 0) {
          return res.status(400).json({ error: 'No matches played, next round of the tournament cannot be generated.' });
      }

      const numTeams = teams.length;
      const upperRoundLimit = numTeams === 8 ? 2 : 3;
      const lowerRoundLimit = numTeams === 8 ? 2 : 4;

      const upperBracketMatches = matches.filter(m => m.bracket === 'upper');
      const lowerBracketMatches = matches.filter(m => m.bracket === 'lower');

      const lastUpperRound = upperBracketMatches.length > 0 
          ? Math.max(...upperBracketMatches.map(m => parseInt(m.round)))
          : 0;
      
      const lastLowerRound = lowerBracketMatches.length > 0 
          ? Math.max(...lowerBracketMatches.map(m => parseInt(m.round)))
          : 0;

      if (lastUpperRound >= upperRoundLimit && lastLowerRound >= lowerRoundLimit) {
          return res.json({ message: 'Generate semi-finals' });
      }

      const nextUpperRound = lastUpperRound < upperRoundLimit ? `${lastUpperRound + 1}` : null;
      const nextLowerRound = lastLowerRound < lowerRoundLimit ? `${lastLowerRound + 1}` : null;

      const lastUpperRoundMatches = upperBracketMatches.filter(m => m.round === `${lastUpperRound}`);
      const lastLowerRoundMatches = lowerBracketMatches.filter(m => m.round === `${lastLowerRound}`);

      let upperBracketTeams = [];
      let lowerBracketTeams = [];

      for (const match of lastUpperRoundMatches) {
          if (match.homeScore === null || match.awayScore === null) {
              return res.status(400).json({ error: 'Not all matches of the previous round in the upper bracket were played.' });
          }

          const result = match.homeScore > match.awayScore
              ? { winner: match.homeTeamID, loser: match.awayTeamID }
              : { winner: match.awayTeamID, loser: match.homeTeamID };

          upperBracketTeams.push(result.winner);
          lowerBracketTeams.push(result.loser);
      }

      for (const match of lastLowerRoundMatches) {
          if (match.homeScore === null || match.awayScore === null) {
              return res.status(400).json({ error: 'Not all matches of the previous round in the lower bracket were played.' });
          }

          const result = match.homeScore > match.awayScore
              ? { winner: match.homeTeamID }
              : { winner: match.awayTeamID };

          lowerBracketTeams.push(result.winner);
      }

      const newMatches = [];

      if (nextUpperRound && upperBracketTeams.length > 1) {
          for (let i = 0; i < upperBracketTeams.length; i += 2) {
              if (upperBracketTeams[i + 1]) {
                  newMatches.push({
                      tournamentId,
                      sport: tournament.sport,
                      round: nextUpperRound,
                      bracket: 'upper',
                      homeTeamID: upperBracketTeams[i],
                      awayTeamID: upperBracketTeams[i + 1],
                      homeScore: null,
                      awayScore: null,
                  });
              }
          }
      }

      if (nextLowerRound && lowerBracketTeams.length > 1) {
          for (let i = 0; i < lowerBracketTeams.length; i += 2) {
              if (lowerBracketTeams[i + 1]) {
                  newMatches.push({
                      tournamentId,
                      sport: tournament.sport,
                      round: nextLowerRound,
                      bracket: 'lower',
                      homeTeamID: lowerBracketTeams[i],
                      awayTeamID: lowerBracketTeams[i + 1],
                      homeScore: null,
                      awayScore: null,
                  });
              }
          }
      }

      if (newMatches.length === 0) {
          return res.json({ message: 'Generate semi-final matches' });
      }

      await Match.bulkCreate(newMatches);

      res.json({ message: `The next rounds of the tournament have been generated` });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.post('/:tournamentId/doubleEliminationSystem/generateSemifinals', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      return res.status(404).json({ error: 'The tournament does not exist' });
    }

    const matches = await Match.findAll({
      where: { tournamentId },
      order: [['round', 'ASC']],
    });

    if (matches.length === 0) {
      return res.status(400).json({ error: 'The matches of the previous round have not been completed yet' });
    }
    const existingSemifinalMatches = await Match.findAll({
      where: {
        tournamentId,
        round: 'semi',
        bracket: 'final',
      },
    });

    if (existingSemifinalMatches.length > 0) {
      return res.status(400).json({ error: 'The semi-final matches have already been generated.' });
    }

    const teams = await Team.findAll({ where: { tournamentId} });
    const numTeams = teams.length;

    let upperRoundLimit, lowerRoundLimit;
    let upperRoundMatches, lowerRoundMatches;

    if (numTeams === 8) {
      upperRoundLimit = 2;
      lowerRoundLimit = 2;
      upperRoundMatches = matches.filter(m => m.bracket === 'upper' && m.round === '2');
      lowerRoundMatches = matches.filter(m => m.bracket === 'lower' && m.round === '2');
    } else if (numTeams === 16) {
      upperRoundLimit = 3;
      lowerRoundLimit = 4;
      upperRoundMatches = matches.filter(m => m.bracket === 'upper' && m.round === '3');
      lowerRoundMatches = matches.filter(m => m.bracket === 'lower' && m.round === '4');
    } else {
      return res.status(400).json({ error: 'The number of teams must be 8 or 16' });
    }

    if (upperRoundMatches.length !== upperRoundLimit || lowerRoundMatches.length !== lowerRoundLimit) {
      return res.status(400).json({ error: 'Not all rounds have been played yet. Generate next rounds' });
    }
    const winnersUpper = upperRoundMatches.map(m => m.homeScore > m.awayScore ? m.homeTeamID : m.awayTeamID);
    const winnersLower = lowerRoundMatches.map(m => m.homeScore > m.awayScore ? m.homeTeamID : m.awayTeamID);

    const semifinalMatches = [
      {
        tournamentId,
        sport: tournament.sport,
        round: 'semi',
        bracket: 'final',
        homeTeamID: winnersUpper[0], 
        awayTeamID: winnersLower[0],  
        homeScore: null,
        awayScore: null,
      },
      {
        tournamentId,
        sport: tournament.sport,
        round: 'semi',
        bracket: 'final',
        homeTeamID: winnersUpper[1],  
        awayTeamID: winnersLower[1],  
        homeScore: null,
        awayScore: null,
      }
    ];

    await Match.bulkCreate(semifinalMatches);

    return res.json({ message: 'Semi-final matches generated!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:tournamentId/doubleEliminationSystem/generateFinalsAndThirdPlace', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      return res.status(404).json({ error: 'The tournament does not exist' });
    }

    const existingFinalMatches = await Match.findAll({
      where: {
        tournamentId,
        round: ['final', 'third_place'],
        bracket: 'final',
      },
    });

    if (existingFinalMatches.length > 0) {
      return res.status(400).json({ error: 'The final matches and the 3rd place match have already been generated.' });
    }

    const semifinalMatches = await Match.findAll({
      where: {
        tournamentId,
        round: 'semi',
        bracket: 'final',
      },
    });

    if (semifinalMatches.length !== 2) {
      return res.status(400).json({ error: 'Not enough games were played' });
    }
    const completedSemifinalMatches = semifinalMatches.filter(m => m.homeScore !== null && m.awayScore !== null);

    if (completedSemifinalMatches.length !== 2) {
      return res.status(400).json({ error: 'The semi-final has not been played yet' });
    }

    const winner1 = completedSemifinalMatches[0].homeScore > completedSemifinalMatches[0].awayScore ? completedSemifinalMatches[0].homeTeamID : completedSemifinalMatches[0].awayTeamID;
    const winner2 = completedSemifinalMatches[1].homeScore > completedSemifinalMatches[1].awayScore ? completedSemifinalMatches[1].homeTeamID : completedSemifinalMatches[1].awayTeamID;
    const loser1 = completedSemifinalMatches[0].homeScore < completedSemifinalMatches[0].awayScore ? completedSemifinalMatches[0].homeTeamID : completedSemifinalMatches[0].awayTeamID;
    const loser2 = completedSemifinalMatches[1].homeScore < completedSemifinalMatches[1].awayScore ? completedSemifinalMatches[1].homeTeamID : completedSemifinalMatches[1].awayTeamID;

    const finalMatch = {
      tournamentId,
      sport: tournament.sport,
      round: 'final',
      bracket: 'final',
      homeTeamID: winner1,
      awayTeamID: winner2,
      homeScore: null,
      awayScore: null,
    };

    const thirdPlaceMatch = {
      tournamentId,
      sport: tournament.sport,
      round: 'third_place',
      bracket: 'final',
      homeTeamID: loser1,
      awayTeamID: loser2,
      homeScore: null,
      awayScore: null,
    };

    await Match.bulkCreate([thirdPlaceMatch,finalMatch]);

    return res.json({ message: 'The final and the match for 3rd place have been generated!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
