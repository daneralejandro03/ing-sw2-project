const ROLE_BASE = '/role';

export default {
  create: `${ROLE_BASE}`,          
  list: `${ROLE_BASE}`,  
  get: (id: string) => `${ROLE_BASE}/${id}`,
  delete: (id: string) => `${ROLE_BASE}/${id}`,
  update: (id: string) => `${ROLE_BASE}/${id}`
};
