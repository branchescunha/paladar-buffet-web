import { api } from '@/services/api';

export interface MenuOption {
  id: string;
  name: string;
  position: number;
  isActive: boolean;
}

export interface MenuSection {
  id: string;
  name: string;
  position: number;
  isActive: boolean;
  options: MenuOption[];
}

export interface MenuGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number | null;
  position: number;
  isActive: boolean;
  sections: MenuSection[];
}

export async function fetchPublicMenu() {
  return (await api.get<MenuGroup[]>('/menu')).data;
}

export function validateMenuSelection(groups: MenuGroup[], selectedIds: string[]) {
  const errors: Record<string, string> = {};
  const selected = new Set(selectedIds);

  for (const group of groups.filter((item) => item.isActive)) {
    const availableIds = group.sections
      .filter((section) => section.isActive)
      .flatMap((section) => section.options.filter((option) => option.isActive).map((option) => option.id));
    const count = availableIds.filter((id) => selected.has(id)).length;

    if (group.maxSelections !== null && group.minSelections === group.maxSelections && count !== group.minSelections) {
      errors[group.id] = `Escolha exatamente ${group.minSelections} opções.`;
    } else if (count < group.minSelections) {
      errors[group.id] = `Escolha pelo menos ${group.minSelections} opções.`;
    } else if (group.maxSelections !== null && count > group.maxSelections) {
      errors[group.id] = `Escolha no máximo ${group.maxSelections} opções.`;
    }
  }

  return errors;
}

export function menuSelectionInstruction(group: MenuGroup) {
  if (group.maxSelections !== null && group.minSelections === group.maxSelections) {
    return `Escolha ${group.minSelections}`;
  }
  if (group.maxSelections === null && group.minSelections === 0) {
    return 'Escolha livre';
  }
  if (group.maxSelections === null) {
    return `Escolha pelo menos ${group.minSelections}`;
  }
  return `Escolha de ${group.minSelections} a ${group.maxSelections}`;
}
