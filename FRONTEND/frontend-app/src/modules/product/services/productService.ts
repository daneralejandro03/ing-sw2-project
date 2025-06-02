import axios from "axios";
import endpoints from "./productEndpoints";
import type { Product } from "../types/Product";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3002/api/v1",
});

const productService = {
  async create(payload: Product,  categoryId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(categoryId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  async update(payload: Product, id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(id), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
  
};

export default productService;
