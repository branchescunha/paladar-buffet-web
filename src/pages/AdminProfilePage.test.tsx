import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProfilePage } from './AdminProfilePage';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn()
}));

vi.mock('@/features/auth/useAuth', () => ({
  useCurrentAdmin: () => ({
    data: {
      id: 'admin-1',
      name: 'André Cunha',
      commercialTitle: 'Administrador',
      email: 'andre@example.com',
      role: 'ADMIN',
      avatarUrl: null,
      mustChangePassword: false
    }
  })
}));

vi.mock('@/features/admin-users/admin-users.service', () => ({
  updateOwnAdminProfile: mocks.updateProfile
}));

describe('AdminProfilePage commercial profile', () => {
  beforeEach(() => {
    mocks.updateProfile.mockReset().mockResolvedValue({
      id: 'admin-1',
      name: 'Lethicia Byanca Santos Cunha',
      commercialTitle: 'Gerente Administrativo',
      email: 'andre@example.com',
      role: 'ADMIN',
      isActive: true
    });
  });

  it('loads and saves display name and commercial title without editing authorization role', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProfilePage />);

    expect(screen.getByLabelText('Nome de exibição')).toHaveValue('André Cunha');
    expect(screen.getByLabelText('Cargo comercial')).toHaveValue('Administrador');
    expect(screen.getByLabelText('Função')).toHaveValue('Administrador');
    expect(screen.getByLabelText('Função')).toHaveAttribute('readonly');

    await user.clear(screen.getByLabelText('Nome de exibição'));
    await user.type(screen.getByLabelText('Nome de exibição'), 'Lethicia Byanca Santos Cunha');
    await user.clear(screen.getByLabelText('Cargo comercial'));
    await user.type(screen.getByLabelText('Cargo comercial'), 'Gerente Administrativo');
    await user.click(screen.getByRole('button', { name: 'Salvar perfil' }));

    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith({
      name: 'Lethicia Byanca Santos Cunha',
      commercialTitle: 'Gerente Administrativo'
    }));
    expect(await screen.findByText('Perfil atualizado.')).toBeInTheDocument();
  });
});
