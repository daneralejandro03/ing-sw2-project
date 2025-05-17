import axios from "axios";
import endpoints from "./userEndpoints";
import type { ChangePassword, CreateUser } from "../types/User";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3001/api/v1",
});

const userService = {
  async changePassword(payload: ChangePassword) {
    const { data } = await api.post(endpoints.changePassword, payload);
    return data;
  },

  async listUsers() {
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

  async create(payload: CreateUser, role: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(role), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

export default userService;
