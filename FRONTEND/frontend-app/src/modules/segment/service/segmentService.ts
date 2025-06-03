import axios from "axios";
import endpoints from "./segmentEndpoints";
import type { Segment } from "../types/Segment";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3004/api/v1",
});

const segmentService = {

  async create(payload: Segment, routeId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(routeId),
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

  async update(payload: Segment, segmentId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(segmentId), payload, {
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

  async getSegmentByRouteId(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.getSegmentsByRouteId(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async delete(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.delete(endpoints.delete(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async deleteSegmentsByRouteId(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.deleteSegmentsByRouteId(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default segmentService;
