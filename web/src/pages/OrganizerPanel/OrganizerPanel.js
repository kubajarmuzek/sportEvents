import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./OrganizerPanel.css";
import { FaArrowLeft } from "react-icons/fa";

const OrganizerPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [showSports, setShowSports] = useState(false);
  const [sportsList, setSportsList] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tournaments/`
        );
        const userTournaments = response.data.filter(
          (tournament) => tournament.id == id
        );
        if (userTournaments.length > 0) {
          const formattedStartDate = new Date(userTournaments[0].startDate)
            .toISOString()
            .split("T")[0];
          setTournament({
            ...userTournaments[0],
            startDate: formattedStartDate,
          });
        }
      } catch (err) {
        setError("Error fetching tournament data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sports");
        setSportsList(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTournament((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
  
    try {
      await axios.patch(
        `http://localhost:5000/api/tournaments/${id}/edit`, // Endpoint
        tournament // Send updated tournament data in request body
      );
      alert("Tournament updated successfully");
    } catch (error) {
      console.error("Error updating tournament:", error);
      alert("Failed to update tournament");
    }
  };
  

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setTournament({ ...tournament, location: query });

    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
          {
            params: {
              access_token:
                "pk.eyJ1IjoiamFrdWJqIiwiYSI6ImNtMjFsajY0YjBzeDkyaXNjbHh2MzVhbGgifQ.FKQ4ylPaSfQ8s1G1_Hh75g",
              autocomplete: true,
              limit: 5,
            },
          }
        );
        setSuggestions(response.data.features);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (item) => {
    setTournament({ ...tournament, location: item.place_name });
    setSuggestions([]);
  };

  const handleSportSelect = (item) => {
    setTournament({
      ...tournament,
      sport: item.sport,
      maxTeams: item.suggestedTeams.toString(),
      teamSize: item.teamSize.toString(),
    });
    setShowSports(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <div>Loading tournament data...</div>;
  if (error) return <div>{error}</div>;
  if (!tournament) return <div>No tournament data found</div>;

  return (
    <div className="form-container">
      <button onClick={handleGoBack} className="go-back-button" title="Go Back">
        <FaArrowLeft size={40} />
      </button>
      <h2 className="form-header">Edit Tournament</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            value={tournament.name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Start Date</label>
          <input
            className="form-input"
            type="date"
            name="startDate"
            value={tournament.startDate || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Location</label>
          <div className="location-container">
            <input
              className="form-input"
              type="text"
              name="location"
              value={tournament.location || ""}
              onChange={handleLocationChange}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="suggestion-item"
                    onClick={() => handleLocationSelect(item)}
                  >
                    {item.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label>Description</label>
          <textarea
            className="form-input"
            name="description"
            value={tournament.description || ""}
            onChange={handleChange}
          />
        </div>
        <div className="sport-container">
          <label>Sport</label>
          <input
            className="form-input"
            type="text"
            name="sport"
            value={tournament.sport || ""}
            onChange={handleChange}
            onClick={() => setShowSports(!showSports)}
          />
          {showSports && (
            <ul className="sport-list">
              {sportsList.map((item, index) => (
                <li
                  key={index}
                  className="sport-item"
                  onClick={() => handleSportSelect(item)}
                >
                  {item.sport}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label>Max Teams</label>
          <input
            className="form-input"
            type="number"
            name="maxTeams"
            value={tournament.maxTeams || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Team Size</label>
          <input
            className="form-input"
            type="number"
            name="teamSize"
            value={tournament.teamSize || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bracket Type</label>
          <select
            className="form-input"
            name="bracketType"
            value={tournament.bracketType || ""}
            onChange={handleChange}
          >
            <option value="">Select Bracket Type</option>
            <option value="knockout">Knockout</option>
            <option value="roundRobin">Round Robin</option>
            <option value="groupWithKnockout">Group with Knockout</option>
            <option value="brazilian">Brazilian</option>
          </select>
        </div>

        <button className="form-button" type="submit">
          Update Tournament
        </button>
      </form>
    </div>
  );
};

export default OrganizerPanel;
