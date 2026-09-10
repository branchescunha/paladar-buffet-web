import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicHomePage } from './PublicHomePage';
import { renderWithProviders } from '@/test/render';

describe('PublicHomePage', () => {
  it('renders the redesigned public home without requiring admin authentication', () => {
    renderWithProviders(<PublicHomePage />);

    expect(screen.getByRole('heading', { name: /buffet completo para eventos em bras[ií]lia/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /solicitar or[cç]amento/i })[0]).toHaveAttribute('href', '/orcamento');
    expect(screen.queryByRole('link', { name: /entrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /acesso administrativo/i })).not.toBeInTheDocument();
  });

  it('uses the approved premium home composition', () => {
    renderWithProviders(<PublicHomePage />);

    expect(screen.getByLabelText(/reveal garcom chef/i)).toBeInTheDocument();
    expect(screen.queryByText(/empresa formalizada/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/desde 2014/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('img', { name: /proprietario do paladar buffet servindo/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fotos reais de cardapios/i)).not.toBeInTheDocument();

    expect(within(screen.getByLabelText(/categorias de cardapio/i)).getAllByRole('listitem')).toHaveLength(8);
    expect(within(screen.getByLabelText(/galeria paladar buffet/i)).getAllByRole('figure')).toHaveLength(8);
    expect(within(screen.getByLabelText(/processo de atendimento/i)).getAllByRole('listitem')).toHaveLength(5);
  });

  it('renders final gallery copy, unique categories and final image assets', () => {
    renderWithProviders(<PublicHomePage />);

    expect(screen.getByText('Sabores, montagens e detalhes que fazem parte de cada evento.')).toBeInTheDocument();
    expect(screen.queryByText(/tratadas|edição|geração|processamento/i)).not.toBeInTheDocument();

    const figures = within(screen.getByLabelText(/galeria paladar buffet/i)).getAllByRole('figure');
    const expected = [
      ['CORTE', 'Churrasco fatiado', 'gallery-sliced-beef-final.jpg'],
      ['BRASA', 'Montagem na brasa', 'gallery-grill-prep-final.jpg'],
      ['BUFFET', 'Massas e acompanhamentos', 'gallery-pasta-sides-final.jpg'],
      ['ACOMPANHAMENTOS', 'Molhos e acompanhamentos', 'gallery-sauces-sides-final.jpg'],
      ['CAFÉ', 'Café e bebidas', 'gallery-coffee-drinks-final.jpg'],
      ['MESA', 'Mesa posta', 'gallery-table-setting-final.jpg'],
      ['CHURRASCO', 'Churrasco na brasa', 'gallery-grilled-meats-final.jpg'],
      ['SOBREMESAS', 'Sobremesas montadas', 'gallery-desserts-final.jpg']
    ];

    expected.forEach(([category, title, asset], index) => {
      const figure = within(figures[index]);
      expect(figure.getByText(category)).toBeInTheDocument();
      expect(figure.getByText(title)).toBeInTheDocument();
      expect(figure.getByRole('img')).toHaveAttribute('src', expect.stringContaining(asset));
    });

    const categories = expected.map(([category]) => category);
    expect(new Set(categories).size).toBe(categories.length);
  });
});
