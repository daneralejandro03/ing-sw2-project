const INVENTORY_BASE = "/inventory";

export default {
  create: (storeId: string, productId: string) =>
    `${INVENTORY_BASE}/store/${storeId}/product/${productId}`,
  list: `${INVENTORY_BASE}`,
  listProductsByStoreId: (storeId: string) => `${INVENTORY_BASE}/store/${storeId}`,
  delete: (id: string) => `${INVENTORY_BASE}/${id}`,
  update: (id: string) => `${INVENTORY_BASE}/${id}`,
};
