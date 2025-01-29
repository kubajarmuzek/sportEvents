import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import "./GameResults.css";

const GameResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentType, setTournamentType] = useState("");
  const [tableData, setTableData] = useState([]);

  const fetchTournamentType = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
      setTournamentType(response.data.tournamentSystem);
    } catch (error) {
      console.error("Error fetching tournament type:", error);
      alert("Failed to fetch tournament type.");
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/${id}/teams`
      );
      const teamData = response.data;

      const teamNameMap = {};
      teamData.forEach((team) => {
        teamNameMap[team.id] = team.name;
      });

      setTeams(teamNameMap);
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Failed to fetch teams.");
    }
  };

  const fetchTableData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tournaments/${id}/table`);
      setTableData(response.data);
      console.log(tableData)
    } catch (error) {
      console.error("Error fetching table data:", error);
      alert("Failed to fetch table data.");
    }
  };

  const fetchMatchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/${id}/downloadingMatches`
      );
      setMatches(response.data);
    } catch (err) {
      console.error("Error fetching match results:", err);
      setError("Failed to fetch match results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTournamentType();
      fetchTeams();
      fetchMatchResults();
  
      if (tournamentType === "round-robin") {
        fetchTableData();
      }
    };
  
    fetchData();
  }, [id, tournamentType]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <div>Loading results...</div>;
  if (error) return <div>{error}</div>;
  if (!matches.length) return <div>No results available yet.</div>;

  return (
    <div className="results-container">
      <button onClick={handleGoBack} className="go-back-button" title="Go Back">
        <FaArrowLeft size={30} />
      </button>
      <h2>Game Results</h2>
      <ul className="results-list">
        {matches.filter(
          (match) =>
            teams[match.homeTeamID].toLowerCase() !== "bye" &&
            teams[match.awayTeamID].toLowerCase() !== "bye" &&
            teams[match.homeTeamID].toLowerCase() !== "pause" &&
            teams[match.awayTeamID].toLowerCase() !== "pause"
        ).map((match) => (
          <li key={match.id} className="result-item">
            <div>
              <strong>{teams[match.homeTeamID] || "Unknown Team"}</strong> vs{" "}
              <strong>{teams[match.homeTeamID] || "Unknown Team"}</strong>
            </div>
            <div>
              {match.homeScore === null || match.awayScore === null ? (
                <span className="upcoming-match">Upcoming Match</span>
              ) : (
                <span>
                  {match.homeScore} : {match.awayScore}
                </span>
              )}
            </div>
            {match.round && (
              <div>
                <small>Round: {parseInt(match.round)+1}</small>
              </div>
            )}
          </li>
        ))}
      </ul>

      {tournamentType === "round-robin" && tableData.length > 0 && (
        <div className="table-container">
          <h2>Standings</h2>
          <table className="standings-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Played</th>
                <th>Won</th>
                <th>Drawn</th>
                <th>Lost</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {tableData.filter((team) => 
                team.teamName.toLowerCase() !== "pause" && team.teamName.toLowerCase() !== "bye"
              ).map((team, index) => (
                <tr key={index}>
                  <td>{team.teamName}</td>
                  <td>{team.played}</td>
                  <td>{team.won}</td>
                  <td>{team.drawn}</td>
                  <td>{team.lost}</td>
                  <td>{team.goalsFor}</td>
                  <td>{team.goalsAgainst}</td>
                  <td>{team.goalDifference}</td>
                  <td>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GameResults;
