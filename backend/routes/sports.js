const express = require("express");
const router = express.Router();

const sportsList = [
  "Football",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Beach Volleyball",
  "Baseball",
  "Hockey",
  "Badminton",
  "Table Tennis",
  "Cricket",
  "Rugby",
  "Handball"
];

router.get("/", (req, res) => {
  res.json(sportsList);
});

module.exports = router;
