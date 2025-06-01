const PRODUCT_PROVISION = "/provision";

export default {
  create: (productId: string, supplierId: string) =>
    `${PRODUCT_PROVISION}/product/${productId}/supplier/${supplierId}`,
  list: `${PRODUCT_PROVISION}`,
  listProvisionsByProductId: (productId: string) => `${PRODUCT_PROVISION}/product/${productId}`,
  listProductsByProvisionId: (supplierId: string) => `${PRODUCT_PROVISION}/supplier/${supplierId}`,
  delete: (id: string) => `${PRODUCT_PROVISION}/${id}`,
  update: (id: string) => `${PRODUCT_PROVISION}/${id}`,
};
