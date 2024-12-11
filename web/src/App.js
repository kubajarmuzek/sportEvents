import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home';
import LoginScreen from './pages/Auth/LoginScreen';
import SignupScreen from './pages/Auth/RegisterScreen';
import Auth from './pages/Auth/Auth';
import { AuthContext } from "./context/AuthProvider";
import React, { useContext } from "react";



function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={!isAuthenticated ? <Auth /> : <Navigate to="/home" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
