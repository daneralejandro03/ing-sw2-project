import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import { Trash2, UserCog } from "lucide-react";
import Swal from "sweetalert2";
import CreateUserModal from "../components/CreateUserModal";
import UpdateUserModal from "../components/UpdateUserModal";
import type { CreateUser } from "../types/User";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null);

  const loadUsers = async () => {
    const data = await userService.listUsers();
    console.log(JSON.stringify(data));

    setUsers(data);
  };

  const deleteUser = async (id: string) => {
    try {
      Swal.fire({
        title: "Eliminar usuario",
        text: "¿Estas seguro que desea eliminar el usuario?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Eliminar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await userService.delete(id);
          Swal.fire({
            title: "Usuario eliminado",
            icon: "success",
            timer: 2000,
          });
          loadUsers();
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
    loadUsers();
  }, []);

  const handleCreate = async (payload: CreateUser, role: string) => {
    await userService.create(payload, role);
    await loadUsers();
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Usuario
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
              Nombre
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Apellido
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Correo
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Teléfono
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Estado
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Rol
            </th>
            <th className="text-left px-4 py-2 border-b border-gray-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-gray-200">
                {user.name}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {user.lastName}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {user.email}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {user.cellPhone || user.landline || "—"}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {user.estado ? (
                  <span className="text-green-600 font-medium">Activo</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactivo</span>
                )}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {user.role}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                <div className="flex gap-2">
                  <button onClick={() => deleteUser(user._id)}>
                    <Trash2 className="text-red-600 hover:scale-110 transition" />
                  </button>
                  <button onClick={() => setEditUser(user)}>
                    <UserCog className="text-blue-600 hover:scale-110 transition" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CreateUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <UpdateUserModal
        isOpen={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdate={async (id, payload) => {
          await userService.update(payload, id);
          await loadUsers();
        }}
      />
    </div>
  );
};

export default UsersPage;
