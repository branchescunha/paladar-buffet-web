import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '@/test/render';
import { env } from '@/config/env';

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
    (env as { VITE_GOOGLE_CLIENT_ID?: string }).VITE_GOOGLE_CLIENT_ID = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates required login fields', async () => {
    renderWithProviders(<LoginPage />, ['/login']);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<LoginPage />, ['/login']);

    const password = screen.getByLabelText('Senha');
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(password).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(password).toHaveAttribute('type', 'password');
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
    resolveLogin({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null,
      mustChangePassword: false
    });
    expect(await screen.findByText('Admin Area')).toBeInTheDocument();
  });

  it('redirects password login to mandatory password change when required', async () => {
    loginMock.mockResolvedValue({
      id: '1',
      name: 'Andre',
      email: 'admin@paladarbuffet.com.br',
      role: 'ADMIN',
      avatarUrl: null,
      mustChangePassword: true
    });
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<h1>Change Password</h1>} />
      </Routes>,
      ['/login']
    );

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@paladarbuffet.com.br');
    await userEvent.type(screen.getByLabelText('Senha'), 'StrongPass123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Change Password')).toBeInTheDocument();
  });

  it('renders a clear API error', async () => {
    loginMock.mockRejectedValue({ response: { data: { error: { message: 'E-mail ou senha inválidos.' } } } });
    renderWithProviders(<LoginPage />, ['/login']);

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@paladarbuffet.com.br');
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument());
  });

  it('keeps the administrative login restricted to email and password', () => {
    (env as { VITE_GOOGLE_CLIENT_ID?: string }).VITE_GOOGLE_CLIENT_ID = 'configured-client-id';

    renderWithProviders(<LoginPage />, ['/login']);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Continuar com Google')).not.toBeInTheDocument();
    expect(screen.queryByText('ou')).not.toBeInTheDocument();
  });
});
