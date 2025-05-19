import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { UpdatePermission, Permission } from "../types/Permission";

interface UpdatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onUpdate: (id: string, payload: UpdatePermission) => Promise<void>;
}

const UpdatePermissionModal: React.FC<UpdatePermissionModalProps> = ({
  isOpen,
  onClose,
  permission,
  onUpdate,
}) => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("");
  const [module, setModule] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && permission) {
      setUrl(permission.url);
      setMethod(permission.method);
      setModule(permission.module);
      setDescription(permission.description)
      setError("");
    }
  }, [isOpen, permission]);

  if (!isOpen || !permission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: UpdatePermission = {
        url,
        method,
        module,
        description,
      };
      await onUpdate(permission._id, payload);
      Swal.fire({ title: "Permiso actualizado", icon: "success", timer: 2000 });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar permiso");
      Swal.fire({
        title: "Ha ocurrido un error",
        text: err.response?.data?.message || "Error al actualizar permiso",
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
        <h2 className="text-xl font-semibold mb-4">Editar Permiso</h2>
        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Url"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Método"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            placeholder="Modulo"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrición"
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

export default UpdatePermissionModal;
