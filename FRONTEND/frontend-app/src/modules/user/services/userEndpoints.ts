const USER_BASE2 = '/auth';
const USER_BASE = '/user';

export default {
  changePassword: `${USER_BASE2}/change-password`,          
  list: `${USER_BASE}`,
  delete: (id: string) => `${USER_BASE}/${id}`,
  create: (role: string) => `${USER_BASE}/${role}`,
  update: (id: string) => `${USER_BASE}/${id}`,
};
