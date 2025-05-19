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
        className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <h2 className="col-span-2 text-3xl font-bold text-center text-gray-800">
          Registro
        </h2>

        {error && (
          <p className="col-span-2 bg-red-100 text-red-600 text-center p-2 rounded">
            {error}
          </p>
        )}

        <div>
          <label className="block mb-1 text-gray-700">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Género</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Celular</label>
          <input
            type="tel"
            value={cellPhone}
            onChange={(e) => setCellPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Teléfono fijo <span className="text-sm text-gray-500">(opcional)</span></label>
          <input
            type="tel"
            value={landline}
            onChange={(e) => setLandline(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Tipo de documento</label>
          <select
            value={IDType}
            onChange={(e) => setIDType(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione</option>
            <option value="CC">Cédula de ciudadanía</option>
            <option value="TI">Tarjeta de identidad</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block mb-1 text-gray-700">Número de ID</label>
          <input
            type="text"
            value={IDNumber}
            onChange={(e) => setIDNumber(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`col-span-2 w-full py-3 rounded-md text-white ${
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