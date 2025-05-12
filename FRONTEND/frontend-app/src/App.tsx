import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import AuthProvider from './shared/AuthProvider';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
