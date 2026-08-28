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

export const quoteRequestFormSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Informe seu nome.').max(120, 'Use no maximo 120 caracteres.'),
    email: z.string().trim().email('Informe um e-mail valido.').optional().or(z.literal('')),
    phone: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, '').length >= 10, 'Informe um telefone valido.'),
    eventType: z.enum(eventTypes, { required_error: 'Selecione o tipo de evento.' }),
    eventTypeOther: z.string().trim().max(80).optional().or(z.literal('')),
    eventDate: z.string().optional().or(z.literal('')),
    guestCount: z.coerce.number().int('Informe um numero inteiro.').min(1, 'Informe a quantidade de convidados.'),
    location: z.string().trim().max(140).optional().or(z.literal('')),
    message: z.string().trim().max(1200).optional().or(z.literal('')),
    preferredContact: z.enum(['whatsapp', 'email', 'telefone']).default('whatsapp'),
    menuPreferences: z.array(z.string()).default([]),
    serviceNeeds: z.array(z.string()).default([]),
    dietaryRestrictions: z.string().trim().max(600).optional().or(z.literal('')),
    acceptedPrivacy: z.boolean().refine((value) => value, 'Aceite a politica de privacidade para continuar.'),
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
