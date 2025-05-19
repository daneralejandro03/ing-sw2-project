import axios from "axios";
import endpoints from "./accessEndpoints";
import type { UpdateAccess } from "../types/Access";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3001/api/v1",
});

const accessService = {

  async list() {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.list, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async create(permissionId: string, roleId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(permissionId, roleId), {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async update(accessId: string, payload: UpdateAccess) {
    const token = localStorage.getItem("token");
    const { data } = await api.patch(endpoints.update(accessId), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async delete(accessId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.delete(endpoints.delete(accessId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

};

export default accessService;
