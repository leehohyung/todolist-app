import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const register = async (data: RegisterRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
};

export const refreshToken = async (token: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, {
    refreshToken: token,
  });
  return response.data;
};
