import { api } from '@/services/api';

export interface AdminMenuOption {
  id: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface AdminMenuSection {
  id: string;
  groupId: string;
  name: string;
  position: number;
  isActive: boolean;
  options: AdminMenuOption[];
}

export interface AdminMenuGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number | null;
  position: number;
  isActive: boolean;
  sections: AdminMenuSection[];
}

export interface MenuGroupInput {
  name: string;
  minSelections: number;
  maxSelections: number | null;
  position: number;
  isActive: boolean;
}

export interface MenuSectionInput {
  groupId: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface MenuOptionInput {
  sectionId: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  instructions: string | null;
  pixKey: string | null;
  position: number;
  isActive: boolean;
}

export interface PaymentMethodInput {
  name: string;
  instructions?: string | null;
  pixKey?: string | null;
  position: number;
  isActive: boolean;
}

export async function fetchAdminMenu() {
  return (await api.get<AdminMenuGroup[]>('/admin/menu')).data;
}

export async function createMenuGroup(input: MenuGroupInput) {
  return (await api.post<AdminMenuGroup>('/admin/menu/groups', input)).data;
}

export async function updateMenuGroup(id: string, input: MenuGroupInput) {
  return (await api.patch<AdminMenuGroup>(`/admin/menu/groups/${id}`, input)).data;
}

export async function deleteMenuGroup(id: string) {
  await api.delete(`/admin/menu/groups/${id}`);
}

export async function createMenuSection(input: MenuSectionInput) {
  return (await api.post<AdminMenuSection>('/admin/menu/sections', input)).data;
}

export async function updateMenuSection(id: string, input: MenuSectionInput) {
  return (await api.patch<AdminMenuSection>(`/admin/menu/sections/${id}`, input)).data;
}

export async function deleteMenuSection(id: string) {
  await api.delete(`/admin/menu/sections/${id}`);
}

export async function createMenuOption(input: MenuOptionInput) {
  return (await api.post<AdminMenuOption>('/admin/menu/options', input)).data;
}

export async function updateMenuOption(id: string, input: MenuOptionInput) {
  return (await api.patch<AdminMenuOption>(`/admin/menu/options/${id}`, input)).data;
}

export async function deleteMenuOption(id: string) {
  await api.delete(`/admin/menu/options/${id}`);
}

export async function fetchPaymentMethods() {
  return (await api.get<PaymentMethod[]>('/admin/payment-methods')).data;
}

export async function createPaymentMethod(input: PaymentMethodInput) {
  return (await api.post<PaymentMethod>('/admin/payment-methods', input)).data;
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput) {
  return (await api.patch<PaymentMethod>(`/admin/payment-methods/${id}`, input)).data;
}

export async function deletePaymentMethod(id: string) {
  await api.delete(`/admin/payment-methods/${id}`);
}
