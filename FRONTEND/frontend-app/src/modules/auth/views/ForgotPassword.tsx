import React, { useState } from "react";
import authService from "../services/authService";
import type { ForgotPasswordPayload } from "../types/Auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const payload: ForgotPasswordPayload = { email };
      const response = await authService.forgorPasswod(payload);
      console.log("Response: ", JSON.stringify(response));

      Swal.fire({
        title: "Correo enviado existosamente",
        icon: "success",
        draggable: true,
      });

      navigate("/reset-password");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el correo");

      Swal.fire({
        title: "Ha ocurrido un problema",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Recuperar contraseña
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 text-center p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white transition
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
