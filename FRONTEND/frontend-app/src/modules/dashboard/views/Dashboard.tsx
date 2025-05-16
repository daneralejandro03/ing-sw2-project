import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { useNavigate, Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const goTo = (path: string) => {
    navigate(path);
  };

  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Panel de Administración
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="flex flex-1 w-full">
        <aside className="w-64 bg-white border-r shadow-sm p-6 space-y-4">
          <button
            onClick={() => goTo("/dashboard")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Inicio
          </button>
          <button
            onClick={() => goTo("/dashboard/roles")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Roles
          </button>
          <button
            onClick={() => goTo("/dashboard/permisos")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Permisos
          </button>
          <button
            onClick={() => goTo("/dashboard/users")}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Usuarios
          </button>
        </aside>

        <main className="flex-1 w-full p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <footer className="w-full bg-white border-t px-6 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Mi Empresa. Todos los derechos
        reservados.
      </footer>
    </div>
  );
};

export default DashboardLayout;
