const ROUTE_BASE = "/routes";

export default {
  create: (geoAssignmentId: string)  => `${ROUTE_BASE}/${geoAssignmentId}`,
  list: `${ROUTE_BASE}`,
  delete: (id: string) => `${ROUTE_BASE}/${id}`,
  update: (id: string) => `${ROUTE_BASE}/${id}`,
  get: (id: string) => `${ROUTE_BASE}/${id}`,
  getStoreByRouteId: (id: string) => `${ROUTE_BASE}/${id}/store`

};
