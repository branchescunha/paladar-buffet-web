import { describe, expect, it } from 'vitest';
import { validateMenuSelection, type MenuGroup } from './menu.service';

const groups: MenuGroup[] = [{
  id: 'sides', name: 'Acompanhamentos', minSelections: 3, maxSelections: 3, position: 1, isActive: true,
  sections: [
    { id: 'rice', name: 'Arroz', position: 1, isActive: true, options: [
      { id: 'rice-1', name: 'Arroz branco', position: 1, isActive: true },
      { id: 'rice-2', name: 'Arroz com brócolis', position: 2, isActive: true }
    ] },
    { id: 'pasta', name: 'Massas', position: 2, isActive: true, options: [
      { id: 'pasta-1', name: 'Penne', position: 1, isActive: true }
    ] }
  ]
}];

describe('validateMenuSelection', () => {
  it('accepts the shared limit across multiple sections', () => {
    expect(validateMenuSelection(groups, ['rice-1', 'rice-2', 'pasta-1'])).toEqual({});
  });

  it('returns a friendly error when a configurable rule is not met', () => {
    expect(validateMenuSelection(groups, ['rice-1'])).toEqual({
      sides: 'Escolha exatamente 3 opções.'
    });
  });
});
