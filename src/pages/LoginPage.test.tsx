import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '@/test/render';

const loginMock = vi.fn();
const fetchCurrentAdminMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  fetchCurrentAdmin: () => fetchCurrentAdminMock(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn()
}));

describe('LoginPage', () => {
  beforeEach(() => {
    fetchCurrentAdminMock.mockRejectedValue(new Error('unauthenticated'));
  });

  it('validates required login fields', async () => {
    renderWithProviders(<LoginPage />, ['/login']);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
  });

  it('shows loading and redirects after authenticated login', async () => {
    let resolveLogin: (value: unknown) => void = () => undefined;
    loginMock.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<h1>Admin Area</h1>} />
      </Routes>,
      ['/login']
    );

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@paladarbuffet.com.br');
    await userEvent.type(screen.getByLabelText('Senha'), 'StrongPass123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    resolveLogin({ id: '1', name: 'Andre', email: 'admin@paladarbuffet.com.br', role: 'ADMIN', avatarUrl: null });
    expect(await screen.findByText('Admin Area')).toBeInTheDocument();
  });

  it('renders a clear API error', async () => {
    loginMock.mockRejectedValue({ response: { data: { error: { message: 'E-mail ou senha invalidos.' } } } });
    renderWithProviders(<LoginPage />, ['/login']);

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@paladarbuffet.com.br');
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText('E-mail ou senha invalidos.')).toBeInTheDocument());
  });
});
