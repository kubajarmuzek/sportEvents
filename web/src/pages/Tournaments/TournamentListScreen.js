import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TournamentListScreen.css";
import TournamentDetails from "../TournamentDetails/TournamentDetails";

const TournamentListScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    sport: "",
    date: "",
    location: "",
  });
  const filterRef = useRef({});
  const popupRef = useRef(null);

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

  const handleFilterClick = (column, event) => {
    event.stopPropagation();
    setActiveFilter(activeFilter === column ? null : column);
  };

  const handleClickOutside = (event) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      !Object.values(filterRef.current).some(ref => ref && ref.contains(event.target))
    ) {
      setActiveFilter(null);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const applyFilter = () => {
    setActiveFilter(null);
  };

  const resetFilter = (column) => {
    setFilters((prevFilters) => ({ ...prevFilters, [column]: "" }));
    setActiveFilter(null);
  };

  const handleViewDetails = async (tournament) => {
    setSelectedTournament(tournament);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTournament(null);
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    return (
      tournament.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      tournament.sport.toLowerCase().includes(filters.sport.toLowerCase()) &&
      new Date(tournament.startDate).toLocaleDateString().includes(filters.date) &&
      tournament.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  });

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
              {['name', 'sport', 'date', 'location'].map((column) => (
                <th key={column} className="filter-header">
                  <span
                    className="filter-icon"
                    ref={(el) => (filterRef.current[column] = el)}
                    style={{ cursor: 'pointer', marginLeft: '5px', position: 'relative' }}
                  >
                    <span
                      onClick={(e) => handleFilterClick(column, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      🔍
                    </span>
                    {activeFilter === column && (
                      <div
                        ref={popupRef}
                        className="filter-popup"
                        style={{
                          position: 'absolute',
                          top: '20px',
                          left: '0',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          padding: '10px',
                          zIndex: 1000,
                          borderRadius: '4px'
                        }}
                      >
                        <input
                          type="text"
                          name={column}
                          value={filters[column]}
                          onChange={handleFilterChange}
                          placeholder={`Filter by ${column}`}
                        />
                        <div className="filter-buttons">
                          <button onClick={applyFilter}>Apply</button>
                          <button onClick={() => resetFilter(column)}>Reset</button>
                        </div>
                      </div>
                    )}
                  </span>
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTournaments.map((tournament) => (
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
