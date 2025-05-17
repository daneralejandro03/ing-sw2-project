import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { CreateUser } from "../types/User";
import rolesService from "../../roles/services/rolesService";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUser, role: string) => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cellPhone, setPhone] = useState(0);
  const [landline, setLandline] = useState(0);
  const [IDType, setIDType] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [error, setError] = useState<string>();
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);

  const loadRoles = async () => {
    const response = await rolesService.list();
    console.log(JSON.stringify(response))
    setRoles(response);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const userPayload: CreateUser = {
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
            
      await onCreate(userPayload, role);
      
      Swal.fire({
        title: "Usuario creado exitosamente",
        icon: "success",
        draggable: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario");
      Swal.fire({
        title: "Ha ocurrido un error",
        icon: "error",
        text: err.message || "Error al crear el usuario",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <form
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-4 col-span-2">Crear Usuario</h2>
        {error && (
          <p className="text-red-600 mb-2 text-sm col-span-2">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Género"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={cellPhone}
            onChange={(e) => setPhone(Number(e.target.value))}
            placeholder="Celular"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={landline}
            onChange={(e) => setLandline(Number(e.target.value))}
            placeholder="Teléfono fijo"
            className="w-full px-3 py-2 border rounded"
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
            value={IDNumber}
            onChange={(e) => setIDNumber(e.target.value)}
            placeholder="Número de documento"
            className="w-full px-3 py-2 border rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione el rol</option>
            {roles.map((r: any) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserModal;
