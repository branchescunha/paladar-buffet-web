import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PublicLayout } from './PublicLayout';
import { renderWithProviders } from '@/test/render';

describe('PublicLayout', () => {
  it('starts in light theme and persists manual theme changes', async () => {
    localStorage.clear();
    renderWithProviders(<PublicLayout>Conteudo</PublicLayout>);

    expect(document.documentElement.dataset.theme).toBe('light');

    await userEvent.click(screen.getByRole('button', { name: /mudar para tema escuro/i }));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(localStorage.getItem('paladar-theme')).toBe('dark');
  });

  it('keeps the public navbar minimal without internal anchor navigation', () => {
    renderWithProviders(<PublicLayout>Conteudo</PublicLayout>);

    expect(screen.getByRole('banner').querySelector('nav')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /abrir menu/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /entrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /acesso administrativo/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /solicitar or[cç]amento|or[cç]amento/i })[0]).toHaveAttribute(
      'href',
      '/orcamento'
    );
  });
});
