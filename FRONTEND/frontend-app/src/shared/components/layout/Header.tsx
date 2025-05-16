import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gray-100 text-center text-gray-600 py-4 mt-auto">
    &copy; {new Date().getFullYear()} Mi Empresa. Todos los derechos reservados.
  </footer>
);

export default Footer;
