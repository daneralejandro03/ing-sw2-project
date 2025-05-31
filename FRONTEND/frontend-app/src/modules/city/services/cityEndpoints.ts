const CITY_BASE = '/city';

export default {
  create: (idDept: string) => `${CITY_BASE}/departament/${idDept}`,
  listByDepto: (idDept: string) => `${CITY_BASE}/departament/${idDept}`,          
  list: `${CITY_BASE}`,    
  delete: (id: string) => `${CITY_BASE}/${id}`,
  update: (id: string) => `${CITY_BASE}/${id}`
};
