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
  pricingMode: 'ITEMIZED',
  subtotalCents: 615000,
  adjustmentCents: -20000,
  totalCents: 595000,
  customer: { id: 'customer-1', name: 'Ana Souza' },
  event: null,
  items: [
    { id: 'item-1', description: 'Garcons', quantity: 6, unitPriceCents: 20000, subtotalCents: 120000 },
    { id: 'item-2', description: 'Buffet', quantity: 165, unitPriceCents: 3000, subtotalCents: 495000 }
  ],
  includedServices: [],
  paymentInstallments: [],
  paymentMethods: [],
  menuSelections: [],
  responsibleNameSnapshot: null,
  responsibleTitleSnapshot: null
};

const perGuestProposal = {
  ...persistedProposal,
  id: 'proposal-per-guest',
  eventId: 'event-1',
  quoteRequestId: 'quote-1',
  pricingMode: 'PER_GUEST',
  guestCount: 80,
  pricePerGuestCents: 12990,
  baseTotalCents: 1039200,
  subtotalCents: 1039200,
  adjustmentCents: -39200,
  totalCents: 1000000,
  items: [],
  includedServices: [{ id: 'service-1', description: 'Buffet', position: 0 }],
  paymentInstallments: [
    { id: 'installment-1', description: 'Na contratação', percentage: 50, position: 0, amountCents: 500000 },
    { id: 'installment-2', description: 'No dia do evento', percentage: 50, position: 1, amountCents: 500000 }
  ],
  paymentMethods: [{ id: 'snapshot-1', paymentMethodId: 'payment-pix', name: 'Pix', pixKey: 'chave histórica', instructions: 'Pagamento identificado', position: 0 }],
  menuSelections: [
    { id: 'menu-1', groupName: 'Entradas', groupPosition: 1, sectionName: 'Entradas quentes', sectionPosition: 1, optionName: 'Fricassê de frango', optionPosition: 1 },
    { id: 'menu-2', groupName: 'Acompanhamentos', groupPosition: 2, sectionName: 'Massas', sectionPosition: 2, optionName: 'Penne ao molho quatro queijos', optionPosition: 1 }
  ],
  responsibleNameSnapshot: 'André Cunha',
  responsibleTitleSnapshot: 'Administrador'
};

vi.mock('@/features/admin-crm/crm.service', () => ({
  fetchCustomers: () => Promise.resolve([{ id: 'customer-1', name: 'Ana Souza' }]),
  fetchEvents: () => Promise.resolve([{ id: 'event-1', customerId: 'customer-1', eventType: 'casamento', guestCount: 80 }])
}));

vi.mock('@/features/admin-settings/settings.service', () => ({
  fetchPaymentMethods: () => Promise.resolve([
    { id: 'payment-pix', name: 'Pix', pixKey: 'chave atual', instructions: 'Instrução atual', position: 1, isActive: true },
    { id: 'payment-credit', name: 'Crédito', pixKey: null, instructions: null, position: 2, isActive: true }
  ])
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

  it('starts a new proposal in per-guest mode', async () => {
    renderWithProviders(<AdminProposalsPage />);

    expect(await screen.findByRole('heading', { name: 'Nova proposta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Valores por pessoa' })).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade de convidados')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor por pessoa')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar item' })).not.toBeInTheDocument();
  });

  it('hydrates the commercial snapshots without replacing them with current catalog data', async () => {
    proposalMocks.proposals = [{ ...perGuestProposal, items: undefined }];
    proposalMocks.fetchProposal.mockResolvedValue(perGuestProposal);
    const user = userEvent.setup();

    renderWithProviders(<AdminProposalsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));

    expect(await screen.findByLabelText('Quantidade de convidados')).toHaveValue(80);
    expect(screen.getByLabelText('Valor por pessoa')).toHaveValue('129,90');
    expect(screen.getByRole('heading', { name: 'Cardápio selecionado' })).toBeInTheDocument();
    expect(screen.getByText('Fricassê de frango')).toBeInTheDocument();
    expect(screen.getByText('Penne ao molho quatro queijos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Buffet')).toBeInTheDocument();
    expect(screen.getByLabelText('Pix')).toBeChecked();
    expect(screen.getByText('chave histórica')).toBeInTheDocument();
    expect(screen.getByText('André Cunha')).toBeInTheDocument();
  });

  it('opens the proposal selected by the quote request redirect', async () => {
    proposalMocks.fetchProposal.mockResolvedValue(perGuestProposal);

    renderWithProviders(<AdminProposalsPage />, ['/admin/proposals?proposal=proposal-per-guest']);

    await waitFor(() => expect(proposalMocks.fetchProposal).toHaveBeenCalledWith('proposal-per-guest'));
    expect(await screen.findByText('Fricassê de frango')).toBeInTheDocument();
    expect(screen.getByText('Penne ao molho quatro queijos')).toBeInTheDocument();
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
    expect(screen.getByRole('option', { name: 'Casamento' })).toBeInTheDocument();
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
