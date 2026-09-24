import { api } from '@/services/api';

export interface ManagedAdminUser {
  id: string;
  name: string;
  commercialTitle: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  isActive: boolean;
}

export async function fetchAdminUsers() {
  return (await api.get<ManagedAdminUser[]>('/admin/users')).data;
}

export async function setAdminUserActive(input: { id: string; isActive: boolean }) {
  return (await api.patch<ManagedAdminUser>(`/admin/users/${input.id}/active`, { isActive: input.isActive })).data;
}

export async function updateOwnAdminProfile(input: { name: string; commercialTitle: string }) {
  return (await api.patch<ManagedAdminUser>('/admin/users/profile', input)).data;
}
