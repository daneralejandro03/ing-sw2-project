import React, { useState } from "react";
import Swal from "sweetalert2";

interface CreateRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

const CreateRoleModal: React.FC<CreateRolModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await onCreate(name);
      Swal.fire({
        title: "Rol creado exitosamente",
        icon: "success",
        draggable: true,
      });

      setName("");

      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear el rol");
      Swal.fire({
        title: "Ha ocurrido un error",
        icon: "error",
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
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-4">Crear Rol</h2>
        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del rol"
          className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end space-x-2">
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

export default CreateRoleModal;
