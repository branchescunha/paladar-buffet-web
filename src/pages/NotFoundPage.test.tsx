import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage';
import { renderWithProviders } from '@/test/render';

describe('NotFoundPage', () => {
  it('presents a branded 404 state with a route back to the home page', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });
});
