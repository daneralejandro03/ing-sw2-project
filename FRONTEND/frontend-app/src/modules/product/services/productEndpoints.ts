const PRODUCT_BASE = '/product';

export default {
  create: (categoryId: string) => `${PRODUCT_BASE}/category/${categoryId}`,          
  list: `${PRODUCT_BASE}`,    
  delete: (id: string) => `${PRODUCT_BASE}/${id}`,
  update: (id: string) => `${PRODUCT_BASE}/${id}`
};
