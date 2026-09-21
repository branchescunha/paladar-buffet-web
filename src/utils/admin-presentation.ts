const controlledValueLabels: Record<string, string> = {
  casamento: 'Casamento',
  aniversario: 'Aniversário',
  corporativo: 'Corporativo',
  confraternizacao: 'Confraternização',
  churrasco: 'Churrasco',
  reuniao: 'Reunião',
  'coffee-break': 'Coffee break',
  brunch: 'Brunch',
  outro: 'Outro',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  telefone: 'Telefone',
  jantar: 'Jantar',
  sobremesas: 'Sobremesas',
  garcons: 'Garçons',
  loucas: 'Louças',
  montagem: 'Montagem',
  bebidas: 'Bebidas'
};

export function formatAdminControlledValue(value: string) {
  return controlledValueLabels[value] ?? value;
}
