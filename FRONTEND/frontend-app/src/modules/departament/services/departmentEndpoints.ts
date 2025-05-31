const DEPARTMENT_BASE = '/departament';

export default {
  create: `${DEPARTMENT_BASE}`,          
  list: `${DEPARTMENT_BASE}`,    
  delete: (id: string) => `${DEPARTMENT_BASE}/${id}`,
  update: (id: string) => `${DEPARTMENT_BASE}/${id}`
};
