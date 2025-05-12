import React, { useState } from "react";
import "./Login.css";
import authService from "../services/authService";
import type { LoginPayload } from "../types/Auth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/authSlice";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      const payload: LoginPayload = { email, password };
      const response = await authService.login(payload);

      // Guardar el token en localStorage
    localStorage.setItem('token', response.access_token);

    // Aquí puedes agregar la acción para actualizar el estado de Redux (opcional)
    dispatch(loginSuccess({ token: response.access_token }));

      console.log("Response: ", JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Iniciar sesión</h2>

        {error && <p className="error">{error}</p>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <div>
          <p>
            <a href="/forgot-password">¿Has olvidado la contraseña?</a>
          </p>
        </div>
        <div>
          <button onClick={handleSubmit}>Iniciar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
