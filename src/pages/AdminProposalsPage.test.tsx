import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProposalsPage } from './AdminProposalsPage';
import { renderWithProviders } from '@/test/render';

const proposalMocks = vi.hoisted(() => ({
  proposals: [] as Array<Record<string, unknown>>,
  fetchProposal: vi.fn(),
  deleteProposal: vi.fn(),
  updateProposal: vi.fn()
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
  fetchProposals: () => Promise.resolve([...proposalMocks.proposals]),
  fetchProposal: proposalMocks.fetchProposal,
  createProposal: vi.fn(),
  updateProposal: proposalMocks.updateProposal,
  updateProposalStatus: vi.fn(),
  downloadProposalPdf: vi.fn(),
  deleteProposal: proposalMocks.deleteProposal
}));

describe('AdminProposalsPage', () => {
  beforeEach(() => {
    proposalMocks.proposals = [{ ...persistedProposal, items: undefined }];
    proposalMocks.fetchProposal.mockReset().mockResolvedValue(persistedProposal);
    proposalMocks.deleteProposal.mockReset();
    proposalMocks.updateProposal.mockReset().mockResolvedValue(persistedProposal);
  });

  it('rehydrates all persisted items and monetary values when reopening a proposal', async () => {
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

  it('shows deletion only while editing an existing proposal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProposalsPage />);
    expect(screen.queryByRole('button', { name: 'Excluir proposta' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    expect(screen.getByRole('button', { name: 'Excluir proposta' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nova proposta' }));
    expect(screen.queryByRole('button', { name: 'Excluir proposta' })).not.toBeInTheDocument();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProposalsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir proposta' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }));
    expect(proposalMocks.deleteProposal).not.toHaveBeenCalled();
  });

  it('deletes after confirmation, refreshes the list and resets the form', async () => {
    proposalMocks.deleteProposal.mockImplementation(async () => { proposalMocks.proposals = []; });
    const user = userEvent.setup();
    renderWithProviders(<AdminProposalsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir proposta' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir proposta' }));

    expect(await screen.findByText('Proposta excluída com sucesso.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nova proposta' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ana Souza/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir proposta' })).not.toBeInTheDocument();
  });

  it('continues updating an existing proposal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProposalsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await screen.findByDisplayValue('Garcons');
    await user.click(screen.getByRole('button', { name: 'Salvar proposta' }));
    await waitFor(() => expect(proposalMocks.updateProposal).toHaveBeenCalledWith(expect.objectContaining({ id: 'proposal-1' })));
  });
});
