import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuotePage } from './QuotePage';
import { renderWithProviders } from '@/test/render';

const submitQuoteRequestMock = vi.fn();
const fetchPublicMenuMock = vi.fn();

vi.mock('@/services/quote-request.service', () => ({
  submitQuoteRequest: (...args: unknown[]) => submitQuoteRequestMock(...args)
}));
vi.mock('@/features/menu/menu.service', async () => {
  const actual = await vi.importActual<typeof import('@/features/menu/menu.service')>('@/features/menu/menu.service');
  return { ...actual, fetchPublicMenu: (...args: unknown[]) => fetchPublicMenuMock(...args) };
});

const menuCatalog = [{
  id: 'group-hot', name: 'Entradas quentes', minSelections: 1, maxSelections: 1, position: 1, isActive: true,
  sections: [{
    id: 'section-hot', name: 'Entradas quentes', position: 1, isActive: true,
    options: [{ id: 'option-hot', name: 'Fricassê de frango', position: 1, isActive: true }]
  }]
}];

describe('QuotePage', () => {
  beforeEach(() => {
    fetchPublicMenuMock.mockResolvedValue(menuCatalog);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates required public quote fields with client-friendly messages', async () => {
    renderWithProviders(<QuotePage />);

    await userEvent.click(screen.getByLabelText(/li e aceito/i));
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe um telefone válido com DDD.')).toBeInTheDocument();
    expect(screen.getByText('Selecione o tipo de evento.')).toBeInTheDocument();
    expect(screen.getByText('Informe o horário previsto.')).toBeInTheDocument();
    expect(screen.queryByText(/invalid enum|expected|received|zod|prisma/i)).not.toBeInTheDocument();
  });

  it('uses commercial copy without exposing internal account rules', () => {
    renderWithProviders(<QuotePage />);

    expect(screen.getByText(/conte os principais detalhes do seu evento/i)).toBeInTheDocument();
    expect(screen.getByText('Atendimento personalizado')).toBeInTheDocument();
    expect(screen.getByText('Proposta sob medida')).toBeInTheDocument();
    expect(screen.queryByText(/sem cadastro público/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sem conta pública/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/horário previsto obrigatório/i)).not.toBeInTheDocument();
  });

  it('keeps submit disabled until privacy consent is accepted', async () => {
    renderWithProviders(<QuotePage />);

    const submitButton = screen.getByRole('button', { name: /enviar solicitação/i });

    expect(submitButton).toBeDisabled();

    await userEvent.click(screen.getByLabelText(/li e aceito/i));

    expect(submitButton).toBeEnabled();
  });

  it('shows the custom event type field only for the Outro option', async () => {
    renderWithProviders(<QuotePage />);

    expect(screen.queryByLabelText('Outro tipo de evento')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'casamento');

    expect(screen.queryByLabelText('Outro tipo de evento')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'outro');

    expect(screen.getByLabelText('Outro tipo de evento')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Outro tipo de evento'), 'Evento personalizado');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'brunch');

    expect(screen.queryByLabelText('Outro tipo de evento')).not.toBeInTheDocument();
  });

  it('formats Brazilian phone input while typing and pasting', async () => {
    renderWithProviders(<QuotePage />);

    const phoneInput = screen.getByLabelText('WhatsApp ou telefone');

    await userEvent.type(phoneInput, 'abc61984163455');
    expect(phoneInput).toHaveValue('(61) 98416-3455');

    await userEvent.clear(phoneInput);
    fireEvent.paste(phoneInput, {
      clipboardData: {
        getData: () => '+55 61 3333-4444'
      }
    });
    expect(phoneInput).toHaveValue('(61) 3333-4444');
  });

  it('does not expose technical API errors on public submit failures', async () => {
    submitQuoteRequestMock.mockRejectedValue({
      response: { data: { error: { message: 'Invalid enum value. Expected casamento, received undefined' } } }
    });
    renderWithProviders(<QuotePage />);

    await userEvent.type(screen.getByLabelText('Nome completo'), 'Andre Vinicius');
    await userEvent.type(screen.getByLabelText('WhatsApp ou telefone'), '(61) 98416-3455');
    await userEvent.type(screen.getByLabelText('Quantidade estimada de convidados'), '120');
    await userEvent.type(screen.getByLabelText('Horário previsto'), '19:30');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'casamento');
    await userEvent.click(await screen.findByLabelText('Fricassê de frango'));
    await userEvent.click(screen.getByLabelText(/li e aceito/i));
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    expect(await screen.findByText(/não foi possível enviar sua solicitação agora/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid enum|expected|received|zod|prisma/i)).not.toBeInTheDocument();
  });

  it('submits a valid quote request and shows a neutral confirmation', async () => {
    submitQuoteRequestMock.mockResolvedValue({ id: 'quote-1', createdAt: '2099-09-20T12:00:00.000Z' });
    renderWithProviders(<QuotePage />);

    await userEvent.type(screen.getByLabelText('Nome completo'), 'Andre Vinicius');
    await userEvent.type(screen.getByLabelText('WhatsApp ou telefone'), '(61) 98416-3455');
    await userEvent.type(screen.getByLabelText('Quantidade estimada de convidados'), '120');
    await userEvent.type(screen.getByLabelText('Horário previsto'), '19:30');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de evento'), 'casamento');
    await userEvent.click(await screen.findByLabelText('Fricassê de frango'));
    await userEvent.click(screen.getByLabelText(/li e aceito/i));
    await userEvent.click(screen.getByRole('button', { name: /enviar solicitação/i }));

    await waitFor(() => expect(submitQuoteRequestMock).toHaveBeenCalledTimes(1));
    expect(submitQuoteRequestMock).toHaveBeenCalledWith(expect.objectContaining({
      phone: '61984163455', eventTime: '19:30', menuOptionIds: ['option-hot']
    }));
    expect(await screen.findByText(/solicitação recebida/i)).toBeInTheDocument();
  });
});
