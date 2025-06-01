const SUPPLIER_BASE = '/supplier';

export default {
  create: `${SUPPLIER_BASE}`,          
  list: `${SUPPLIER_BASE}`,    
  delete: (id: string) => `${SUPPLIER_BASE}/${id}`,
  update: (id: string) => `${SUPPLIER_BASE}/${id}`
};
