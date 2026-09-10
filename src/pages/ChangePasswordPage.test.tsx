import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { ChangePasswordPage } from './ChangePasswordPage';
import { renderWithProviders } from '@/test/render';

const changePasswordMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  changePassword: (...args: unknown[]) => changePasswordMock(...args),
  fetchCurrentAdmin: vi.fn(),
  login: vi.fn(),
  googleLogin: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn()
}));

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    changePasswordMock.mockReset();
  });

  it('validates confirmation before submitting a new password', async () => {
    renderWithProviders(<ChangePasswordPage />, ['/change-password']);

    await userEvent.type(screen.getByLabelText('Senha atual'), 'StrongPass123');
    await userEvent.type(screen.getByLabelText('Nova senha'), 'ChangedPass123');
    await userEvent.type(screen.getByLabelText('Confirmar nova senha'), 'DifferentPass123');
    await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('changes the password and returns to login', async () => {
    changePasswordMock.mockResolvedValue(undefined);
    renderWithProviders(
      <Routes>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>,
      ['/change-password']
    );

    await userEvent.type(screen.getByLabelText('Senha atual'), 'StrongPass123');
    await userEvent.type(screen.getByLabelText('Nova senha'), 'ChangedPass123');
    await userEvent.type(screen.getByLabelText('Confirmar nova senha'), 'ChangedPass123');
    await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(changePasswordMock.mock.calls[0]?.[0]).toEqual({
      currentPassword: 'StrongPass123',
      newPassword: 'ChangedPass123'
    });
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
});
