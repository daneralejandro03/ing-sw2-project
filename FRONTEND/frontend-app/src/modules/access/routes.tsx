import { lazy, Suspense } from "react";

const AccessPage = lazy(() => import("./views/AccessPage"));


const authRoutes = [
  {
    path: "/access-page",
    element: (
      <Suspense fallback={<div>Loading access...</div>}>
        <AccessPage />
      </Suspense>
    ),
  },
];

export default authRoutes;
