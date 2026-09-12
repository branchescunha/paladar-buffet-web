import { api } from '@/services/api';

export const eventStatuses = ['PLANEJAMENTO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'] as const;
export type EventStatus = (typeof eventStatuses)[number];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEvent {
  id: string;
  customerId: string;
  quoteRequestId: string | null;
  eventType: string;
  eventDate: string;
  eventTime: string;
  location: string;
  guestCount: number;
  notes: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Pick<Customer, 'id' | 'name'>;
}

export type CustomerInput = Pick<Customer, 'name' | 'phone' | 'email' | 'notes'>;
export type EventInput = Omit<AdminEvent, 'id' | 'quoteRequestId' | 'createdAt' | 'updatedAt' | 'customer'>;

export async function fetchCustomers(search?: string) {
  const response = await api.get<Customer[]>('/admin/customers', { params: { search } });
  return response.data;
}

export async function fetchCustomer(id: string) {
  const response = await api.get<Customer>(`/admin/customers/${id}`);
  return response.data;
}

export async function createCustomer(input: CustomerInput) {
  const response = await api.post<Customer>('/admin/customers', input);
  return response.data;
}

export async function updateCustomer(input: { id: string; data: Partial<CustomerInput> }) {
  const response = await api.patch<Customer>(`/admin/customers/${input.id}`, input.data);
  return response.data;
}

export async function deleteCustomer(id: string) {
  await api.delete(`/admin/customers/${id}`);
}

export async function fetchEvents(input: { search?: string; status?: EventStatus }) {
  const response = await api.get<AdminEvent[]>('/admin/events', { params: input });
  return response.data;
}

export async function fetchEvent(id: string) {
  const response = await api.get<AdminEvent>(`/admin/events/${id}`);
  return response.data;
}

export async function createEvent(input: EventInput) {
  const response = await api.post<AdminEvent>('/admin/events', input);
  return response.data;
}

export async function updateEvent(input: { id: string; data: Partial<EventInput> }) {
  const response = await api.patch<AdminEvent>(`/admin/events/${input.id}`, input.data);
  return response.data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/admin/events/${id}`);
}

export async function convertQuoteRequest(input: { id: string; customerId?: string }) {
  const response = await api.post<{ customerId: string; eventId: string; quoteRequestStatus: string }>(
    `/admin/quote-requests/${input.id}/convert`,
    input.customerId ? { customerId: input.customerId } : {}
  );
  return response.data;
}
