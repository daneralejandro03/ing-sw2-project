import React, { useState } from "react";
import authService from "../services/authService";
import type { RegisterPayload } from "../types/Auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [landline, setLandline] = useState("");
  const [IDType, setIDType] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {

      const payload: RegisterPayload = {
        name,
        lastName,
        gender,
        email,
        password,
        cellPhone: Number(cellPhone),
        landline: Number(landline),
        IDType,
        IDNumber,
      };

      await authService.register(payload);

      Swal.fire({
        title: "Registro exitoso",
        icon: "success",
        draggable: true,
      });

      navigate("/verify");

    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrarse");
      Swal.fire({
        title: "Ha ocurrido un error en el registro",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-100 box-border">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md sm:max-w-lg bg-white shadow-md rounded-lg p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Registro
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 text-center p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Género"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Celular"
          value={cellPhone}
          onChange={(e) => setCellPhone(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Teléfono fijo (opcional)"
          value={landline}
          onChange={(e) => setLandline(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={IDType}
          onChange={(e) => setIDType(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccione el tipo de documento</option>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="TI">Tarjeta de identidad</option>
        </select>
        <input
          type="text"
          placeholder="Número de ID"
          value={IDNumber}
          onChange={(e) => setIDNumber(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition`}
        >
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
};

export default Register;
