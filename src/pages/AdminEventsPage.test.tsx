import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminEventsPage } from './AdminEventsPage';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  events: [] as Array<Record<string, unknown>>,
  deleteEvent: vi.fn(),
  updateEvent: vi.fn()
}));

const event = {
  id: 'event-1', customerId: 'customer-1', quoteRequestId: null, eventType: 'Casamento', eventDate: '2099-10-20T12:00:00.000Z',
  eventTime: '19:30', location: 'Brasília', guestCount: 120, notes: null, status: 'PLANEJAMENTO',
  createdAt: '2026-09-01T12:00:00.000Z', updatedAt: '2026-09-01T12:00:00.000Z', customer: { id: 'customer-1', name: 'Ana Souza' }
};

vi.mock('@/features/admin-crm/crm.service', () => ({
  eventStatuses: ['PLANEJAMENTO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'],
  fetchCustomers: () => Promise.resolve([{ id: 'customer-1', name: 'Ana Souza', phone: '61999999999' }]),
  fetchEvents: () => Promise.resolve([...mocks.events]),
  fetchEvent: () => Promise.resolve(event),
  createEvent: vi.fn(),
  updateEvent: mocks.updateEvent,
  deleteEvent: mocks.deleteEvent
}));

describe('AdminEventsPage deletion', () => {
  beforeEach(() => {
    mocks.events = [event];
    mocks.deleteEvent.mockReset();
    mocks.updateEvent.mockReset().mockResolvedValue(event);
  });

  it('shows deletion only for an existing event and hides it for a new event', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminEventsPage />);
    expect(screen.queryByRole('button', { name: 'Excluir evento' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /Casamento/i }));
    expect(screen.getByRole('button', { name: 'Excluir evento' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Novo evento' }));
    expect(screen.queryByRole('button', { name: 'Excluir evento' })).not.toBeInTheDocument();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminEventsPage />);
    await user.click(await screen.findByRole('button', { name: /Casamento/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir evento' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }));
    expect(mocks.deleteEvent).not.toHaveBeenCalled();
  });

  it('deletes after confirmation, refreshes the list and resets the form', async () => {
    mocks.deleteEvent.mockImplementation(async () => { mocks.events = []; });
    const user = userEvent.setup();
    renderWithProviders(<AdminEventsPage />);
    await user.click(await screen.findByRole('button', { name: /Casamento/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir evento' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir evento' }));

    expect(await screen.findByText('Evento excluído com sucesso.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo evento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de evento')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /Casamento/i })).not.toBeInTheDocument();
  });

  it('shows the business message when deletion is blocked', async () => {
    mocks.deleteEvent.mockRejectedValue({ response: { data: { error: { message: 'Este evento possui proposta vinculada e não pode ser excluído.' } } } });
    const user = userEvent.setup();
    renderWithProviders(<AdminEventsPage />);
    await user.click(await screen.findByRole('button', { name: /Casamento/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir evento' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir evento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Este evento possui proposta vinculada e não pode ser excluído.');
  });

  it('continues updating an existing event', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminEventsPage />);
    await user.click(await screen.findByRole('button', { name: /Casamento/i }));
    await user.clear(screen.getByLabelText('Tipo de evento'));
    await user.type(screen.getByLabelText('Tipo de evento'), 'Formatura');
    await user.click(screen.getByRole('button', { name: 'Salvar evento' }));
    await waitFor(() => expect(mocks.updateEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1', data: expect.objectContaining({ eventType: 'Formatura' }) })));
  });
});
