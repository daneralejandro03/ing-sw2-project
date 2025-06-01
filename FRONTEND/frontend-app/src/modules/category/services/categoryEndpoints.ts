const CATEGORY_BASE = '/category';

export default {
  create: `${CATEGORY_BASE}`,          
  list: `${CATEGORY_BASE}`,    
  delete: (id: string) => `${CATEGORY_BASE}/${id}`,
  update: (id: string) => `${CATEGORY_BASE}/${id}`
};
