import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { renderWithProviders } from '@/test/render';

const fetchCurrentAdminMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  fetchCurrentAdmin: () => fetchCurrentAdminMock(),
  logout: () => logoutMock(),
  login: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn()
}));

describe('AdminLayout', () => {
  it('shows logged admin identity and logs out', async () => {
    fetchCurrentAdminMock.mockResolvedValue({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null
    });
    logoutMock.mockResolvedValue(undefined);

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h1>Dashboard</h1>} />
        </Route>
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>,
      ['/admin']
    );

    expect(await screen.findByText('admin@paladarbuffet.com.br')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('opens mobile navigation from the header menu button', async () => {
    fetchCurrentAdminMock.mockResolvedValue({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null
    });

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h1>Dashboard</h1>} />
        </Route>
      </Routes>,
      ['/admin']
    );

    const menuButton = await screen.findByLabelText('Abrir navegação');
    await userEvent.click(menuButton);

    expect(screen.getByLabelText('Fechar navegação')).toHaveAttribute('aria-expanded', 'true');
  });
});
