import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TournamentListScreen.css';

const TournamentListScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tournaments');
      setTournaments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tournament) => {
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
              <th>Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament.id}>
                <td>{tournament.name}</td>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Tournament Details</h3>
            <p><strong>Name:</strong> {selectedTournament.name}</p>
            <p><strong>Date:</strong> {new Date(selectedTournament.startDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {selectedTournament.location}</p>
            <p><strong>Description:</strong> {selectedTournament.description || 'No description available'}</p>
            <p><strong>Max Teams:</strong> {selectedTournament.maxTeams}</p>
            <p><strong>Team Size:</strong> {selectedTournament.teamSize}</p>
            <button className="close-modal-button" onClick={closeDetailsModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentListScreen;
