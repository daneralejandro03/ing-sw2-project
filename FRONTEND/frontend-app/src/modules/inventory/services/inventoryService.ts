import axios from "axios";
import endpoints from "./inventoryEndpoints";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3002/api/v1",
});

const inventoryService = {
  async create(storeId: string, productId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(storeId, productId), null, {
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

  async listProductsByStoreId(storeId: string){
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.listProductsByStoreId(storeId), {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });

    return data;
  }
  
};

export default inventoryService;
