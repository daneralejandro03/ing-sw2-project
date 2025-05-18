import React, { useEffect, useState } from "react";
import permissionService from "../services/permissionsService";
import CreatePermissionModal from "../components/CreatePermissionModal";
import type { CreatePermission } from "../types/Permission";
import Swal from "sweetalert2";
import { Trash2, UserCog } from "lucide-react";
import UpdatePermissionModal from "../components/UpdatePermissionModal";

const PermissionsPage: React.FC = () => {
  const [error, setError] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);

  const loadPermissions = async () => {
    const data = await permissionService.list();
    setPermissions(data);
  };

  const deletePermission = async (id: string) => {
    try {
      Swal.fire({
        title: "Eliminar permiso",
        text: "¿Estas seguro que desea eliminar el permiso?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await permissionService.delete(id);
          Swal.fire({
            title: "Permiso eliminado",
            icon: "success",
            timer: 2000,
          });
          loadPermissions();
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

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleCreate = async (payload: CreatePermission) => {
    await permissionService.create(payload);
    await loadPermissions();
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Permisos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Permiso
        </button>
      </div>

      {error && (
        <p className="bg-red-100 text-red-600 text-center p-2 rounded">
          {error}
        </p>
      )}

      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Url
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Método
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Modulo
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Descripción
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission: any) => (
            <tr key={permission._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-200">
                {permission.url}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {permission.method}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {permission.module}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {permission.description}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                <div className="flex gap-2">
                  <button onClick={() => deletePermission(permission._id)}>
                    <Trash2 className="text-red-600 hover:scale-110 transition" />
                  </button>
                  <button onClick={() => setEditPermission(permission)}>
                    <UserCog className="text-blue-600 hover:scale-110 transition" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CreatePermissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <UpdatePermissionModal
        isOpen={!!editPermission}
        permission={editPermission}
        onClose={() => setEditPermission(null)}
        onUpdate={async (id, payload) => {
          await permissionService.update(payload, id);
          await loadPermissions();
        }}
      />
    </div>
  );
};

export default PermissionsPage;
