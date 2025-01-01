import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("id");

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/participants/pending-approvals/${userId}`);
      console.log(response)
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

  useEffect(() => {
    fetchPendingApprovals();
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
    </div>
  );
};

export default UserProfile;
