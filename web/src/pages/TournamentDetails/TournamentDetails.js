import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TournamentDetails.css"

const TournamentDetails = ({
    selectedTournament,
    onClose,
    fetchTeams,
  }) => {
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [participants, setParticipants] = useState([]);
    const [viewingParticipantsForTeam, setViewingParticipantsForTeam] =
      useState(null);
  
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
  
    const handleViewParticipantsToggle = (teamId) => {
      if (viewingParticipantsForTeam === teamId) {
        setViewingParticipantsForTeam(null);
      } else {
        fetchParticipants(teamId);
        setViewingParticipantsForTeam(teamId);
      }
    };
  
    return (
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
  
          <button className="close-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default TournamentDetails;