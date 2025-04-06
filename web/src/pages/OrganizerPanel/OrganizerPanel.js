import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./OrganizerPanel.css";
import { FaArrowLeft } from "react-icons/fa";
import TournamentEditForm from "./TournamentEditForm";
import RenderMatches from "./RenderMatches";

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
      <TournamentEditForm
        tournament={tournament}
        suggestions={suggestions}
        showSports={showSports}
        sportsList={sportsList}
        onGoBack={handleGoBack}
        onChange={handleChange}
        onLocationChange={handleLocationChange}
        onLocationSelect={handleLocationSelect}
        onSportSelect={handleSportSelect}
        onToggleSports={() => setShowSports(!showSports)}
        onSubmit={handleSubmit}
      />
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
          ) : (
            <RenderMatches
              matches={matches}
              tournament={tournament}
              scoreInputs={scoreInputs}
              setScoreInputs={setScoreInputs}
              handleAddResult={handleAddResult}
              handleGenerateFirstKnockoutRound={
                handleGenerateFirstKnockoutRound
              }
              handleGenerateNextRound={handleStartNextRound}
              handleGenerateSemifinals={handleGenerateSemifinals}
              handleGenerateFinalsAndThirdPlace={
                handleGenerateFinalsAndThirdPlace
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerPanel;
