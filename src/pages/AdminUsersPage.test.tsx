import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminUsersPage } from './AdminUsersPage';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  fetchAdminUsers: vi.fn(),
  setAdminUserActive: vi.fn()
}));

vi.mock('@/features/admin-users/admin-users.service', () => ({
  fetchAdminUsers: mocks.fetchAdminUsers,
  setAdminUserActive: mocks.setAdminUserActive
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    mocks.fetchAdminUsers.mockReset().mockResolvedValue([{
      id: 'admin-1',
      name: 'Lethicia Byanca Santos Cunha',
      commercialTitle: 'Gerente Comercial',
      email: 'lethicia@example.com',
      role: 'ADMIN',
      isActive: true
    }]);
    mocks.setAdminUserActive.mockReset();
  });

  it('shows authorization role separately from the commercial title', async () => {
    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByText('Lethicia Byanca Santos Cunha')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Gerente Comercial')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Função' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Cargo' })).toBeInTheDocument();
  });
});
