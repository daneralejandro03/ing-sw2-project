const SEGMENTS_BASE = "/segments";

export default {
  create: (routeId: string)  => `/routes/${routeId}/segments`,
  list: `${SEGMENTS_BASE}`,
  delete: (id: string) => `${SEGMENTS_BASE}/${id}`,
  update: (id: string) => `${SEGMENTS_BASE}/${id}`,
  get: (id: string) => `${SEGMENTS_BASE}/${id}`,
  getSegmentsByRouteId: (id: string) => `/routes/${id}/segments`,
  deleteSegmentsByRouteId: (id: string) => `/routes/${id}/segments`
};
