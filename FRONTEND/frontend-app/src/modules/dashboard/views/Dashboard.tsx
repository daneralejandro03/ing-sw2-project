import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
    
        console.log("CUACK " + isAuthenticated);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido al Dashboard</h1>
      <p>Estás autenticado. Aquí puedes ver contenido privado.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default Dashboard;
