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
    fetchTeams();
    fetchMatchResults();
  }, [id]);

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
        {matches.map((match) => (
          <li key={match.id} className="result-item">
            <div>
              <strong>{teams[match.homeTeamID] || "Unknown Team"}</strong> vs{" "}
              <strong>{teams[match.awayTeamID] || "Unknown Team"}</strong>
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
                <small>Round: {match.round}</small>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameResults;
