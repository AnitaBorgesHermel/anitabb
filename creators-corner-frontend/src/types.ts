// src/types.ts

import User from "./lib/directus";

// You might also want to define other types
export interface AuthResponse {
  user: typeof User;
  token: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}


export type LoginResponse = {
  expires: number;
  access_token: string;
  refreshToken: string;
  userId: {
    id: string;
    role: string;
    app_access: boolean;
    admin_access: boolean;
    iat: number;
    exp: number;
    iss: string;
  };
};