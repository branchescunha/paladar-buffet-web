import { describe, expect, it } from 'vitest';
import { quoteRequestFormSchema } from './quote.schemas';

const validFormInput = {
  fullName: 'Andre Vinicius',
  email: 'andre@example.com',
  phone: '(61) 98416-3455',
  eventType: 'casamento',
  eventTypeOther: '',
  eventDate: '2099-09-20',
  eventTime: '19:30',
  guestCount: 120,
  location: 'Brasilia-DF',
  message: 'Buffet completo.',
  preferredContact: 'whatsapp',
  menuPreferences: ['jantar'],
  serviceNeeds: ['garcons'],
  dietaryRestrictions: '',
  acceptedPrivacy: true,
  website: ''
};

describe('quoteRequestFormSchema', () => {
  it('normalizes supported Brazilian phone numbers before posting', () => {
    expect(quoteRequestFormSchema.parse({ ...validFormInput, phone: '(61) 98416-3455' }).phone).toBe('61984163455');
    expect(quoteRequestFormSchema.parse({ ...validFormInput, phone: '(61) 3333-4444' }).phone).toBe('6133334444');
    expect(quoteRequestFormSchema.parse({ ...validFormInput, phone: '+55 61 98416-3455' }).phone).toBe('61984163455');
  });

  it('rejects invalid public phone values with a human message', () => {
    const invalid = quoteRequestFormSchema.safeParse({ ...validFormInput, phone: 'abc123' });

    expect(invalid.success).toBe(false);
    if (invalid.success) {
      throw new Error('Expected invalid phone to fail validation');
    }
    expect(invalid.error.issues[0]?.message).toBe('Informe um telefone válido com DDD.');
  });

  it('requires event time and privacy consent in public submissions', () => {
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, eventTime: '' })).toThrow();
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, acceptedPrivacy: false })).toThrow();
  });

  it('accepts only checkbox values rendered by the public form', () => {
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, menuPreferences: ['jantar', 'sql-admin'] })).toThrow();
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, serviceNeeds: ['garcons', 'debug-access'] })).toThrow();
  });

  it('limits numeric and contact fields before posting to the API', () => {
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, guestCount: 10001 })).toThrow();
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, email: `${'a'.repeat(181)}@example.com` })).toThrow();
    expect(() => quoteRequestFormSchema.parse({ ...validFormInput, phone: '1'.repeat(40) })).toThrow();
  });

  it('uses public validation messages without exposing enum internals', () => {
    const invalid = quoteRequestFormSchema.safeParse({ ...validFormInput, eventType: '' });

    expect(invalid.success).toBe(false);
    if (invalid.success) {
      throw new Error('Expected empty event type to fail validation');
    }
    expect(invalid.error.issues[0]?.message).toBe('Selecione o tipo de evento.');
    expect(invalid.error.issues[0]?.message).not.toMatch(/invalid enum|expected|received/i);
  });
});
