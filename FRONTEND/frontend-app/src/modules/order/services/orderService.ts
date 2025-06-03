import axios from "axios";
import endpoints from "./orderEndpoints";
import type { Order } from "../types/Order";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3003/api/v1",
});

const orderService = {
  async create(payload: Order, productId: string, supplierId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(productId, supplierId),
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

  async delete(id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.delete(endpoints.delete(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async update(payload: Order, orderId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(orderId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default orderService;
