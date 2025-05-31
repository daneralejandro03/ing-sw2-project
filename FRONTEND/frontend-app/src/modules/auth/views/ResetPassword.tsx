import React, { useState } from "react";
import authService from "../services/authService";
import type { ResetPasswordPayload } from "../types/Auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Mjc2NDYyM2RhMGQyMWY3NTE2N2UwYSIsImlhdCI6MTc0ODU0Njg2NiwiZXhwIjoxNzQ4NTUwNDY2fQ.knbkt3KV-q5e-dO1aOvyFn5XfdZHQl4K56vDdopba9I";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const payload: ResetPasswordPayload = { token, newPassword };
      const response = authService.resetPasswod(payload);
      console.log("Response: ", JSON.stringify(response));

      Swal.fire({
        title: "Contraseña cambiada exitosamente",
        icon: "success",
        draggable: true,
      });

      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al restablecer la contraseña"
      );

      Swal.fire({
        title: "Ha ocurrido un error",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 px-4 pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6"
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
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          {loading ? "Enviando..." : "Aceptar"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
