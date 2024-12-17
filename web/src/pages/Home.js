import React, { useState, useContext } from 'react';
import { AuthContext } from "../context/AuthProvider";
import TournamentFormScreen from './Tournaments/TournamentFormScreen';
import TournamentListScreen from './Tournaments/TournamentListScreen';
import "./Home.css"

const Home = () => {
  const { logout } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(true);

  const toggleComponent = () => {
    setShowForm((prevShowForm) => !prevShowForm);
  };

  return (
    <div className="homepage-container">
      <button className="logout-button" onClick={logout}>Logout</button>
      <div className="content-container">
        <div className="component-container">
          <TournamentFormScreen />
        </div>
        <div className="component-container">
          <TournamentListScreen />
        </div>
        <div className="component-container">

        </div>
      </div>
    </div>
  );
};

export default Home;