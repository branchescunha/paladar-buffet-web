import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrivacyPage } from './PrivacyPage';
import { renderWithProviders } from '@/test/render';

describe('PrivacyPage', () => {
  it('explains public quote request data usage', () => {
    renderWithProviders(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: /política de privacidade/i })).toBeInTheDocument();
    expect(screen.getAllByText(/orçamento personalizado/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/buffet\.paladar\.df@gmail\.com/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: /contato/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/última atualização: agosto de 2026/i)).toBeInTheDocument();
  });

  it('does not expose internal admin or security implementation details', () => {
    renderWithProviders(<PrivacyPage />);

    expect(screen.queryByText(/acesso administrativo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/prote[cç][aã]o administrativa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sess[oõ]es restritas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/csrf/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /cookies e autentica[cç][aã]o/i })).not.toBeInTheDocument();
  });
});
