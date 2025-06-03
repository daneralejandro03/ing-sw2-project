import axios from "axios";
import endpoints from "./itemEndpoints";
import type { Item } from "../types/Item";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3003/api/v1",
});

const itemService = {
  async create(payload: Item, orderId: string, productId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(orderId, productId),
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

  async update(payload: Item, itemId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(itemId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default itemService;
