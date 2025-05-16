// src/modules/home/routes.tsx
import React, { lazy, Suspense } from 'react';

const Home = lazy(() => import('./views/Home'));

const homeRoutes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/home',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
];

export default homeRoutes;
