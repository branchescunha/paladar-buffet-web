import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuotePage } from './QuotePage';
import { renderWithProviders } from '@/test/render';

const submitQuoteRequestMock = vi.fn();

vi.mock('@/services/quote-request.service', () => ({
  submitQuoteRequest: (...args: unknown[]) => submitQuoteRequestMock(...args)
}));

describe('QuotePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates required public quote fields', async () => {
    renderWithProviders(<QuotePage />);

    await userEvent.click(screen.getByRole('button', { name: /enviar solicitacao/i }));

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe um telefone valido.')).toBeInTheDocument();
    expect(screen.getByText('Aceite a politica de privacidade para continuar.')).toBeInTheDocument();
  });

  it('submits a valid quote request and shows a neutral confirmation', async () => {
    submitQuoteRequestMock.mockResolvedValue({ id: 'quote-1', createdAt: '2099-09-20T12:00:00.000Z' });
    renderWithProviders(<QuotePage />);

    await userEvent.type(screen.getByLabelText('Nome completo'), 'Andre Vinicius');
    await userEvent.type(screen.getByLabelText('WhatsApp ou telefone'), '(61) 98416-3455');
    await userEvent.type(screen.getByLabelText('Quantidade estimada de convidados'), '120');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'casamento');
    await userEvent.click(screen.getByLabelText(/li e aceito/i));
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitacao/i }));

    await waitFor(() => expect(submitQuoteRequestMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/solicitacao recebida/i)).toBeInTheDocument();
  });
});
