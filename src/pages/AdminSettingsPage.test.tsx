import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSettingsPage } from './AdminSettingsPage';
import { renderWithProviders } from '@/test/render';

const services = vi.hoisted(() => ({
  fetchAdminMenu: vi.fn(),
  fetchPaymentMethods: vi.fn(),
  createMenuGroup: vi.fn(), updateMenuGroup: vi.fn(), deleteMenuGroup: vi.fn(),
  createMenuSection: vi.fn(), updateMenuSection: vi.fn(), deleteMenuSection: vi.fn(),
  createMenuOption: vi.fn(), updateMenuOption: vi.fn(), deleteMenuOption: vi.fn(),
  createPaymentMethod: vi.fn(), updatePaymentMethod: vi.fn(), deletePaymentMethod: vi.fn()
}));

vi.mock('@/features/admin-settings/settings.service', () => services);

const group = {
  id: 'sides', name: 'Acompanhamentos', minSelections: 3, maxSelections: 3, position: 3, isActive: true,
  sections: [{
    id: 'rice', name: 'Arroz', position: 1, isActive: true,
    options: [{ id: 'rice-white', name: 'Arroz branco', position: 1, isActive: true }]
  }]
};

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    services.fetchAdminMenu.mockResolvedValue([group]);
    services.fetchPaymentMethods.mockResolvedValue([{ id: 'pix', name: 'Pix', instructions: null, pixKey: null, position: 1, isActive: true }]);
    services.createMenuOption.mockResolvedValue({ id: 'rice-broccoli', name: 'Arroz com brócolis', position: 2, isActive: true });
  });

  it('shows configurable menu rules and payment methods', async () => {
    renderWithProviders(<AdminSettingsPage />, ['/admin/settings']);

    expect(await screen.findByDisplayValue('Acompanhamentos')).toBeInTheDocument();
    expect(screen.getByText('Escolha: 3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pix')).toBeInTheDocument();
  });

  it('creates an editable option inside an existing section', async () => {
    renderWithProviders(<AdminSettingsPage />, ['/admin/settings']);

    const name = await screen.findByLabelText('Nova opção em Arroz');
    await userEvent.type(name, 'Arroz com brócolis');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar opção em Arroz' }));

    await waitFor(() => expect(services.createMenuOption).toHaveBeenCalledWith({
      sectionId: 'rice', name: 'Arroz com brócolis', position: 2, isActive: true
    }));
  });

  it('clears optional payment fields and uses the generic key label', async () => {
    services.fetchPaymentMethods.mockResolvedValue([{
      id: 'pix', name: 'Pix', instructions: 'Identificar o pagamento', pixKey: 'chave anterior', position: 1, isActive: true
    }]);
    services.updatePaymentMethod.mockResolvedValue({
      id: 'pix', name: 'Pix', instructions: null, pixKey: null, position: 1, isActive: true
    });
    const user = userEvent.setup();

    renderWithProviders(<AdminSettingsPage />, ['/admin/settings']);

    await user.clear(await screen.findByLabelText('Instruções'));
    const keyInput = screen.getByLabelText('Chave');
    await user.clear(keyInput);
    await user.click(within(keyInput.closest('form')!).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(services.updatePaymentMethod).toHaveBeenCalledWith('pix', {
      name: 'Pix', instructions: '', pixKey: '', position: 1, isActive: true
    }));
    expect(screen.queryByText('Chave Pix')).not.toBeInTheDocument();
  });
});
