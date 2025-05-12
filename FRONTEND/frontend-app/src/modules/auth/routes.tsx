import React, { lazy, Suspense } from "react";

const Login = lazy(() => import("./views/Login"));
const Register = lazy(() => import("./views/Register"));
const ForgotPassword = lazy(() => import("./views/ForgotPassword"));
const ResetPassword = lazy(() => import("./views/ResetPassword"));

const authRoutes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    ),
  },
];

export default authRoutes;
