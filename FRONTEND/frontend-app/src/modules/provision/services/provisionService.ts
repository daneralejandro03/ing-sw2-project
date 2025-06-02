import axios from "axios";
import endpoints from "./provisionEndpoints";
const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO ||
    "http://localhost:3002/api/v1",
});

const provisionService = {
  async create(productId: string, supplierId: string) {
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.create(productId, supplierId), null, {
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

  async listSuppliersByProductId(productId: string){
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.listProvisionsByProductId(productId), {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });

    return data;
  },

  async listProductsBySupplierId(supplierId: string){
    const token = localStorage.getItem("token");
    const { data } = await api.get(endpoints.listProductsByProvisionId(supplierId), {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });

    return data;
  }
  
};

export default provisionService;
