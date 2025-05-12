import React, { useState } from "react";
import "./Register.css";
import authService from "../services/authService";
import type { RegisterPayload } from "../types/Auth";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cellPhone, setCellPhone] = useState(0);
  const [landline, setLandline] = useState(0);
  const [IDType, setIDType] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      const payload: RegisterPayload = {
        name,
        lastName,
        gender,
        email,
        password,
        cellPhone,
        landline,
        IDType,
        IDNumber,
      };
      const response = await authService.register(payload);
      console.log("Response: ", JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Género"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Celular"
          value={cellPhone}
          onChange={(e) => setCellPhone(parseInt(e.target.value))}
          required
        />
        
        <input
          type="text"
          placeholder="Teléfono fijo"
          value={landline}
          onChange={(e) => setLandline(Number(e.target.value))}
        />
        <select
          value={IDType}
          onChange={(e) => setIDType(e.target.value)}
          required
        >
          <option value="">Seleccione el tipo de documento</option>
          <option value="CC">Cedula de ciudadania</option>
          <option value="TI">Tarjeta de identidad</option>
        </select>
        <input
          type="text"
          placeholder="Número de ID"
          value={IDNumber}
          onChange={(e) => setIDNumber(e.target.value)}
          required
        />

        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
};

export default Register;
