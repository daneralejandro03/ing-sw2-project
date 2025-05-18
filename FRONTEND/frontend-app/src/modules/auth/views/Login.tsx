import React, { useState } from "react";
import authService from "../services/authService";
import type { LoginPayload } from "../types/Auth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toggle2fa, setToggle2fa] = useState(false);
  const [error, setError] = useState<string>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const twoFactorMethod = "email"
      const payload: LoginPayload = { email, password, twoFactorMethod };
      const response = await authService.login(payload);

      //localStorage.setItem("token", response.access_token);

      //const decoded = jwtDecode(token) as { role: string };

      navigate("/verify2FA");
      
      dispatch(loginSuccess({ token: response.access_token }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md sm:max-w-lg bg-white shadow-md rounded-lg p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Iniciar sesión
        </h2>

        {error && (
          <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="toggle2fa"
            type="checkbox"
            checked={toggle2fa}
            onChange={(e) => setToggle2fa(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="toggle2fa" className="text-sm text-gray-700">
            Activar segundo factor de autenticación
          </label>
        </div>

        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Has olvidado la contraseña?
          </a>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition duration-200 text-white
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
              `}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
