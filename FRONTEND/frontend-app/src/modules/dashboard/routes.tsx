import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./views/Dashboard"));
const RolesPage = lazy(() => import("../roles/views/RolesPage"));
const PermissionsPage = lazy(() => import("../permissions/views/PermissionsPage"));
const UsersPage = lazy(() => import("../user/views/UsersPage"));
const AccessPage = lazy(() => import("../access/views/AccessPage"));
const Profile = lazy(() => import("../user/components/Profile"));
const DepartmentsPage = lazy(() => import("../departament/views/DepartmentPage"));
const CitiesPage = lazy(() => import("../city/views/CitiesPage"));
const StorePage = lazy(() => import("../storeModule/views/StorePage"));
const CategoryPage = lazy(() => import("../category/views/CategoryPage"));
const SupplierPage = lazy(() => import("../supplier/views/SupplierPage"));
const ProductPage = lazy(() => import("../product/views/ProductPage"));
const ProvisionPage = lazy(() => import("../provision/views/ProvisionPage"));

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
      {
        path: "profile",
        element: (
          <Suspense fallback={<div>Loading profile...</div>}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: "departments",
        element: (
          <Suspense fallback={<div>Loading departments...</div>}>
            <DepartmentsPage />
          </Suspense>
        ),
      },
      {
        path: "cities",
        element: (
          <Suspense fallback={<div>Loading cities...</div>}>
            <CitiesPage />
          </Suspense>
        ),
      },
      {
        path: "stores",
        element: (
          <Suspense fallback={<div>Loading stores...</div>}>
            <StorePage />
          </Suspense>
        ),
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategoryPage />
          </Suspense>
        ),
      },
      {
        path: "suppliers",
        element: (
          <Suspense fallback={<div>Loading proveedores...</div>}>
            <SupplierPage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={<div>Loading product...</div>}>
            <ProductPage />
          </Suspense>
        ),
      },
      {
        path: "provisions",
        element: (
          <Suspense fallback={<div>Loading provisions...</div>}>
            <ProvisionPage />
          </Suspense>
        ),
      },
    ],
  },
];

export default dashboardRoutes;
