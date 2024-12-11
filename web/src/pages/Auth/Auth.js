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
      {isLogin ? <LoginScreen onPress={toggleScreen}/> : <RegisterScreen onPress={toggleScreen}/>}
    </div>
  );
}

export default Auth;
