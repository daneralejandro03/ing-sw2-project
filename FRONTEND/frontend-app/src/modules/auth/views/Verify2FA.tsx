import React, { useState } from "react";
import authService from "../services/authService";
import type { VerifyAccount } from "../types/Auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const VerifyAccount: React.FC = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const payload: VerifyAccount = { email, code };
      const response = await authService.verify2FA(payload);
      console.log("Response: ", JSON.stringify(response));

      Swal.fire({
        title: "Verificación completa!",
        icon: "success",
        draggable: true,
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al verificar cuenta");
      Swal.fire({
        title: "Ha ocurrido un error!",
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
          Verificar cuenta
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

        <input
          type="text"
          placeholder="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
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
          {loading ? "Confirmando..." : "Confirmar"}
        </button>
      </form>
    </div>
  );
};

export default VerifyAccount;
