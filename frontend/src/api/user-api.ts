import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { User, UpdateProfileRequest } from '../types';

export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await apiClient.patch<{ user: User }>(API_ENDPOINTS.USERS.ME, data);
  return response.data.user;
};
