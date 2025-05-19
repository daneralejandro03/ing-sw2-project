import React, { useState, useEffect } from "react";
import accessService from "../services/accessService";
import permissionService from "../../permissions/services/permissionsService";
import rolesService from "../../roles/services/rolesService";
import { Dialog } from "@headlessui/react";
import { Trash2, Edit, Plus } from "lucide-react";
import type { UpdateAccess } from "../types/Access";

const AccessPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [currentAccess, setCurrentAccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccess();
    loadRolesAndPermissions();
  }, []);

  const loadAccess = async () => {
    try {
      const response = await accessService.list();
      setData(response);
    } catch (error) {
      console.error("Error cargando accesos:", error);
    }
  };

  const loadRolesAndPermissions = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesService.list(),
        permissionService.list(),
      ]);
      setRoles(rolesRes);
      setPermissions(permissionsRes);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const organizarRolesYPermisos = (data: any[]) => {
    const rolesMap: { [key: string]: any } = {};

    data.forEach((item) => {
      const rol = item.role;
      const permiso = item.permission;

      if (!rolesMap[rol._id]) {
        rolesMap[rol._id] = {
          id: rol._id,
          name: rol.name,
          permisos: [],
        };
      }

      const permisoExiste = rolesMap[rol._id].permisos.some(
        (p: any) => p.id === permiso._id
      );

      if (!permisoExiste) {
        rolesMap[rol._id].permisos.push({
          accessId: item._id,
          id: permiso._id,
          url: permiso.url,
          method: permiso.method,
          module: permiso.module,
          description: permiso.description,
          active: item.active,
        });
      }
    });

    return Object.values(rolesMap).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleCreate = async () => {
    if (!selectedRole || !selectedPermission) return;

    try {
      setLoading(true);
      await accessService.create(selectedPermission, selectedRole);
      await loadAccess();
      closeModal();
    } catch (error) {
      console.error("Error creando acceso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentAccess || !selectedRole || !selectedPermission) return;

    try {
      setLoading(true);
      const role = selectedRole;
      const permission = selectedPermission;
      const payload: UpdateAccess = {
        role,
        permission,
      };
      await accessService.update(currentAccess.accessId, payload);
      await loadAccess();
      closeModal();
    } catch (error) {
      console.error("Error actualizando acceso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accessId: string) => {
    try {
      setLoading(true);
      await accessService.delete(accessId);
      await loadAccess();
    } catch (error) {
      console.error("Error eliminando acceso:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (access: any = null) => {
    setCurrentAccess(access);
    setIsModalOpen(true);
    if (access) {
      setSelectedRole(access.roleId);
      setSelectedPermission(access.permissionId);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAccess(null);
    setSelectedRole("");
    setSelectedPermission("");
  };

  const rolesOrganizados = organizarRolesYPermisos(data);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Accesos</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Acceso
        </button>
      </div>

      <table className="min-w-full bg-white shadow-md rounded mb-4">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="py-2 px-4">Rol</th>
            <th className="py-2 px-4">Descripción</th>
            <th className="py-2 px-4">Módulo</th>
            <th className="py-2 px-4">Método</th>
            <th className="py-2 px-4">URL</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rolesOrganizados.flatMap((rol) =>
            rol.permisos.map((permiso: any) => (
              <tr key={permiso.accessId} className="border-t">
                <td className="py-2 px-4">{rol.name}</td>
                <td className="py-2 px-4">{permiso.description}</td>
                <td className="py-2 px-4">{permiso.module}</td>
                <td className="py-2 px-4">{permiso.method}</td>
                <td className="py-2 px-4">{permiso.url}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    onClick={() =>
                      openModal({
                        accessId: permiso.accessId,
                        roleId: rol.id,
                        permissionId: permiso.id,
                      })
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(permiso.accessId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-bold mb-4">
              {currentAccess ? "Editar Acceso" : "Nuevo Acceso"}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map((rol) => (
                    <option key={rol._id} value={rol._id}>
                      {rol.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Permiso
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar Permiso</option>
                  {permissions.map((permiso) => (
                    <option key={permiso._id} value={permiso._id}>
                      {permiso.description} ({permiso.method})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={currentAccess ? handleUpdate : handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {rolesOrganizados.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No se encontraron roles y permisos
        </div>
      )}
    </div>
  );
};

export default AccessPage;
