import axios from "axios";
import endpoints from "./cityEndpoints";
import type { City } from "../types/City";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3002/api/v1",
});

const cityService = {
  async create(payload: City, idDept: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(idDept), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async listByDept(idDept: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.create(idDept), {
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

  async update(payload: City, id: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(id), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
  
};

export default cityService;
