import axios from "axios";
import endpoints from "./categoryEndpoints";
import type { Category } from "../types/Category";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3010/api/v1",
});

const departmentService = {
  async create(payload: Category) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create, payload, {
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

  async update(payload: Category, id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(id), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
  
};

export default departmentService;
