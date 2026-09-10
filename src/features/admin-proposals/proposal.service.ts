import { api } from '@/services/api';

export const proposalStatuses = ['RASCUNHO', 'ENVIADA', 'APROVADA', 'RECUSADA', 'CANCELADA'] as const;
export type ProposalStatus = (typeof proposalStatuses)[number];
export interface ProposalItemInput { description: string; quantity: number; unitPriceCents: number; }
export interface ProposalInput { customerId: string; eventId?: string; quoteRequestId?: string; description?: string; notes?: string; validUntil: string; adjustmentCents: number; items: ProposalItemInput[]; }
export interface Proposal { id: string; customerId: string; eventId: string | null; quoteRequestId: string | null; description: string | null; notes: string | null; validUntil: string; status: ProposalStatus; subtotalCents: number; adjustmentCents: number; totalCents: number; customer?: { id: string; name: string }; event?: { id: string; eventType: string } | null; items?: Array<ProposalItemInput & { id: string; subtotalCents: number }>; }

export async function fetchProposals(input: { search?: string; status?: ProposalStatus }) { return (await api.get<Proposal[]>('/admin/proposals', { params: input })).data; }
export async function fetchProposal(id: string) { return (await api.get<Proposal>(`/admin/proposals/${id}`)).data; }
export async function createProposal(input: ProposalInput) { return (await api.post<Proposal>('/admin/proposals', input)).data; }
export async function updateProposal(input: { id: string; data: ProposalInput }) { return (await api.patch<Proposal>(`/admin/proposals/${input.id}`, input.data)).data; }
export async function updateProposalStatus(input: { id: string; status: ProposalStatus }) { return (await api.patch<Proposal>(`/admin/proposals/${input.id}/status`, { status: input.status })).data; }
export async function createProposalDraft(quoteId: string) { return (await api.post<Proposal>(`/admin/quote-requests/${quoteId}/proposal-draft`, {})).data; }
export async function downloadProposalPdf(id: string) {
  const response = await api.get<ArrayBuffer>(`/admin/proposals/${id}/pdf`, { responseType: 'arraybuffer' });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'proposta-comercial-paladar.pdf';
  link.click();
  URL.revokeObjectURL(url);
}
