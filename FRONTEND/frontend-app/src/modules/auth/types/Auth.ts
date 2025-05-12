export interface AuthResponse {
  access_token: string;
  
}

export interface LoginPayload {
  email: string;
  password: string;
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