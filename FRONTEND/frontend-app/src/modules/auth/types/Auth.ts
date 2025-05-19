export interface AuthResponse {
  access_token: string;
  
}

export interface LoginPayload {
  email: string;
  password: string;
  twoFactorMethod?: string;
}

export interface RegisterPayload {
  name: string;
  lastName: string;
  gender: string;
  email: string;
  password: string;
  cellPhone: number;
  landline: number;
  IDType: string;
  IDNumber: string;
}

export interface ForgotPasswordPayload{
  email: string;
}

export interface ResetPasswordPayload{
  token: string
  newPassword: string;
}

export interface VerifyAccount{
  email: string;
  code: string;
}

export interface Toggle2FA{
  email: string;
  enable: boolean;
}