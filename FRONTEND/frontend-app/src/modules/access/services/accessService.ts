import axios from "axios";
import endpoints from "./accessEndpoints";
import type {  } from "../types/Access";

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

};

export default accessService;
