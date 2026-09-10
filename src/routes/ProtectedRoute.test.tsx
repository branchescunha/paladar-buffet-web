import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithProviders } from '@/test/render';

const fetchCurrentAdminMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  fetchCurrentAdmin: () => fetchCurrentAdminMock(),
  login: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn()
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    fetchCurrentAdminMock.mockReset();
  });

  it('redirects unauthenticated users to login', async () => {
    fetchCurrentAdminMock.mockRejectedValue(new Error('unauthenticated'));
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<h1>Protected Admin</h1>} />
        </Route>
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>,
      ['/admin']
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('renders protected content for authenticated admins', async () => {
    fetchCurrentAdminMock.mockResolvedValue({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null,
      mustChangePassword: false
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<h1>Protected Admin</h1>} />
        </Route>
      </Routes>,
      ['/admin']
    );

    expect(await screen.findByText('Protected Admin')).toBeInTheDocument();
  });

  it('redirects authenticated admins to password change while it is required', async () => {
    fetchCurrentAdminMock.mockResolvedValue({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null,
      mustChangePassword: true
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<h1>Protected Admin</h1>} />
          <Route path="/change-password" element={<h1>Change Password</h1>} />
        </Route>
      </Routes>,
      ['/admin']
    );

    expect(await screen.findByText('Change Password')).toBeInTheDocument();
    expect(screen.queryByText('Protected Admin')).not.toBeInTheDocument();
  });
});
