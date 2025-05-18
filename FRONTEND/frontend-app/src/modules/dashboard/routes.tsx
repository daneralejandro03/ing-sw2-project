import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

const Dashboard = lazy(() => import("./views/Dashboard"));
const RolesPage = lazy(() => import("../roles/views/RolesPage"));
const PermissionsPage = lazy(() => import("../permissions/views/PermissionsPage"));
const UsersPage = lazy(() => import("../user/views/UsersPage"));
const AccessPage = lazy(() => import("../access/views/AccessPage"));

const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    ),
    children: [
      {
        path: "roles",
        element: (
          <Suspense fallback={<div>Loading roles...</div>}>
            <RolesPage />
          </Suspense>
        ),
      },
      {
        path: "permisos",
        element: (
          <Suspense fallback={<div>Loading permissions...</div>}>
            <PermissionsPage />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<div>Loading users...</div>}>
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: "access",
        element: (
          <Suspense fallback={<div>Loading access...</div>}>
            <AccessPage />
          </Suspense>
        ),
      },
    ],
  },
];

export default dashboardRoutes;
