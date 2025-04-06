import React from "react";

const MatchCard = ({ match, scoreInput, onScoreChange, onAddResult }) => {
  const { id, homeTeamName, awayTeamName, homeScore, awayScore, round } = match;

  return (
    <li className="match-item">
      <div>
        <strong>Match:</strong> {homeTeamName} vs {awayTeamName}
      </div>
      {round && (
        <div>
          <strong>Round:</strong> {round}
        </div>
      )}
      {homeScore == null && awayScore == null ? (
        <div className="score-inputs">
          <input
            type="number"
            placeholder="Home"
            value={scoreInput?.homeScore || ""}
            onChange={(e) => onScoreChange(id, "homeScore", e.target.value)}
          />
          <input
            type="number"
            placeholder="Away"
            value={scoreInput?.awayScore || ""}
            onChange={(e) => onScoreChange(id, "awayScore", e.target.value)}
          />
          <button
            onClick={() =>
              onAddResult(id, scoreInput?.homeScore, scoreInput?.awayScore)
            }
          >
            Add Result
          </button>
        </div>
      ) : (
        <div>
          <strong>Score:</strong> {homeScore} : {awayScore}
        </div>
      )}
    </li>
  );
};

export default MatchCard;
