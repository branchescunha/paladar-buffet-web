export function currencyInputFromCents(cents: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function centsFromCurrencyInput(value: string, allowNegative = false) {
  const negative = allowNegative && value.trim().startsWith('-');
  const digits = value.replace(/\D/g, '');
  const cents = Number(digits || '0');
  return negative ? -cents : cents;
}
