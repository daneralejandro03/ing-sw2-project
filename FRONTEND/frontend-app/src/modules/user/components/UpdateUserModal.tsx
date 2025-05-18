import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { UpdateUser, User } from "../types/User";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (id: string, payload: UpdateUser) => Promise<void>;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [IDType, setIDType] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [cellPhone, setCellPhone] = useState<number | "">("");
  const [landline, setLandline] = useState<number | "">("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setLastName(user.lastName);
      setGender(user.gender);
      setEmail(user.email);
      setCellPhone(user.cellPhone || "");
      setLandline(user.landline || "");
      setIDType(user.IDType);
      setIDNumber(user.IDNumber);
      setPassword("");
      setError("");
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: UpdateUser = {
        name,
        lastName,
        gender,
        email,
        ...(password && { password }),
        IDType,
        IDNumber,
        ...(typeof cellPhone === 'number' && { cellPhone }),
        ...(typeof landline === 'number' && { landline }),
      };
      await onUpdate(user._id, payload);
      Swal.fire({ title: "Usuario actualizado", icon: "success", timer: 2000 });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar usuario");
      Swal.fire({
        title: "Ha ocurrido un error",
        text: err.response?.data?.message || "Error al actualizar usuario",
        icon: "error",
        timer: 2000,
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
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-4">Editar Usuario</h2>
        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido"
            className="w-full px-3 py-2 border rounded"
            required
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
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña (opcional)"
            className="w-full px-3 py-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={cellPhone}
              onChange={(e) => setCellPhone(Number(e.target.value) || "")}
              placeholder="Celular"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              value={landline}
              onChange={(e) => setLandline(Number(e.target.value) || "")}
              placeholder="Teléfono fijo"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={IDType}
              onChange={(e) => setIDType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tipo de documento</option>
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
          </div>
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
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserModal;
