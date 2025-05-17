const AUTH_BASE = '/auth';

export default {
  login: `${AUTH_BASE}/login`,          
  logout: `${AUTH_BASE}/logout`,    
  register: `${AUTH_BASE}/register`,
  forgotPassword: `${AUTH_BASE}/forgot-password`,
  resetPassword: `${AUTH_BASE}/reset-password`,
  verifyAccount: `${AUTH_BASE}/Verify`,
  toggle2fa: `${AUTH_BASE}/2fa/toggle`,
  verify2FA: `${AUTH_BASE}/2fa`
};
