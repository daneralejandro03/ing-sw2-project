import React, { useState } from "react";
import authService from "../services/authService";
import type { ForgotPasswordPayload } from "../types/Auth";
import "./ForgotPassword.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    try {
      const payload: ForgotPasswordPayload = { email };
      const response = authService.forgorPasswod(payload);
      console.log("Response: ", JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el correo");
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Recuperar contraseña</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        

        <button type="submit">Enviar</button>
      </form>
    </div>
  )
};

export default ForgotPassword;
