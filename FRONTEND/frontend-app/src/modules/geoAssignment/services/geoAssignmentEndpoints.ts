const GEOASSIGNMENT_BASE = "/geo-assignments";

export default {
  createAndAsign: (orderId: string) =>
    `${GEOASSIGNMENT_BASE}/assignProximity/order/${orderId}`,
  create: `${GEOASSIGNMENT_BASE}`,
  list: `${GEOASSIGNMENT_BASE}`,
  delete: (id: string) => `${GEOASSIGNMENT_BASE}/${id}`,
  update: (id: string) => `${GEOASSIGNMENT_BASE}/${id}`,
  get: (id: string) => `${GEOASSIGNMENT_BASE}/${id}`

};
