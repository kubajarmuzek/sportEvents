import React, { useState } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import './RegisterScreen.css';  // Import the updated CSS file

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);
  
  const navigate = useNavigate();

  const register = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/auth/register', {
        email,
        password,
        nickname, 
      });

      localStorage.setItem('nickname', nickname);
      
      navigate('/login');
    } catch (error) {
      setError('Registration failed: ' + error.message);
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
          className={`input ${emailFocused ? 'input:focus' : ''}`}
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onFocus={() => setNicknameFocused(true)}
          onBlur={() => setNicknameFocused(false)}
          className={`input ${nicknameFocused ? 'input:focus' : ''}`}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          className={`input ${passwordFocused ? 'input:focus' : ''}`}
        />
        {error && <p className="errorText">{error}</p>}
        
        <button className="button" onClick={register}>
          Register
        </button>

        <div className="log-container">
          <p className="log-text">Already have an account?</p>
          <Link to="/login" className="log-link">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
