import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { renderWithProviders } from '@/test/render';

const requestPasswordResetMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  requestPasswordReset: (email: string) => requestPasswordResetMock(email)
}));

describe('ForgotPasswordPage', () => {
  it('requests password recovery and shows the generic success message', async () => {
    requestPasswordResetMock.mockResolvedValue('Se o e-mail estiver autorizado, enviaremos as instruções de recuperação.');
    renderWithProviders(<ForgotPasswordPage />, ['/forgot-password']);

    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@paladarbuffet.com.br');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(await screen.findByText('Se o e-mail estiver autorizado, enviaremos as instruções de recuperação.')).toBeInTheDocument();
  });
});
