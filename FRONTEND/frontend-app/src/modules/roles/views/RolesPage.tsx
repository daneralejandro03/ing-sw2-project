import React, { useEffect, useState } from "react";
import rolesService from "../services/rolesService";
import CreateRoleModal from "../components/CreateRoleModal";

type Role = {
  _id: string;
  name: string;
};

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

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

      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Nombre
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role: any) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-200">
                {role.name}
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
    </div>
  );
};

export default RolesPage;
