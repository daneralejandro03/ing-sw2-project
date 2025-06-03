const LOCATION_BASE = "/locations";

export default {
  create: (userId: string) => `${LOCATION_BASE}/${userId}`,
  getLocationsByUserId: (userId: string) => `${LOCATION_BASE}/${userId}`,
  delete: (id: string) => `${LOCATION_BASE}/${id}`
};
