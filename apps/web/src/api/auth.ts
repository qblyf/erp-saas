import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  realName: string;
  roles: string[];
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  tenant: {
    id: string;
    name: string;
    code: string;
  };
}

export const authApi = {
  login: (params: LoginParams) =>
    request.post<LoginResult>('/auth/login', params) as unknown as Promise<LoginResult>,
  logout: () =>
    request.post('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    request.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () =>
    request.get<User>('/auth/current-user') as unknown as Promise<User>,
};
