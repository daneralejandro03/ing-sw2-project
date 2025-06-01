const STORE_BASE = '/store';

export default {
  create: (cityId: string, userId: string) => `${STORE_BASE}/city/${cityId}/user/${userId}`,
  //listUsersByStore: (idDept: string) => `${STORE_BASE}//${idDept}`,          
  list: `${STORE_BASE}`,    
  delete: (id: string) => `${STORE_BASE}/${id}`,
  update: (id: string) => `${STORE_BASE}/${id}`
};
