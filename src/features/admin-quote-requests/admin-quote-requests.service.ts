import { api } from '@/services/api';

export const quoteRequestStatuses = [
  'NOVA',
  'EM_ANALISE',
  'PROPOSTA_ENVIADA',
  'APROVADA',
  'RECUSADA',
  'CANCELADA'
] as const;

export type QuoteRequestStatus = (typeof quoteRequestStatuses)[number];

export interface AdminQuoteRequestSummary {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  eventType: string;
  eventTypeOther: string | null;
  eventDate: string | null;
  eventTime: string | null;
  guestCount: number;
  location: string | null;
  preferredContact: string;
  status: QuoteRequestStatus;
  createdAt: string;
}

export interface AdminQuoteRequestDetail extends AdminQuoteRequestSummary {
  message: string | null;
  menuPreferences: string[];
  serviceNeeds: string[];
  dietaryRestrictions: string | null;
  acceptedPrivacy: boolean;
  source: string;
  updatedAt: string;
}

export async function fetchAdminQuoteRequests(input: { search?: string; status?: QuoteRequestStatus }) {
  const response = await api.get<{ items: AdminQuoteRequestSummary[]; total: number }>('/admin/quote-requests', {
    params: input
  });
  return response.data;
}

export async function fetchAdminQuoteRequest(id: string) {
  const response = await api.get<AdminQuoteRequestDetail>(`/admin/quote-requests/${id}`);
  return response.data;
}

export async function updateAdminQuoteRequestStatus(input: { id: string; status: QuoteRequestStatus }) {
  const response = await api.patch<{ id: string; status: QuoteRequestStatus }>(
    `/admin/quote-requests/${input.id}/status`,
    { status: input.status }
  );
  return response.data;
}
