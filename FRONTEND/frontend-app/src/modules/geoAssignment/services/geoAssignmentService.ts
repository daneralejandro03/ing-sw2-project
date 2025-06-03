import axios from "axios";
import endpoints from "./geoAssignmentEndpoints";
import type { GeoAssignment, GeoAssignmentUpdate } from "../types/GeoAssignment";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3004/api/v1",
});

const geoAssignmentService = {

  async create(payload: GeoAssignment) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  },

  async createAndAsign(orderId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.createAndAsign(orderId),
      null,
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

  async get(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.get(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async update(payload: GeoAssignmentUpdate, id: string) {
      const token = localStorage.getItem("token");
      const { data } = await api.patch(endpoints.update(id), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
};

export default geoAssignmentService;
