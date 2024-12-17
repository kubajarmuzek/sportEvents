import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TournamentFormScreen.css";

const TournamentFormScreen = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    sport: "",
    maxTeams: "",
    teamSize: "",
    startDate: "",
    organizerId: "",
  });
  const [sportsList, setSportsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSports, setShowSports] = useState(false);

  useEffect(() => {
    const organizerId = localStorage.getItem("id");
    if (organizerId) {
      setFormData((prevData) => ({
        ...prevData,
        organizerId: organizerId,
      }));
    }
    console.log(organizerId)
  }, []);

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
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setFormData({ ...formData, location: query });

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
    setFormData({ ...formData, location: item.place_name });
    setSuggestions([]);
  };

  const handleSportSelect = (item) => {
    setFormData({
      ...formData,
      sport: item.sport,
      maxTeams: item.suggestedTeams.toString(),
      teamSize: item.teamSize.toString(),
    });
    setShowSports(false);
  };

  const handleSubmit = async () => {
    if (Object.values(formData).some((field) => !field)) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/tournaments", formData);
      alert("Tournament created successfully!");
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Error creating tournament.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-header">Create a Tournament</h2>
      <form className="form">
        <input
          type="text"
          name="name"
          placeholder="Tournament Name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="form-input"
        />
        <div className="location-container">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleLocationChange}
            className="form-input"
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
        <div className="sport-container">
          <input
            type="text"
            name="sport"
            placeholder="Sport"
            value={formData.sport}
            onClick={() => setShowSports(!showSports)}
            onChange={handleChange}
            className="form-input"
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
        <input
          type="number"
          name="maxTeams"
          placeholder="Max Teams"
          value={formData.maxTeams}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          name="teamSize"
          placeholder="Team Size"
          value={formData.teamSize}
          onChange={handleChange}
          className="form-input"
        />
        <button type="button" onClick={handleSubmit} className="form-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default TournamentFormScreen;
