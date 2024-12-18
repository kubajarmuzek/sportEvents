import React, { useState } from "react";
import { Link, BrowserRouter as Router, Route, Switch } from "react-router-dom";
import axios from "axios";
import "./LoginScreen.css";

const LoginScreen = ( {onPress} ) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const login = async () => {
    try {
      setError("");

      const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("nickname", res.data.user.nickname);
      localStorage.setItem("id", String(res.data.user.id));

      login(res.data.token); 


      window.location.href = "/home";
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Invalid credentials");
      } else {
        setError("Invalid credentials");
      }
    }
  };

  return (
    <div className="login-container">
      <img
        src={require("../../assets/logo-no-background.png")}
        alt="Logo"
        style={{ width: "200px", height: "auto", objectFit: "contain" }}
      />
      <h2 className="header">Welcome Back</h2>
      <div className="card">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          className={`input ${emailFocused ? "input-focused" : ""}`}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          className={`input ${passwordFocused ? "input-focused" : ""}`}
        />
        {error && <p className="error-text">{error}</p>}
        <button onClick={login} className="login-button">
          Login
        </button>
        <div className="register-container">
          <p className="register-text">Don't have an account?</p>
          <button onClick={() => onPress()} className="register-link">
            Go to Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
