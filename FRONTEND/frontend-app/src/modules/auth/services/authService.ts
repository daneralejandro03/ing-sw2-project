import axios from 'axios';
import endpoints from './authEndpoints';
import type { AuthResponse, ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload, VerifyAccount, Toggle2FA } from '../types/Auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_AWS_ENDPOINT_PREFIJO || 'http://localhost:3001/api/v1',
});

const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(endpoints.login, payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post(endpoints.logout);
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post(endpoints.register, payload);
    return data;
  },

  async forgorPasswod(payload: ForgotPasswordPayload){
    const { data } = await api.post(endpoints.forgotPassword, payload);
    return data;
  },

  async resetPasswod(payload: ResetPasswordPayload){
    const { data } = await api.post(endpoints.resetPassword, payload);
    return data;
  },

  async verifyAccount(payload: VerifyAccount){
    const { data } = await api.post(endpoints.verifyAccount, payload);
    return data;
  },

  async toggle2fa(payload: Toggle2FA){
    const token = localStorage.getItem("token");
    const { data } = await api.post(endpoints.toggle2fa, payload, {
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  async verify2FA(payload: VerifyAccount){
    const { data } = await api.post(endpoints.verify2FA, payload);
    return data;
  },

  async confirmTwoFactor(email: string){
    const { data } = await api.get(endpoints.confirmTwoFactor(email));
    return data;
  },
};

export default authService;
