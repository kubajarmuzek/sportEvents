import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserProfile.css";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [upcomingOrganizedTournaments, setOrganizedUpcomingTournaments] =
    useState([]);
  const [pastOrganizedTournaments, setOrganizedPastTournaments] = useState([]);
  const userId = localStorage.getItem("id");

  const navigate = useNavigate();

  const fetchTournaments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}/participated-tournaments`
      );
      setUpcomingTournaments(response.data.upcoming);
      setPastTournaments(response.data.past);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("No tournaments found.");
        setUpcomingTournaments([]);
        setPastTournaments([]);
      } else {
        console.error("Error fetching tournaments:", error);
      }
    }
  };

  const fetchOrganizedTournaments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}/organized-tournaments`
      );
      setOrganizedUpcomingTournaments(response.data.upcoming);
      setOrganizedPastTournaments(response.data.past);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("No organized tournaments found.");
        setOrganizedUpcomingTournaments([]);
        setOrganizedPastTournaments([]);
      } else {
        console.error("Error fetching organized tournaments:", error);
      }
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/participants/pending-approvals/${userId}`
      );
      setPendingApprovals(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("No pending approvals found.");
        setPendingApprovals([]);
      } else {
        console.error("Error fetching pending approvals:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (participantId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/participants/${participantId}/approve`,
        { leaderId: userId }
      );
      setPendingApprovals((prev) =>
        prev.filter((participant) => participant.id !== participantId)
      );
    } catch (error) {
      console.error("Error approving participant:", error);
    }
  };

  const handleRejection = async (participantId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/participants/${participantId}/reject`,
        { leaderId: userId }
      );
      setPendingApprovals((prev) =>
        prev.filter((participant) => participant.id !== participantId)
      );
    } catch (error) {
      console.error("Error rejecting participant:", error);
    }
  };

  const handleSignOut = async (tournamentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/users/${userId}/${tournamentId}/signout`
      );
    } catch (error) {
      console.error("Error signing out from tournament:", error);
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/tournaments/${tournamentId}/delete`
        );
        setOrganizedUpcomingTournaments((prev) =>
          prev.filter((tournament) => tournament.id !== tournamentId)
        );
        setOrganizedPastTournaments((prev) =>
          prev.filter((tournament) => tournament.id !== tournamentId)
        );
        alert("Tournament deleted successfully");
      } catch (error) {
        console.error("Error deleting tournament:", error);
        alert("Failed to delete tournament");
      }
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchPendingApprovals();
    fetchOrganizedTournaments();
  }, []);

  if (loading) {
    return <div>Loading pending approvals...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-requests">
        <h2 className="section-headers">Pending Approvals</h2>
        {pendingApprovals.length === 0 ? (
          <p>No pending approvals</p>
        ) : (
          <ul className="approval-list">
            {pendingApprovals.map((participant) => (
              <li key={participant.id} className="approval-item">
                <span>
                  <strong>{participant.participantName}</strong> requested to
                  join <strong>{participant.tournamentName}</strong>
                </span>
                <div className="approval-actions">
                  <button
                    className="approve-button"
                    onClick={() => handleApproval(participant.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleRejection(participant.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="profile-tournaments">
        <h2 className="section-headers">Upcoming Tournaments</h2>
        {upcomingTournaments.length === 0 ? (
          <p>No upcoming tournaments</p>
        ) : (
          <ul className="tournament-list">
            {upcomingTournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <strong>{tournament.name}</strong>
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()}
                </span>
                <button
                  className="signout-button"
                  onClick={() => handleSignOut(tournament.id)}
                >
                  Sign Out
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="profile-tournaments">
        <h2 className="section-headers">Past Tournaments</h2>
        {pastTournaments.length === 0 ? (
          <p className="tournament-item">No past tournaments</p>
        ) : (
          <ul className="tournament-list">
            {pastTournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <strong>{tournament.name}</strong>
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="profile-tournaments">
        <h2 className="section-headers">Upcoming Organized Tournaments</h2>
        {upcomingOrganizedTournaments.length === 0 ? (
          <p>No upcoming tournaments</p>
        ) : (
          <ul className="tournament-list">
            {upcomingOrganizedTournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <strong>{tournament.name}</strong>
                
                <div className="actions">
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteTournament(tournament.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="organizer-button"
                    onClick={() =>
                      navigate(`/organizer-panel/${tournament.id}`)
                    }
                  >
                    Organizer Panel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="profile-tournaments">
        <h2 className="section-headers">Past Organized Tournaments</h2>
        {pastOrganizedTournaments.length === 0 ? (
          <p className="tournament-item">No past tournaments</p>
        ) : (
          <ul className="tournament-list">
            {pastOrganizedTournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <strong>{tournament.name}</strong>
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
