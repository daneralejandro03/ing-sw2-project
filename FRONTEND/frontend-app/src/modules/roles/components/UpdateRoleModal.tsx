import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { UpdateRol, Role } from "../types/Rol";

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onUpdate: (id: string, payload: UpdateRol) => Promise<void>;
}

const UpdateRoleModal: React.FC<UpdateRoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      setName(role.name);
      setError("");
    }
  }, [isOpen, role]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: UpdateRol = {
        name,
      };
      await onUpdate(role._id, payload);
      Swal.fire({ title: "Rol actualizado", icon: "success", timer: 2000 });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar rol");
      Swal.fire({
        title: "Ha ocurrido un error",
        text: err.response?.data?.message || "Error al actualizar rol",
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
        <h2 className="text-xl font-semibold mb-4">Editar Rol</h2>
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

export default UpdateRoleModal;
