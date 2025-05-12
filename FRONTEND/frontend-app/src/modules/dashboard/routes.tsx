import React, { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./views/Dashboard"));

const dasboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    ),
  },
];

export default dasboardRoutes;
