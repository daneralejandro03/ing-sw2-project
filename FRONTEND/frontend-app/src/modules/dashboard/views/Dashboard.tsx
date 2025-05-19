import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { useNavigate, Outlet } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);


const role = useSelector((state: any) => state.auth.role);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const goTo = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-bold text-gray-800">
            Panel de Administración
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => goTo("/dashboard/profile")}>
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 bg-white border-r shadow-sm p-6 space-y-4">
          <Sidebar goTo={goTo} role={role} />
        </aside>

        {/* Sidebar móvil */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="relative w-64 bg-white shadow-lg p-6 space-y-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4"
              >
                <X size={24} />
              </button>
              <Sidebar goTo={goTo} role={role} />
            </div>
            <div
              className="flex-1 bg-black bg-opacity-50"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 w-full overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t px-6 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Mi Empresa. Todos los derechos
        reservados.
      </footer>
    </div>
  );
};

const Sidebar = ({
  goTo,
  role,
}: {
  goTo: (path: string) => void;
  role: string | null;
}) => (
  <>
    <button
      onClick={() => goTo("/dashboard")}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
    >
      Inicio
    </button>

    {/* Mostrar estos solo si es Administrador */}
    {role === "Administrator" && (
      <>
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
        <button
          onClick={() => goTo("/dashboard/access")}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
        >
          Access
        </button>
      </>
    )}
  </>
);


export default DashboardLayout;
