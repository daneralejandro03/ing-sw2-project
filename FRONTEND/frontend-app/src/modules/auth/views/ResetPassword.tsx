import React, { useState } from "react";
import authService from "../services/authService";
import type { ResetPasswordPayload } from "../types/Auth";
import "./ForgotPassword.css";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string>();

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjBkYzQ2ZjhkZDg0ZDJiMmYyNmJmMyIsImlhdCI6MTc0NzAwMDkzOCwiZXhwIjoxNzQ3MDA0NTM4fQ.Z7BqXHeQLzFhHMIWJdfUNFndIDwypRYcwD9UBFr6coQ"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    try {
      const payload: ResetPasswordPayload = { token, newPassword };
      const response = authService.resetPasswod(payload);
      console.log("Response: ", JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al reestablecer la contraseña");
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Recuperar contraseña</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        

        <button type="submit">Aceptar</button>
      </form>
    </div>
  )
};

export default ResetPassword;
