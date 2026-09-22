import { z } from 'zod';

export const eventTypes = [
  'casamento',
  'aniversario',
  'corporativo',
  'confraternizacao',
  'churrasco',
  'reuniao',
  'coffee-break',
  'brunch',
  'outro'
] as const;

export const menuPreferenceValues = ['jantar', 'churrasco', 'coffee-break', 'brunch', 'sobremesas'] as const;
export const serviceNeedValues = ['garcons', 'loucas', 'montagem', 'bebidas'] as const;

export function normalizeBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return (digits.length === 12 || digits.length === 13) && digits.startsWith('55') ? digits.slice(2) : digits;
}

export function isValidBrazilianPhone(value: string) {
  const digits = normalizeBrazilianPhone(value);
  const hasAreaCode = /^[1-9]{2}/.test(digits);
  const isFixedLine = digits.length === 10 && /^[2-5]/.test(digits.slice(2));
  const isMobile = digits.length === 11 && digits[2] === '9';

  return hasAreaCode && (isFixedLine || isMobile);
}

export function formatBrazilianPhone(value: string) {
  const digits = normalizeBrazilianPhone(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export const quoteRequestFormSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Informe seu nome.').max(120, 'Use no máximo 120 caracteres.'),
    email: z
      .string()
      .trim()
      .email('Informe um e-mail válido.')
      .max(180, 'Use no máximo 180 caracteres.')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .trim()
      .max(30, 'Use no máximo 30 caracteres.')
      .refine(isValidBrazilianPhone, 'Informe um telefone válido com DDD.')
      .transform(normalizeBrazilianPhone),
    eventType: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.enum(eventTypes, {
        required_error: 'Selecione o tipo de evento.',
        invalid_type_error: 'Selecione o tipo de evento.'
      })
    ),
    eventTypeOther: z.string().trim().max(80).optional().or(z.literal('')),
    eventDate: z.string().optional().or(z.literal('')),
    eventTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe o horário previsto.'),
    guestCount: z.coerce
      .number()
      .int('Informe um número inteiro.')
      .min(1, 'Informe a quantidade de convidados.')
      .max(10000, 'Informe até 10000 convidados.'),
    location: z.string().trim().max(140).optional().or(z.literal('')),
    message: z.string().trim().max(1200).optional().or(z.literal('')),
    preferredContact: z.enum(['whatsapp', 'email', 'telefone']).default('whatsapp'),
    menuPreferences: z.array(z.enum(menuPreferenceValues)).max(menuPreferenceValues.length).default([]),
    serviceNeeds: z.array(z.enum(serviceNeedValues)).max(serviceNeedValues.length).default([]),
    menuOptionIds: z.array(z.string().trim().min(1).max(64)).max(200).default([]),
    dietaryRestrictions: z.string().trim().max(600).optional().or(z.literal('')),
    acceptedPrivacy: z.boolean().refine((value) => value, 'Aceite a Política de Privacidade para continuar.'),
    website: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.eventType === 'outro' && !value.eventTypeOther) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventTypeOther'],
        message: 'Informe o tipo de evento.'
      });
    }
  });

export type QuoteRequestFormData = z.infer<typeof quoteRequestFormSchema>;
