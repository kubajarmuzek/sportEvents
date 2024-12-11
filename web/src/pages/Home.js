import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const Home = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome Home!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
