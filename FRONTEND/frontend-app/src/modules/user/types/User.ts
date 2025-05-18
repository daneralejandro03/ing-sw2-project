export interface ChangePassword {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface User {
  _id: string;
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


export interface CreateUser {
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

export interface UpdateUser {
  name: string;
  lastName: string;
  gender: string;
  email: string;
  password?: string;
  cellPhone?: number;
  landline?: number;
  IDType?: string;
  IDNumber?: string;
}