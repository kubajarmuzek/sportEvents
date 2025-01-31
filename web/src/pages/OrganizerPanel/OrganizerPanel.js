import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./OrganizerPanel.css";
import { FaArrowLeft } from "react-icons/fa";

const OrganizerPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [showSports, setShowSports] = useState(false);
  const [sportsList, setSportsList] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [scoreInputs, setScoreInputs] = useState({});
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const fetchTournament = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/`
      );
      const userTournaments = response.data.filter(
        (tournament) => tournament.id == id
      );
      if (userTournaments.length > 0) {
        const formattedStartDate = new Date(userTournaments[0].startDate)
          .toISOString()
          .split("T")[0];
        setTournament({
          ...userTournaments[0],
          startDate: formattedStartDate,
        });
      }
    } catch (err) {
      setError("Error fetching tournament data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setMatchesLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/${id}/downloadingMatches`
      );

      const matchData = response.data;

      const teamIds = [
        ...new Set(
          matchData.flatMap((match) => [match.homeTeamID, match.awayTeamID])
        ),
      ];

      const teamNameMap = await fetchTeamNames(teamIds);

      const matchesWithNames = matchData.map((match) => ({
        ...match,
        homeTeamName: teamNameMap[match.homeTeamID] || "Unknown",
        awayTeamName: teamNameMap[match.awayTeamID] || "Unknown",
      }));

      setMatches(matchesWithNames);
    } catch (error) {
      console.error("Error fetching matches:", error);
      alert("Failed to fetch matches.");
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
    fetchMatches();
    fetchTeams();
  }, [id]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sports");
        setSportsList(response.data);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTournament((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `http://localhost:5000/api/tournaments/${id}/edit`,
        tournament
      );
      alert("Tournament updated successfully");
    } catch (error) {
      console.error("Error updating tournament:", error);
      alert("Failed to update tournament");
    }
  };

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setTournament({ ...tournament, location: query });

    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
          {
            params: {
              access_token:
                "pk.eyJ1IjoiamFrdWJqIiwiYSI6ImNtMjFsajY0YjBzeDkyaXNjbHh2MzVhbGgifQ.FKQ4ylPaSfQ8s1G1_Hh75g",
              autocomplete: true,
              limit: 5,
            },
          }
        );
        setSuggestions(response.data.features);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (item) => {
    setTournament({ ...tournament, location: item.place_name });
    setSuggestions([]);
  };

  const handleSportSelect = (item) => {
    setTournament({
      ...tournament,
      sport: item.sport,
      maxTeams: item.suggestedTeams.toString(),
      teamSize: item.teamSize.toString(),
    });
    setShowSports(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleStartTournament = async () => {
    try {
      fetchTournament();
      let endpoint = "";

      switch (tournament.tournamentSystem) {
        case "cup":
          endpoint = `http://localhost:5000/api/tournaments/${id}/cup/generate-first-round`;
          break;
        case "round-robin":
          endpoint = `http://localhost:5000/api/tournaments/${id}/round-robin/generate`;
          break;
        case "group and cup":
          endpoint = `http://localhost:5000/api/tournaments/${id}/group/generate-groups`;
          break;
        case "double elimination system":
          endpoint = `http://localhost:5000/api/tournaments/${id}/doubleEliminationSystem/startTournament`;
          break;
        default:
          alert("Please select a valid tournament system.");
          return;
      }

      const response = await axios.post(endpoint);
      alert(response.data.message);
      fetchMatches();
    } catch (error) {
      console.error("Error starting tournament:", error);
      alert(error.response?.data?.message || "Failed to start the tournament.");
    }
  };

  const handleGenerateNextRound = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tournaments/${id}/doubleEliminationSystem/generateNextRound`
      );
      alert(response.data.message || "Next round generated successfully!");
      fetchMatches();
    } catch (error) {
      console.error("Error generating next round:", error);
      alert(error.response?.data?.message || "Failed to generate next round.");
    }
  };

  const handleGenerateSemifinals = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tournaments/${id}/doubleEliminationSystem/generateSemifinals`
      );
      alert(response.data.message || "Semifinals generated successfully!");
      fetchMatches();
    } catch (error) {
      console.error("Error generating semifinals:", error);
      alert(error.response?.data?.message || "Failed to generate semifinals.");
    }
  };

  const handleGenerateFinalsAndThirdPlace = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tournaments/${id}/doubleEliminationSystem/generateFinalsAndThirdPlace`
      );
      alert(
        response.data.message ||
          "Finals and 3rd place match generated successfully!"
      );
      fetchMatches();
    } catch (error) {
      console.error("Error generating finals:", error);
      alert(error.response?.data?.message || "Failed to generate finals.");
    }
  };

  const handleAddResult = async (matchId, homeScore, awayScore) => {
    try {
      const resultData = {
        homeScore: parseInt(homeScore, 10),
        awayScore: parseInt(awayScore, 10),
      };

      await axios.patch(
        `http://localhost:5000/api/match/${matchId}/addResult`,
        resultData
      );

      alert("Match result added successfully!");
      fetchMatches();
    } catch (error) {
      console.error("Error adding match result:", error);
      alert("Failed to add match result.");
    }
  };

  const handleScoreChange = (matchId, field, value) => {
    setScoreInputs((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const isLatestRoundFinished = () => {
    const latestRound = Math.max(...matches.map((match) => match.round));
    const latestRoundMatches = matches.filter(
      (match) => match.round === latestRound
    );
    return latestRoundMatches.every(
      (match) => match.homeScore !== null && match.awayScore !== null
    );
  };

  const handleStartNextRound = async () => {
    if (!isLatestRoundFinished()) {
      alert("Not all matches in the current round are finished.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/tournaments/${id}/cup/generate-next-round`
      );
      alert(response.data.message || "Next round started successfully!");
      fetchMatches();
    } catch (error) {
      console.error("Error starting next round:", error);
      alert("Failed to start the next round.");
    }
  };

  const fetchTeamNames = async (teamIds) => {
    try {
      const promises = teamIds.map((id) =>
        axios.get(`http://localhost:5000/api/teams/${id}/name`)
      );
      const responses = await Promise.all(promises);

      const teamNameMap = {};
      responses.forEach((response, index) => {
        teamNameMap[teamIds[index]] = response.data.name;
      });
      return teamNameMap;
    } catch (error) {
      console.error("Error fetching team names:", error);
      return {};
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/${id}/teams`
      );
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Failed to fetch teams.");
    }
  };

  const fetchParticipants = async (teamId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/teams/${teamId}/participants`
      );
      setParticipants(response.data);
      setSelectedTeamId(teamId);
    } catch (error) {
      console.error("Error fetching participants:", error);
      alert("Failed to fetch participants.");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/teams/${teamId}/delete`);
      alert("Team deleted successfully.");
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team.");
    }
  };

  const handleGenerateFirstKnockoutRound = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tournaments/${id}/group/generate-first-round`
      );
      alert(
        response.data.message || "First knockout round generated successfully!"
      );
      fetchMatches(); // Refresh match list
    } catch (error) {
      console.error("Error generating first knockout round:", error);
      alert(
        error.response?.data?.message ||
          "Failed to generate first knockout round."
      );
    }
  };

  const handleDeleteParticipant = async (participantId) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/participants/${participantId}`
      );
      alert("Participant deleted successfully.");
      fetchParticipants(selectedTeamId);
    } catch (error) {
      console.error("Error deleting participant:", error);
      alert("Failed to delete participant.");
    }
  };

  if (loading) return <div>Loading tournament data...</div>;
  if (error) return <div>{error}</div>;
  if (!tournament) return <div>No tournament data found</div>;

  return (
    <div className="container-organizer">
      <div className="edit-form-container">
        <button
          onClick={handleGoBack}
          className="go-back-button"
          title="Go Back"
        >
          <FaArrowLeft size={40} />
        </button>
        <h2 className="form-header">Edit Tournament</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              value={tournament.name || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Start Date</label>
            <input
              className="form-input"
              type="date"
              name="startDate"
              value={tournament.startDate || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Location</label>
            <div className="location-container">
              <input
                className="form-input"
                type="text"
                name="location"
                value={tournament.location || ""}
                onChange={handleLocationChange}
              />
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className="suggestion-item"
                      onClick={() => handleLocationSelect(item)}
                    >
                      {item.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <label>Description</label>
            <textarea
              className="form-input"
              name="description"
              value={tournament.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="sport-container">
            <label>Sport</label>
            <input
              className="form-input"
              type="text"
              name="sport"
              value={tournament.sport || ""}
              onChange={handleChange}
              onClick={() => setShowSports(!showSports)}
            />
            {showSports && (
              <ul className="sport-list">
                {sportsList.map((item, index) => (
                  <li
                    key={index}
                    className="sport-item"
                    onClick={() => handleSportSelect(item)}
                  >
                    {item.sport}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label>Max Teams</label>
            <input
              className="form-input"
              type="number"
              name="maxTeams"
              value={tournament.maxTeams || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Team Size</label>
            <input
              className="form-input"
              type="number"
              name="teamSize"
              value={tournament.teamSize || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Bracket Type</label>
            <select
              className="form-input"
              name="tournamentSystem"
              value={tournament.tournamentSystem || ""}
              onChange={handleChange}
            >
              <option value="">Select Bracket Type</option>
              <option value="cup">cup</option>
              <option value="round-robin">round-robin</option>
              <option value="group and cup">group and cup</option>
              <option value="double elimination system">
                double elimination system
              </option>
            </select>
          </div>

          <button className="form-button" type="submit">
            Update Tournament
          </button>
        </form>
      </div>

      <div className="teams-section">
        <h2>Teams</h2>
        {teams.length > 0 ? (
          <ul className="teams-list">
            {teams
              .filter(
                (team) =>
                  team.name.toLowerCase() != "pause" &&
                  team.name.toLowerCase() != "bye"
              )
              .map((team) => (
                <li key={team.id} className="team-item">
                  <div>
                    <strong>{team.name}</strong>
                  </div>
                  <button onClick={() => handleDeleteTeam(team.id)}>
                    Delete Team
                  </button>
                  {
                    //<button onClick={() => fetchParticipants(team.id)}>View Participants</button>
                  }
                </li>
              ))}
          </ul>
        ) : (
          <div>No teams found for this tournament.</div>
        )}

        {selectedTeamId && participants.length > 0 && (
          <div className="participants-section">
            <h3>
              Participants for Team{" "}
              {teams.find((t) => t.id === selectedTeamId)?.name}
            </h3>
            <ul className="participants-list">
              {participants.map((participant) => (
                <li key={participant.id} className="participant-item">
                  <div>
                    <strong>{participant.nickname}</strong>
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(participant.id)}
                  >
                    Delete Participant
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="start-tournament">
        {matches.length === 0 && (
          <button onClick={handleStartTournament} className="form-button">
            Start Tournament
          </button>
        )}
        <div className="matches-section">
          <h2>Matches</h2>
          {matchesLoading ? (
            <div>Loading matches...</div>
          ) : matches.length > 0 ? (
            <ul className="matches-list">
              {tournament.tournamentSystem == "group and cup" ? (
                <div className="matches-section">
                  <div className="group-stage">
                    <h2>Group Stage Matches</h2>
                    {matches.filter((match) => match.group !== null).length >
                    0 ? (
                      matches
                        .filter((match) => match.group !== null)
                        .map((match) => (
                          <li key={match.id} className="match-item">
                            <div>
                              <strong>Match:</strong> {match.homeTeamName} vs{" "}
                              {match.awayTeamName}
                            </div>
                            <div>
                              <strong>Group:</strong> {match.group}
                            </div>
                            {match.homeScore === null &&
                            match.awayScore === null ? (
                              <div className="score-inputs">
                                <input
                                  type="number"
                                  placeholder="Home Score"
                                  value={scoreInputs[match.id]?.homeScore || ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      match.id,
                                      "homeScore",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Away Score"
                                  value={scoreInputs[match.id]?.awayScore || ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      match.id,
                                      "awayScore",
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  onClick={() =>
                                    handleAddResult(
                                      match.id,
                                      scoreInputs[match.id]?.homeScore,
                                      scoreInputs[match.id]?.awayScore
                                    )
                                  }
                                >
                                  Add Result
                                </button>
                              </div>
                            ) : (
                              <div>
                                <strong>Score:</strong> {match.homeScore} :{" "}
                                {match.awayScore}
                              </div>
                            )}
                          </li>
                        ))
                    ) : (
                      <div>No group matches found.</div>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateFirstKnockoutRound}
                    className="form-button"
                  >
                    Generate First Round of Knockout Stage
                  </button>{" "}

                  <button
                    onClick={handleStartNextRound}
                    className="form-button"
                  >
                    Generate Next Round of Knockout Stage
                  </button>{" "}
                </div>
              ) : (
                <div></div>
              )}

              {tournament.tournamentSystem == "double elimination system" ? (
                <div className="matches-section">
                  {matchesLoading ? (
                    <div>Loading matches...</div>
                  ) : matches.length > 0 ? (
                    <>
                      <h3>Upper Bracket</h3>
                      <ul className="matches-list">
                        {matches
                          .filter((match) => match.bracket === "upper")
                          .map((match) => (
                            <li key={match.id} className="match-item">
                              <div>
                                <strong>Match:</strong> {match.homeTeamName} vs{" "}
                                {match.awayTeamName}
                              </div>
                              <div>
                                <strong>Round:</strong> {match.round}
                              </div>
                              {match.homeScore === null &&
                              match.awayScore === null ? (
                                <div className="score-inputs">
                                  <input
                                    type="number"
                                    placeholder="Home Score"
                                    value={
                                      scoreInputs[match.id]?.homeScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "homeScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    placeholder="Away Score"
                                    value={
                                      scoreInputs[match.id]?.awayScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "awayScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    onClick={() =>
                                      handleAddResult(
                                        match.id,
                                        scoreInputs[match.id]?.homeScore,
                                        scoreInputs[match.id]?.awayScore
                                      )
                                    }
                                  >
                                    Add Result
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <strong>Score:</strong> {match.homeScore} :{" "}
                                  {match.awayScore}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>

                      <h3>Lower Bracket</h3>
                      <ul className="matches-list">
                        {matches
                          .filter((match) => match.bracket === "lower")
                          .map((match) => (
                            <li key={match.id} className="match-item">
                              <div>
                                <strong>Match:</strong> {match.homeTeamName} vs{" "}
                                {match.awayTeamName}
                              </div>
                              <div>
                                <strong>Round:</strong> {match.round}
                              </div>
                              {match.homeScore === null &&
                              match.awayScore === null ? (
                                <div className="score-inputs">
                                  <input
                                    type="number"
                                    placeholder="Home Score"
                                    value={
                                      scoreInputs[match.id]?.homeScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "homeScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    placeholder="Away Score"
                                    value={
                                      scoreInputs[match.id]?.awayScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "awayScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    onClick={() =>
                                      handleAddResult(
                                        match.id,
                                        scoreInputs[match.id]?.homeScore,
                                        scoreInputs[match.id]?.awayScore
                                      )
                                    }
                                  >
                                    Add Result
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <strong>Score:</strong> {match.homeScore} :{" "}
                                  {match.awayScore}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>

                      <h3>Semifinals</h3>
                      <ul className="matches-list">
                        {matches
                          .filter(
                            (match) =>
                              match.round === "semi" &&
                              match.bracket === "final"
                          )
                          .map((match) => (
                            <li key={match.id} className="match-item">
                              <div>
                                <strong>Match:</strong> {match.homeTeamName} vs{" "}
                                {match.awayTeamName}
                              </div>
                              <div>
                                <strong>Round:</strong> {match.round}
                              </div>
                              {match.homeScore === null &&
                              match.awayScore === null ? (
                                <div className="score-inputs">
                                  <input
                                    type="number"
                                    placeholder="Home Score"
                                    value={
                                      scoreInputs[match.id]?.homeScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "homeScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    placeholder="Away Score"
                                    value={
                                      scoreInputs[match.id]?.awayScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "awayScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    onClick={() =>
                                      handleAddResult(
                                        match.id,
                                        scoreInputs[match.id]?.homeScore,
                                        scoreInputs[match.id]?.awayScore
                                      )
                                    }
                                  >
                                    Add Result
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <strong>Score:</strong> {match.homeScore} :{" "}
                                  {match.awayScore}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>

                      <h3>Final & 3rd Place</h3>
                      <ul className="matches-list">
                        {matches
                          .filter((match) =>
                            ["final", "third_place"].includes(match.round)
                          )
                          .map((match) => (
                            <li key={match.id} className="match-item">
                              <div>
                                <strong>Match:</strong> {match.homeTeamName} vs{" "}
                                {match.awayTeamName}
                              </div>
                              <div>
                                <strong>Round:</strong>{" "}
                                {match.round.replace("_", " ")}{" "}
                              </div>
                              {match.homeScore === null &&
                              match.awayScore === null ? (
                                <div className="score-inputs">
                                  <input
                                    type="number"
                                    placeholder="Home Score"
                                    value={
                                      scoreInputs[match.id]?.homeScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "homeScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    placeholder="Away Score"
                                    value={
                                      scoreInputs[match.id]?.awayScore || ""
                                    }
                                    onChange={(e) =>
                                      handleScoreChange(
                                        match.id,
                                        "awayScore",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    onClick={() =>
                                      handleAddResult(
                                        match.id,
                                        scoreInputs[match.id]?.homeScore,
                                        scoreInputs[match.id]?.awayScore
                                      )
                                    }
                                  >
                                    Add Result
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <strong>Score:</strong> {match.homeScore} :{" "}
                                  {match.awayScore}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <div>No matches found for this tournament.</div>
                  )}

                  <button
                    onClick={handleGenerateNextRound}
                    className="form-button"
                  >
                    Generate Next Round
                  </button>
                  <button
                    onClick={handleGenerateSemifinals}
                    className="form-button"
                  >
                    Generate Semifinals
                  </button>
                  <button
                    onClick={handleGenerateFinalsAndThirdPlace}
                    className="form-button"
                  >
                    Generate Finals & Third Place
                  </button>
                </div>
              ) : <div></div>}

              {tournament.tournamentSystem=="cup"?
              (
                matches
                  .filter(
                    (match) =>
                      match.homeTeamName.toLowerCase() !== "bye" &&
                      match.awayTeamName.toLowerCase() !== "bye" &&
                      match.homeTeamName.toLowerCase() !== "pause" &&
                      match.awayTeamName.toLowerCase() !== "pause"
                  )
                  .map((match) => (
                    <li key={match.id} className="match-item">
                      <div>
                        <strong>Match:</strong> {match.homeTeamName} vs{" "}
                        {match.awayTeamName}
                      </div>
                      <div>
                        <strong>Round:</strong> {match.round}
                      </div>
                      <div>
                        {match.homeScore === null &&
                        match.awayScore === null ? (
                          <div className="score-inputs">
                            <input
                              type="number"
                              placeholder="Home Score"
                              value={scoreInputs[match.id]?.homeScore || ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  match.id,
                                  "homeScore",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              placeholder="Away Score"
                              value={scoreInputs[match.id]?.awayScore || ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  match.id,
                                  "awayScore",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                handleAddResult(
                                  match.id,
                                  scoreInputs[match.id]?.homeScore,
                                  scoreInputs[match.id]?.awayScore
                                )
                              }
                            >
                              Add Result
                            </button>
                          </div>
                        ) : (
                          <div>
                            <strong>Score:</strong> {match.homeScore} :{" "}
                            {match.awayScore}
                          </div>
                        )}
                      </div>
                    </li>
                  ))
              ) : <div></div>  
            }
            </ul>
          ) : (
            <div>No matches found for this tournament.</div>
          )}

          {matches.length > 0 && tournament.tournamentSystem === "cup" && (
            <button onClick={handleStartNextRound} className="form-button">
              Start Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerPanel;
