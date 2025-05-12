import React, { useState } from "react";
import userService from "../services/userService";
import type { ChangePassword } from "../types/User";

const ChangePassword: React.FC = () => {
  //const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string>();

  const email = "andreskrdona06@gmail.com";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    try {
      const payload: ChangePassword = {
        email,
        oldPassword,
        newPassword,
      };
      const response = userService.changePassword(payload);
      console.log("Response: ", JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <div className="">
      <form className="" onSubmit={handleSubmit}>
        <h2>Cambiar contraseña</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="password"
          placeholder="Contraseña actual"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

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
  );
};

export default ChangePassword;
