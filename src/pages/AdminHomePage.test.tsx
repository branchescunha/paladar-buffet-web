import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminHomePage } from './AdminHomePage';
import { renderWithProviders } from '@/test/render';

vi.mock('@/features/admin-dashboard/dashboard.service', () => ({
  fetchAdminDashboard: () =>
    Promise.resolve({
      metrics: {
        newRequests: 3,
        inProgress: 1,
        proposalsSent: null,
        approvedEvents: 2
      },
      latestRequests: [
        {
          id: 'quote-1',
          fullName: 'Ana Souza',
          eventType: 'casamento',
          eventTypeOther: null,
          eventDate: '2099-09-20T12:00:00.000Z',
          eventTime: '19:30',
          guestCount: 120,
          createdAt: '2099-08-20T12:00:00.000Z'
        }
      ]
    })
}));

describe('AdminHomePage', () => {
  it('shows the dashboard operational states without inventing metrics', async () => {
    renderWithProviders(<AdminHomePage />);

    expect(screen.getByRole('heading', { name: 'Solicitações novas' })).toBeInTheDocument();
    expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getAllByText('Ainda indisponível')).toHaveLength(1);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Últimas solicitações recebidas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nova proposta/i })).toHaveAttribute('href', '/admin/proposals');
    expect(screen.getByRole('link', { name: /ver solicitações/i })).toHaveAttribute('href', '/admin/quotes');
  });
});
