import { api } from '@/services/api';

export interface DashboardQuoteRequest {
  id: string;
  fullName: string;
  eventType: string;
  eventTypeOther: string | null;
  eventDate: string | null;
  eventTime: string | null;
  guestCount: number;
  createdAt: string;
}

export interface AdminDashboard {
  metrics: {
    newRequests: number;
    inProgress: number;
    proposalsSent: number;
    approvedEvents: number;
  };
  latestRequests: DashboardQuoteRequest[];
}

export async function fetchAdminDashboard() {
  const response = await api.get<AdminDashboard>('/admin/dashboard');
  return response.data;
}
