import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminProposalsPage } from './AdminProposalsPage';
import { renderWithProviders } from '@/test/render';

const proposalMocks = vi.hoisted(() => ({
  fetchProposal: vi.fn()
}));

const persistedProposal = {
  id: 'proposal-1',
  customerId: 'customer-1',
  eventId: null,
  quoteRequestId: null,
  description: 'Recepcao completa',
  notes: null,
  validUntil: '2099-10-01T00:00:00.000Z',
  status: 'RASCUNHO',
  subtotalCents: 615000,
  adjustmentCents: -20000,
  totalCents: 595000,
  customer: { id: 'customer-1', name: 'Ana Souza' },
  event: null,
  items: [
    { id: 'item-1', description: 'Garcons', quantity: 6, unitPriceCents: 20000, subtotalCents: 120000 },
    { id: 'item-2', description: 'Buffet', quantity: 165, unitPriceCents: 3000, subtotalCents: 495000 }
  ]
};

vi.mock('@/features/admin-crm/crm.service', () => ({
  fetchCustomers: () => Promise.resolve([{ id: 'customer-1', name: 'Ana Souza' }]),
  fetchEvents: () => Promise.resolve([])
}));

vi.mock('@/features/admin-proposals/proposal.service', () => ({
  proposalStatuses: ['RASCUNHO', 'ENVIADA', 'APROVADA', 'RECUSADA', 'CANCELADA'],
  fetchProposals: () =>
    Promise.resolve([
      {
        id: 'proposal-1',
        customerId: 'customer-1',
        eventId: null,
        quoteRequestId: null,
        description: 'Recepcao completa',
        notes: null,
        validUntil: '2099-10-01T00:00:00.000Z',
        status: 'RASCUNHO',
        subtotalCents: 615000,
        adjustmentCents: -20000,
        totalCents: 595000,
        customer: { id: 'customer-1', name: 'Ana Souza' },
        event: null
      }
    ]),
  fetchProposal: proposalMocks.fetchProposal,
  createProposal: vi.fn(),
  updateProposal: vi.fn(),
  updateProposalStatus: vi.fn(),
  downloadProposalPdf: vi.fn()
}));

describe('AdminProposalsPage', () => {
  it('rehydrates all persisted items and monetary values when reopening a proposal', async () => {
    proposalMocks.fetchProposal.mockResolvedValue(persistedProposal);
    const user = userEvent.setup();

    renderWithProviders(<AdminProposalsPage />);
    await user.click(await screen.findByRole('button', { name: /ana souza/i }));

    expect(await screen.findByDisplayValue('Garcons')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Buffet')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade do item 1')).toHaveValue(6);
    expect(screen.getByLabelText('Quantidade do item 2')).toHaveValue(165);
    expect(screen.getByLabelText('Valor do item 1')).toHaveValue('200,00');
    expect(screen.getByLabelText('Valor do item 2')).toHaveValue('30,00');
    expect(screen.getByText(/Subtotal: R\$ 6\.150,00/)).toBeInTheDocument();
    expect(screen.getByText(/Total: R\$ 5\.950,00/)).toBeInTheDocument();
  });
});
