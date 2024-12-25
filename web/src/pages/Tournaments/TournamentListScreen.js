import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TournamentListScreen.css";

const TournamentListScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [viewingParticipantsForTeam, setViewingParticipantsForTeam] =
    useState(null);

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
      setTeams(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch teams");
    }
  };

  const fetchParticipants = async (teamId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/teams/${teamId}/participants`
      );
      setParticipants(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch participants");
    }
  };

  const handleViewDetails = (tournament) => {
    setSelectedTournament(tournament);
    fetchTeams(tournament.id);
    setDetailsModalVisible(true);
  };

  const handleSignUpForTeam = async (teamId) => {
    try {
      const userId = localStorage.getItem("id");
      await axios.post("http://localhost:5000/api/tournaments/signup", {
        userId,
        tournamentId: selectedTournament.id,
        teamId,
      });
      alert("Signed up successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to sign up for the team");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName) {
      alert("Team name is required");
      return;
    }

    try {
      const userId = localStorage.getItem("id");
      await axios.post(
        `http://localhost:5000/api/tournaments/${selectedTournament.id}/teams`,
        {
          name: teamName,
          leaderId: userId,
        }
      );
      alert("Team created successfully!");
      setTeamName("");
      fetchTeams(selectedTournament.id);
    } catch (err) {
      console.error(err);
      alert("Failed to create the team");
    }
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTournament(null);
    setTeams([]);
    setParticipants([]);
    setViewingParticipantsForTeam(null);
  };

  const handleViewParticipantsToggle = (teamId) => {
    if (viewingParticipantsForTeam === teamId) {
      setViewingParticipantsForTeam(null);
    } else {
      fetchParticipants(teamId);
      setViewingParticipantsForTeam(teamId);
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
            <p>
              <strong>Name:</strong> {selectedTournament.name}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedTournament.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Location:</strong> {selectedTournament.location}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedTournament.description || "No description available"}
            </p>
            <p>
              <strong>Max Teams:</strong> {selectedTournament.maxTeams}
            </p>
            <p>
              <strong>Team Size:</strong> {selectedTournament.teamSize}
            </p>
            <hr />

            <h4>Teams</h4>
            {teams.length > 0 ? (
              <ul className="teams-list">
                {teams.map((team) => (
                  <div className="team" key={team.id}>
                    <li className="team-item">
                      <strong>{team.name}</strong>
                      <button
                        className="view-details-button"
                        onClick={() => handleViewParticipantsToggle(team.id)}
                      >
                        {viewingParticipantsForTeam === team.id
                          ? "Hide Participants"
                          : "View Participants"}
                      </button>
                      <button
                        className="view-details-button"
                        onClick={() => handleSignUpForTeam(team.id)}
                      >
                        Sign Up
                      </button>
                    </li>

                    {viewingParticipantsForTeam === team.id && (
                      <div>
                        {participants.length > 0 ? (
                          <div className="participants-list">
                            {participants.map((participant, index) => (
                              <p key={participant.user.id}>
                                {index + 1}. {participant.user.nickname}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p>No participants in this team</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </ul>
            ) : (
              <div className="no-participants-message">
                <p>No participants in this team</p>
              </div>
            )}

            <hr />

            <div className="create-team-section">
              <h4>Create a Team</h4>
              <input
                type="text"
                className="team-name-input"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <button
                className="view-details-button bigger"
                onClick={handleCreateTeam}
              >
                Create a Team
              </button>
            </div>

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
