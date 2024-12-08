import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginScreen from './pages/Auth/LoginScreen';
import SignupScreen from './pages/Auth/RegisterScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<SignupScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
