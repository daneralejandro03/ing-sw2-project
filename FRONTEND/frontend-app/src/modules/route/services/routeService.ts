import axios from "axios";
import endpoints from "./routeEndpoints";
import type { Route } from "../types/Route";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3004/api/v1",
});

const routeService = {
  async create(payload: Route, geoAssignmentId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(geoAssignmentId),
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  },

  async list() {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.list, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async update(payload: Route, routeId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(routeId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async get(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.get(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async getStoreByRouteId(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.getStoreByRouteId(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default routeService;
