import React, { useState } from "react";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleScreen = () => {
    setIsLogin(!isLogin); 
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <button onClick={toggleScreen} className="toggle-button">
          {isLogin ? "Go to Sign Up" : "Go to Login"}
        </button>
      </div>
      
      {isLogin ? <LoginScreen /> : <RegisterScreen />}
    </div>
  );
}

export default Auth;
