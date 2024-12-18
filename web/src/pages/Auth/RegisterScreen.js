import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterScreen.css";

const RegisterScreen = ({ onPress }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);

  const navigate = useNavigate();

  const register = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/register", {
        email,
        password,
        nickname,
        gender,
        birthDate,
      });

      localStorage.setItem("nickname", nickname);

      onPress();
    } catch (error) {
      setError("Registration failed: " + error.message);
    }
  };

  return (
    <div className="container">
      <img
        src={require("../../assets/logo-no-background.png")}
        alt="Logo"
        style={{ width: "200px", height: "auto", objectFit: "contain" }}
      />
      <h2 className="header">Create an Account</h2>
      <div className="card">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          className={`input ${emailFocused ? "input:focus" : ""}`}
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onFocus={() => setNicknameFocused(true)}
          onBlur={() => setNicknameFocused(false)}
          className={`input ${nicknameFocused ? "input:focus" : ""}`}
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="input"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          className={`input ${passwordFocused ? "input:focus" : ""}`}
        />
        {error && <p className="errorText">{error}</p>}

        <button className="button" onClick={register}>
          Register
        </button>

        <div className="log-container">
          <p className="log-text">Already have an account?</p>
          <button onClick={() => onPress()} className="log-link">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
