const ACCESS_BASE = '/access';

export default {
  list: `${ACCESS_BASE}`,
  create: (permissionId: string, roleId: string) => `${ACCESS_BASE}/permission/${permissionId}/role/${roleId}`,
  update: (accessId: string) => `${ACCESS_BASE}/${accessId}`,
  delete: (accessId: string) => `${ACCESS_BASE}/${accessId}`
};
