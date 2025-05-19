const PERMISSION_BASE = '/permission';

export default {
  create: `${PERMISSION_BASE}`,          
  list: `${PERMISSION_BASE}`,    
  delete: (id: string) => `${PERMISSION_BASE}/${id}`,
  update: (id: string) => `${PERMISSION_BASE}/${id}`
};
