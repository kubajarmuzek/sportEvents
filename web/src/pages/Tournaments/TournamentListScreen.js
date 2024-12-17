import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TournamentListScreen.css';

const TournamentListScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament.id}>
                <td>{tournament.name}</td>
                <td>{new Date(tournament.startDate).toLocaleDateString()}</td>
                <td>{tournament.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No tournaments available</div>
      )}
    </div>
  );
};

export default TournamentListScreen;
