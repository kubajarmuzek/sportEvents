import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth/Auth";
import { AuthContext } from "./context/AuthProvider";
import React, { useContext } from "react";
import OrganizerPanel from "./pages/OrganizerPanel/OrganizerPanel";
import GameResults from "./pages/GameResults/GameResults";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={!isAuthenticated ? <Auth /> : <Navigate to="/home" />}
        />
        <Route path="/organizer-panel/:id" element={<OrganizerPanel />} />
        <Route path="/game-results/:id" element={<GameResults />} />
      </Routes>
    </Router>
  );
}

export default App;
