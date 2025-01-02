import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [upcomingOrganizedTournaments, setOrganizedUpcomingTournaments] = useState([]);
  const [pastOrganizedTournaments, setOrganizedPastTournaments] = useState([]);
  const userId = localStorage.getItem("id");

  const fetchTournaments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/participated-tournaments`);
      setUpcomingTournaments(response.data.upcoming);
      setPastTournaments(response.data.past);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const fetchOrganizedTournaments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/organized-tournaments`);
      setOrganizedUpcomingTournaments(response.data.upcoming);
      setOrganizedPastTournaments(response.data.past);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/participants/pending-approvals/${userId}`);
      setPendingApprovals(response.data);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (participantId) => {
    try {
      await axios.put(`http://localhost:5000/api/participants/${participantId}/approve`, { leaderId: userId });
      setPendingApprovals((prev) => prev.filter((participant) => participant.id !== participantId));
    } catch (error) {
      console.error("Error approving participant:", error);
    }
  };

  const handleRejection = async (participantId) => {
    try {
      await axios.put(`http://localhost:5000/api/participants/${participantId}/reject`, { leaderId: userId });
      setPendingApprovals((prev) => prev.filter((participant) => participant.id !== participantId));
    } catch (error) {
      console.error("Error rejecting participant:", error);
    }
  };

  const handleSignOut = async (participantId) => {
    try {
      await axios.delete(`http://localhost:5000/api/participants/${participantId}/signout`);
      setUpcomingTournaments((prev) =>
        prev.filter((tournament) => tournament.id !== participantId)
      );
    } catch (error) {
      console.error("Error signing out from tournament:", error);
    }
  };

  useEffect(() => {
    fetchTournaments()
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
                    <strong>{participant.participantName}</strong> requested to join{" "}
                    <strong>{participant.tournamentName}</strong>
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
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "TBA"}
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
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "TBA"}
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
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "TBA"}
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
        <h2 className="section-headers">Past Organized Tournaments</h2>
        {pastOrganizedTournaments.length === 0 ? (
          <p className="tournament-item">No past tournaments</p>
        ) : (
          <ul className="tournament-list">
            {pastOrganizedTournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <strong>{tournament.name}</strong>
                <span>
                  {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                  {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "TBA"}
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
