import React from 'react';
import { useRoutes } from 'react-router-dom';

import authRoutes from '../modules/auth/routes';
import homeRoutes from '../modules/home/routes';
import userRoutes from '../modules/user/routes';
import dasboardRoutes from '../modules/dashboard/routes';
import accessRoutes from '../modules/access/routes';

const allRoutes = [
  ...authRoutes,
  ...homeRoutes,
  ...userRoutes,
  ...dasboardRoutes,
  ...accessRoutes,
];

export function AppRoutes() {
  
  return useRoutes(allRoutes);
}
