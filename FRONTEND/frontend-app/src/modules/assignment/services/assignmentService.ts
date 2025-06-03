import axios from "axios";
import endpoints from "./assignmentEndpoints";
import type { Assignment } from "../types/Assignment";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3003/api/v1",
});

const assignmentService = {
  async create(payload: Assignment, orderId: string, userDeliveryId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(orderId, userDeliveryId),
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

  async reportJSON(driverId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.reportJSON(driverId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async reportCSV(driverId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.reportCSV(driverId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async reportPDF(driverId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.reportPDF(driverId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    return data;
  },

  async reportEXCEL(driverId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.reportEXCEL(driverId), {
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

  async update(payload: Assignment, itemId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(itemId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default assignmentService;
