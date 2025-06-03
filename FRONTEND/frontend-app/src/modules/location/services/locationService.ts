import axios from "axios";
import endpoints from "./locationEndpoints";
import type { Location } from "../types/Location";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3004/api/v1",
});

const locationService = {

  async create(payload: Location, userId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(
      endpoints.create(userId),
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  },

  async getLocationsByUserId(userId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.getLocationsByUserId(userId), {
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
};

export default locationService;
