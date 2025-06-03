const ITEM_BASE = "/items";

export default {
  create: (orderId: string, productId: string) =>
    `${ITEM_BASE}/order/${orderId}/product/${productId}`,
  list: `${ITEM_BASE}`,
  delete: (id: string) => `${ITEM_BASE}/${id}`,
  update: (id: string) => `${ITEM_BASE}/${id}`,
};
