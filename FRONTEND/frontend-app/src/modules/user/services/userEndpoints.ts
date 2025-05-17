//const USER_BASE = '/auth';
const USER_BASE = '/user';

export default {
  changePassword: `${USER_BASE}/change-password`,          
  list: `${USER_BASE}`,
  delete: (id: string) => `${USER_BASE}/${id}`,
  create: (role: string) => `${USER_BASE}/${role}`,
};
