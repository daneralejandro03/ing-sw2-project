import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-6 py-4 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
