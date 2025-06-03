import { lazy, Suspense } from "react";

const OrderPage = lazy(() => import("./views/OrderPage"));
const OrderTrackingView = lazy(() => import("./views/OrderTrackingView"));

const orderRoutes = [
  {
    path: "/orders",
    element: (
      <Suspense fallback={<div>Cargando órdenes...</div>}>
        <OrderPage />
      </Suspense>
    ),
  },
  {
    path: "/order/:id/track",
    element: (
      <Suspense fallback={<div>Cargando seguimiento...</div>}>
        <OrderTrackingView />
      </Suspense>
    ),
  },
];

export default orderRoutes;
