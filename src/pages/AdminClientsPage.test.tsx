import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminClientsPage } from './AdminClientsPage';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  customers: [] as Array<Record<string, unknown>>,
  deleteCustomer: vi.fn(),
  updateCustomer: vi.fn()
}));

const customer = {
  id: 'customer-1', name: 'Ana Souza', phone: '61999999999', email: 'ana@example.com', notes: 'Cliente recorrente',
  createdAt: '2026-09-01T12:00:00.000Z', updatedAt: '2026-09-01T12:00:00.000Z'
};

vi.mock('@/features/admin-crm/crm.service', () => ({
  fetchCustomers: () => Promise.resolve([...mocks.customers]),
  fetchCustomer: () => Promise.resolve(customer),
  createCustomer: vi.fn(),
  updateCustomer: mocks.updateCustomer,
  deleteCustomer: mocks.deleteCustomer
}));

describe('AdminClientsPage deletion', () => {
  beforeEach(() => {
    mocks.customers = [customer];
    mocks.deleteCustomer.mockReset();
    mocks.updateCustomer.mockReset().mockResolvedValue(customer);
  });

  it('shows deletion only for an existing customer and hides it for a new customer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminClientsPage />);

    expect(screen.queryByRole('button', { name: 'Excluir cliente' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    expect(screen.getByRole('button', { name: 'Excluir cliente' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Novo cliente' }));
    expect(screen.queryByRole('button', { name: 'Excluir cliente' })).not.toBeInTheDocument();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminClientsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir cliente' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Excluir cliente?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(mocks.deleteCustomer).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('deletes after confirmation, refreshes the list and resets the form', async () => {
    mocks.deleteCustomer.mockImplementation(async () => { mocks.customers = []; });
    const user = userEvent.setup();
    renderWithProviders(<AdminClientsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir cliente' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir cliente' }));

    expect(await screen.findByText('Cliente excluído com sucesso.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo cliente' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /Ana Souza/i })).not.toBeInTheDocument();
  });

  it('shows the business message when deletion is blocked', async () => {
    mocks.deleteCustomer.mockRejectedValue({ response: { data: { error: { message: 'Este cliente possui eventos ou propostas vinculados e não pode ser excluído.' } } } });
    const user = userEvent.setup();
    renderWithProviders(<AdminClientsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.click(screen.getByRole('button', { name: 'Excluir cliente' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir cliente' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este cliente possui eventos ou propostas vinculados e não pode ser excluído.');
  });

  it('continues updating an existing customer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminClientsPage />);
    await user.click(await screen.findByRole('button', { name: /Ana Souza/i }));
    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'Ana Silva');
    await user.click(screen.getByRole('button', { name: 'Salvar cliente' }));

    await waitFor(() => expect(mocks.updateCustomer).toHaveBeenCalledWith(expect.objectContaining({ id: 'customer-1', data: expect.objectContaining({ name: 'Ana Silva' }) })));
  });
});
