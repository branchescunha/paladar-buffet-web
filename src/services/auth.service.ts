import { api } from './api';
import type { AdminUser } from '@/types/auth';

export async function login(input: { email: string; password: string }) {
  const response = await api.post<{ admin: AdminUser }>('/auth/login', input);
  return response.data.admin;
}

export async function googleLogin(idToken: string) {
  const response = await api.post<{ admin: AdminUser }>('/auth/google', { idToken });
  return response.data.admin;
}

export async function fetchCurrentAdmin() {
  const response = await api.get<{ admin: AdminUser }>('/auth/me');
  return response.data.admin;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function requestPasswordReset(email: string) {
  const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data.message;
}

export async function resetPassword(input: { token: string; password: string }) {
  const response = await api.post<{ message: string }>('/auth/reset-password', input);
  return response.data.message;
}
