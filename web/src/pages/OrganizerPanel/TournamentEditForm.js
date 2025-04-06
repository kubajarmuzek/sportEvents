import React from "react";
import { FaArrowLeft } from "react-icons/fa";

const TournamentEditForm = ({
  tournament,
  suggestions,
  showSports,
  sportsList,
  onGoBack,
  onChange,
  onLocationChange,
  onLocationSelect,
  onSportSelect,
  onToggleSports,
  onSubmit,
}) => {
  return (
    <div className="edit-form-container">
      <button onClick={onGoBack} className="go-back-button" title="Go Back">
        <FaArrowLeft size={40} />
      </button>

      <h2 className="form-header">Edit Tournament</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            value={tournament.name || ""}
            onChange={onChange}
          />
        </div>

        <div>
          <label>Start Date</label>
          <input
            className="form-input"
            type="date"
            name="startDate"
            value={tournament.startDate || ""}
            onChange={onChange}
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
              onChange={onLocationChange}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="suggestion-item"
                    onClick={() => onLocationSelect(item)}
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
            onChange={onChange}
          />
        </div>

        <div className="sport-container">
          <label>Sport</label>
          <input
            className="form-input"
            type="text"
            name="sport"
            value={tournament.sport || ""}
            onClick={onToggleSports}
            readOnly
          />
          {showSports && (
            <ul className="sport-list">
              {sportsList.map((item, index) => (
                <li
                  key={index}
                  className="sport-item"
                  onClick={() => onSportSelect(item)}
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
            onChange={onChange}
          />
        </div>

        <div>
          <label>Team Size</label>
          <input
            className="form-input"
            type="number"
            name="teamSize"
            value={tournament.teamSize || ""}
            onChange={onChange}
          />
        </div>

        <div>
          <label>Bracket Type</label>
          <select
            className="form-input"
            name="tournamentSystem"
            value={tournament.tournamentSystem || ""}
            onChange={onChange}
          >
            <option value="">Select Bracket Type</option>
            <option value="cup">cup</option>
            <option value="round-robin">round-robin</option>
            <option value="group and cup">group and cup</option>
            <option value="double elimination system">
              double elimination system
            </option>
          </select>
        </div>

        <button className="form-button" type="submit">
          Update Tournament
        </button>
      </form>
    </div>
  );
};

export default TournamentEditForm;
