import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";



const Home: React.FC = () => {

  const navigate = useNavigate();


  const handleRegister = () => {
    navigate("/register")
    
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <div className="home-page">
      <div className="home-izq">
        <div>
          <ul>
            <li>Nosotros</li>
            <li>Contacto</li>
            <li>Tu madre</li>
          </ul>
        </div>

        <div className="btn-home">
          <div>
            <button onClick={handleRegister}>Registrase</button>
          </div>
          <div>
            <button onClick={handleLogin}>Iniciar sesión</button>
          </div>
        </div>
      </div>
      <div className="home-der"></div>
    </div>
  );
};

export default Home;
