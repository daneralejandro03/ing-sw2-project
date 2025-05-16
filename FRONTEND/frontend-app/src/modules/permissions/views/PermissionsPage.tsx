import React, { useEffect, useState } from "react";
import permissionService from "../services/permissionsService";
import CreatePermissionModal from "../components/CreatePermissionModal";
import type { CreatePermission } from "../types/Permission";

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPermissions = async () => {
    const data = await permissionService.list();
    setPermissions(data);
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
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission: any) => (
            <tr key={permission.url} className="hover:bg-gray-50">
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
            </tr>
          ))}
        </tbody>
      </table>

      <CreatePermissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default PermissionsPage;
