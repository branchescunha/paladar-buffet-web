import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicHomePage } from './PublicHomePage';
import { renderWithProviders } from '@/test/render';

describe('PublicHomePage', () => {
  it('renders the public landing page without requiring admin authentication', () => {
    renderWithProviders(<PublicHomePage />);

    expect(screen.getByRole('heading', { name: /buffet completo para eventos em brasilia/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /solicitar orcamento/i })).toHaveAttribute('href', '/orcamento');
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
  });
});
