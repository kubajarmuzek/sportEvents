import MatchCard from "../../components/MatchCard";

const RenderMatches = ({
  matches,
  tournament,
  scoreInputs,
  setScoreInputs,
  handleAddResult,
  handleGenerateFirstKnockoutRound,
  handleGenerateNextRound,
  handleGenerateSemifinals,
  handleGenerateFinalsAndThirdPlace
}) => {
  switch (tournament.tournamentSystem) {
    case "round-robin":
      return (
        <ul className="matches-list">
          {matches
            .filter(
              (match) =>
                match.homeTeamName.toLowerCase() !== "bye" &&
                match.awayTeamName.toLowerCase() !== "bye" &&
                match.homeTeamName.toLowerCase() !== "pause" &&
                match.awayTeamName.toLowerCase() !== "pause"
            )
            .map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                scoreInput={scoreInputs[match.id]}
                onScoreChange={(id, field, value) =>
                  setScoreInputs((prev) => ({
                    ...prev,
                    [id]: {
                      ...prev[id],
                      [field]: value,
                    },
                  }))
                }
                onAddResult={handleAddResult}
              />
            ))}
        </ul>
      );

    case "group and cup":
      return (
        <div className="group-stage">
          <h2>Group Stage Matches</h2>
          <ul className="matches-list">
            {matches.filter((match) => match.group !== null).length > 0 ? (
              matches
                .filter((match) => match.group !== null)
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scoreInput={scoreInputs[match.id]}
                    onScoreChange={(id, field, value) =>
                      setScoreInputs((prev) => ({
                        ...prev,
                        [id]: {
                          ...prev[id],
                          [field]: value,
                        },
                      }))
                    }
                    onAddResult={handleAddResult}
                  />
                ))
            ) : (
              <div>No group matches found.</div>
            )}
          </ul>
          <button
            onClick={handleGenerateFirstKnockoutRound}
            className="form-button"
          >
            Generate First Round of Knockout Stage
          </button>

          <button onClick={handleGenerateNextRound} className="form-button">
            Generate Next Round of Knockout Stage
          </button>
        </div>
      );

    case "cup":
      return (
        <>
          <ul className="matches-list">
            {matches
              .filter(
                (match) =>
                  match.homeTeamName.toLowerCase() !== "bye" &&
                  match.awayTeamName.toLowerCase() !== "bye" &&
                  match.homeTeamName.toLowerCase() !== "pause" &&
                  match.awayTeamName.toLowerCase() !== "pause"
              )
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  scoreInput={scoreInputs[match.id]}
                  onScoreChange={(id, field, value) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        [field]: value,
                      },
                    }))
                  }
                  onAddResult={handleAddResult}
                />
              ))}
          </ul>
          <button onClick={handleGenerateNextRound} className="form-button">
            Start Next Round
          </button>
        </>
      );

    case "double elimination system":
      return (
        <>
          <h3>Upper Bracket</h3>
          <ul className="matches-list">
            {matches
              .filter((match) => match.bracket === "upper")
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  scoreInput={scoreInputs[match.id]}
                  onScoreChange={(id, field, value) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        [field]: value,
                      },
                    }))
                  }
                  onAddResult={handleAddResult}
                />
              ))}
          </ul>

          <h3>Lower Bracket</h3>
          <ul className="matches-list">
            {matches
              .filter((match) => match.bracket === "lower")
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  scoreInput={scoreInputs[match.id]}
                  onScoreChange={(id, field, value) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        [field]: value,
                      },
                    }))
                  }
                  onAddResult={handleAddResult}
                />
              ))}
          </ul>

          <h3>Final & 3rd Place</h3>
          <ul className="matches-list">
            {matches
              .filter((match) =>
                ["final", "third_place", "semi"].includes(match.round)
              )
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  scoreInput={scoreInputs[match.id]}
                  onScoreChange={(id, field, value) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        [field]: value,
                      },
                    }))
                  }
                  onAddResult={handleAddResult}
                />
              ))}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleGenerateNextRound} className="form-button">
              Generate Next Round
            </button>
            <button onClick={handleGenerateSemifinals} className="form-button">
              Generate Semifinals
            </button>
            <button
              onClick={handleGenerateFinalsAndThirdPlace}
              className="form-button"
            >
              Generate Finals & 3rd Place
            </button>
          </div>
        </>
      );

    default:
      return <div>No matches available for this system</div>;
  }
};

export default RenderMatches;
