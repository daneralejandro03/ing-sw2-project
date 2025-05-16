import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row">
      {/* Izquierda 30% */}
      <div className="md:w-[20%] bg-gray-50 p-8 flex flex-col justify-between">
        <nav>
          <ul className="space-y-4 text-lg font-medium text-gray-700">
            <li className="hover:text-blue-600 cursor-pointer">Nosotros</li>
            <li className="hover:text-blue-600 cursor-pointer">Contacto</li>
            <li className="hover:text-blue-600 cursor-pointer">Tu madre</li>
          </ul>
        </nav>

        <div className="mt-12 flex flex-col space-y-4">
          <button
            onClick={handleRegister}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Registrarse
          </button>
          <button
            onClick={handleLogin}
            className="w-full py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-100 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Derecha 70% */}
      <div className="md:w-[80%] bg-blue-600">
      </div>
    </div>
  );
};

export default Home;
