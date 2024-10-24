const express = require("express");
const router = express.Router();

const sportsData = [
  {
    sport: "Soccer",
    suggestedTeams: 16,
    teamSize: 11,
  },
  {
    sport: "Basketball",
    suggestedTeams: 8,
    teamSize: 5,
  },
  {
    sport: "Tennis",
    suggestedTeams: 32,
    teamSize: 1,
  },
  {
    sport: "Volleyball",
    suggestedTeams: 12,
    teamSize: 6,
  },
];

router.get("/", (req, res) => {
  try {
    console.log(sportsData);
    res.json(sportsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sports data" });
  }
});

module.exports = router;

