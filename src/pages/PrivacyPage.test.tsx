import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrivacyPage } from './PrivacyPage';
import { renderWithProviders } from '@/test/render';

describe('PrivacyPage', () => {
  it('explains public quote request data usage', () => {
    renderWithProviders(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: /politica de privacidade/i })).toBeInTheDocument();
    expect(screen.getByText(/orcamento personalizado/i)).toBeInTheDocument();
    expect(screen.getByText(/buffet\.paladar\.df@gmail\.com/i)).toBeInTheDocument();
  });
});
