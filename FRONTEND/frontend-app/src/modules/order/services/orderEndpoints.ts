const ORDER_BASE = "/orders";

export default {
  create: (userId: string, storeId: string) =>
    `${ORDER_BASE}/userGuest/${userId}/store/${storeId}`,
  list: `${ORDER_BASE}`,
  delete: (id: string) => `${ORDER_BASE}/${id}`,
  update: (id: string) => `${ORDER_BASE}/${id}`,
};
