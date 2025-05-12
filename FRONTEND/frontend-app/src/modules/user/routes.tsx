import React, { lazy, Suspense } from "react";

const ChangePassword = lazy(() => import("./views/ChangePassword"));

const userRoutes = [
  {
    path: "/change-password",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ChangePassword />
      </Suspense>
    ),
  },
];

export default userRoutes;
