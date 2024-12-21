import React, { useState, useContext } from 'react';
import { AuthContext } from "../context/AuthProvider";
import TournamentFormScreen from './Tournaments/TournamentFormScreen';
import TournamentListScreen from './Tournaments/TournamentListScreen';
import UserProfile from './Profile/UserProfile';
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const { logout } = useContext(AuthContext);
  const [fullscreenComponent, setFullscreenComponent] = useState(null);

  const toggleFullscreen = (component) => {
    setFullscreenComponent((prev) => (prev === component ? null : component));
  };

  return (
    <div className={`homepage-container ${fullscreenComponent ? 'fullscreen-active' : ''}`}>
      <button className="logout-button" onClick={logout}>Logout</button>
      <div className={`content-container ${fullscreenComponent ? 'fullscreen-mode' : ''}`}>
        <div className={`component-container ${fullscreenComponent === 'form' ? 'fullscreen' : ''}`}>
          <button className="fullscreen-button" onClick={() => toggleFullscreen('form')}>
            <FontAwesomeIcon icon={fullscreenComponent === 'form' ? faCompress : faExpand} />
          </button>
          <TournamentFormScreen />
        </div>
        <div className={`component-container ${fullscreenComponent === 'list' ? 'fullscreen' : ''}`}>
          <button className="fullscreen-button" onClick={() => toggleFullscreen('list')}>
            <FontAwesomeIcon icon={fullscreenComponent === 'list' ? faCompress : faExpand} />
          </button>
          <TournamentListScreen />
        </div>
        <div className={`component-container ${fullscreenComponent === 'profile' ? 'fullscreen' : ''}`}>
          <button className="fullscreen-button" onClick={() => toggleFullscreen('profile')}>
            <FontAwesomeIcon icon={fullscreenComponent === 'profile' ? faCompress : faExpand} />
          </button>
          <UserProfile/>
        </div>
      </div>
    </div>
  );
};

export default Home;
