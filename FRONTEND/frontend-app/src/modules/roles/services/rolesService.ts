import axios from "axios";
import endpoints from "./rolesEndpoints";
import type { CreateRol, UpdateRol } from "../types/Rol";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3001/api/v1",
});

const rolesService = {
  async create(payload: CreateRol) {
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

  async update(payload: UpdateRol, role: string) {
      const token = localStorage.getItem("token");
      const { data } = await api.patch(endpoints.update(role), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
};

export default rolesService;
