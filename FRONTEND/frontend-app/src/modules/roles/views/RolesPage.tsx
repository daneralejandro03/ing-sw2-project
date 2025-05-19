import React, { useEffect, useState } from "react";
import rolesService from "../services/rolesService";
import CreateRoleModal from "../components/CreateRoleModal";
import { Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import type { Role } from "../types/Rol";
import UpdateRoleModal from "../components/UpdateRoleModal";

const RolesPage: React.FC = () => {
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);

  const loadRoles = async () => {
    const data = await rolesService.list();
    setRoles(data);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreate = async (name: string) => {
    await rolesService.create({ name });
    await loadRoles();
    setModalOpen(false);
  };

  const deleteRole = async (id: string) => {
    try {
      Swal.fire({
        title: "Eliminar rol",
        text: "¿Estas seguro que desea eliminar el rol?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await rolesService.delete(id);
          Swal.fire({
            title: "Rol eliminado",
            icon: "success",
            timer: 2000,
          });
          loadRoles();
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar usuario");
      Swal.fire({
        title: "Ha ocurrido un error",
        icon: "error",
        timer: 2000,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestión de Roles</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Rol
        </button>
      </div>

      {error && (
        <p className="bg-red-100 text-red-600 text-center p-2 rounded">
          {error}
        </p>
      )}

      <table className="min-w-full bg-white shadow-md rounded mb-4">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role: any) => (
            <tr key={role.id} className="border-t">
              <td className="py-2 px-4">{role.name}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  onClick={() => setEditRole(role)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRole(role._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CreateRoleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <UpdateRoleModal
        isOpen={!!editRole}
        role={editRole}
        onClose={() => setEditRole(null)}
        onUpdate={async (id, payload) => {
          await rolesService.update(payload, id);
          await loadRoles();
        }}
      />
    </div>
  );
};

export default RolesPage;
