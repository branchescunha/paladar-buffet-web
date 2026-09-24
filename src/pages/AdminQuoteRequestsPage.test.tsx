import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminQuoteRequestsPage } from './AdminQuoteRequestsPage';
import { renderWithProviders } from '@/test/render';

const serviceMocks = vi.hoisted(() => ({
  updateStatus: vi.fn().mockResolvedValue({ id: 'quote-1', status: 'EM_ANALISE' }),
  deleteQuoteRequest: vi.fn(),
  deleted: false
}));

vi.mock('@/features/admin-quote-requests/admin-quote-requests.service', () => ({
  quoteRequestStatuses: ['NOVA', 'EM_ANALISE', 'PROPOSTA_ENVIADA', 'APROVADA', 'RECUSADA', 'CANCELADA'],
  fetchAdminQuoteRequests: () =>
    Promise.resolve({
      total: serviceMocks.deleted ? 0 : 1,
      items: serviceMocks.deleted ? [] : [
        {
          id: 'quote-1',
          fullName: 'Ana Souza',
          email: 'ana@example.com',
          phone: '61999999999',
          eventType: 'casamento',
          eventTypeOther: null,
          eventDate: '2099-09-20T12:00:00.000Z',
          eventTime: '19:30',
          guestCount: 120,
          location: 'Brasília',
          preferredContact: 'whatsapp',
          status: 'NOVA',
          createdAt: '2099-08-20T12:00:00.000Z'
        }
      ]
    }),
  fetchAdminQuoteRequest: () =>
    Promise.resolve({
      id: 'quote-1',
      fullName: 'Ana Souza',
      email: 'ana@example.com',
      phone: '61999999999',
      eventType: 'casamento',
      eventTypeOther: null,
      eventDate: '2099-09-20T12:00:00.000Z',
      eventTime: '19:30',
      guestCount: 120,
      location: 'Brasília',
      preferredContact: 'whatsapp',
      status: 'NOVA',
      message: 'Gostaria de um buffet completo.',
      menuPreferences: ['jantar'],
      menuSelections: [
        { groupName: 'Acompanhamentos', groupPosition: 3, sectionName: 'Arroz', sectionPosition: 1, optionName: 'Arroz branco', optionPosition: 1 },
        { groupName: 'Acompanhamentos', groupPosition: 3, sectionName: 'Massas', sectionPosition: 2, optionName: 'Fettucine ao molho branco', optionPosition: 1 }
      ],
      serviceNeeds: ['garcons'],
      dietaryRestrictions: null,
      acceptedPrivacy: true,
      source: 'public_site',
      createdAt: '2099-08-20T12:00:00.000Z',
      updatedAt: '2099-08-20T12:00:00.000Z'
    }),
  updateAdminQuoteRequestStatus: serviceMocks.updateStatus,
  deleteAdminQuoteRequest: serviceMocks.deleteQuoteRequest
}));

vi.mock('@/features/admin-crm/crm.service', () => ({
  fetchCustomers: () => Promise.resolve([]),
  convertQuoteRequest: vi.fn()
}));

describe('AdminQuoteRequestsPage', () => {
  beforeEach(() => {
    serviceMocks.deleted = false;
    serviceMocks.deleteQuoteRequest.mockReset().mockImplementation(async () => {
      serviceMocks.deleted = true;
    });
  });

  it('opens full request details and updates its status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminQuoteRequestsPage />);

    await user.click(await screen.findByRole('button', { name: /ana souza/i }));

    expect(await screen.findByText('Gostaria de um buffet completo.')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Jantar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cardápio selecionado' })).toBeInTheDocument();
    expect(screen.getByText('Acompanhamentos')).toBeInTheDocument();
    expect(screen.getByText('Arroz branco')).toBeInTheDocument();
    expect(screen.getByText('Fettucine ao molho branco')).toBeInTheDocument();
    expect(screen.getByText('Garçons')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar proposta/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /criar cliente e evento/i })).toBeEnabled();

    await user.selectOptions(screen.getByLabelText('Status'), 'EM_ANALISE');

    expect(serviceMocks.updateStatus.mock.calls[0]?.[0]).toEqual({ id: 'quote-1', status: 'EM_ANALISE' });
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminQuoteRequestsPage />);
    await user.click(await screen.findByRole('button', { name: /ana souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir solicitação' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Excluir solicitação?' });
    expect(within(dialog).getByText(/clientes, eventos e propostas já criados não serão excluídos/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(serviceMocks.deleteQuoteRequest).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('deletes after confirmation, clears selection and refreshes the request list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminQuoteRequestsPage />);
    await user.click(await screen.findByRole('button', { name: /ana souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir solicitação' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir solicitação' }));

    expect(await screen.findByText('Solicitação excluída com sucesso.')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma solicitação para ver os detalhes.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: /ana souza/i })).not.toBeInTheDocument());
    expect(serviceMocks.deleteQuoteRequest).toHaveBeenCalledWith('quote-1');
  });
});
