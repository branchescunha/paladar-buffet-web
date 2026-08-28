import { api } from './api';
import type { QuoteRequestFormData } from '@/features/quote/quote.schemas';

export interface QuoteRequestReceipt {
  id: string;
  createdAt: string;
}

export async function submitQuoteRequest(input: QuoteRequestFormData) {
  const response = await api.post<QuoteRequestReceipt>('/quote-requests', input);
  return response.data;
}
