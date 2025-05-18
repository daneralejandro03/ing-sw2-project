export interface CreatePermission {
  url: string;
  method: string;
  module: string;
  description: string;
}

export interface Permission {
  _id: string;
  url: string;
  method: string;
  module: string;
  description: string;
}

export interface UpdatePermission {
  url: string;
  method: string;
  module: string;
  description: string;
}
