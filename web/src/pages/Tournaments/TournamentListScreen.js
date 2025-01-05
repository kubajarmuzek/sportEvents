import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TournamentListScreen.css";
import TournamentDetails from "../TournamentDetails/TournamentDetails";

const TournamentListScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tournaments");
      setTournaments(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (tournamentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tournaments/${tournamentId}/teams`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      alert("Failed to fetch teams");
      return [];
    }
  };

  const handleViewDetails = async (tournament) => {
    setSelectedTournament(tournament);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTournament(null);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  if (loading) return <div className="loading">Loading tournaments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="list-container">
      <h2 className="list-header">Available Tournaments</h2>
      {tournaments.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Sport</th>
              <th>Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament.id}>
                <td>{tournament.name}</td>
                <td>{tournament.sport}</td>
                <td>{new Date(tournament.startDate).toLocaleDateString()}</td>
                <td>{tournament.location}</td>
                <td>
                  <button
                    className="view-details-button"
                    onClick={() => handleViewDetails(tournament)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No tournaments available</div>
      )}

      {detailsModalVisible && selectedTournament && (
        <TournamentDetails
          selectedTournament={selectedTournament}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
};

export default TournamentListScreen;