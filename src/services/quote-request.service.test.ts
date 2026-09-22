import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { submitQuoteRequest } from './quote-request.service';

vi.mock('./api', () => ({
  api: {
    post: vi.fn()
  }
}));

describe('submitQuoteRequest', () => {
  it('posts quote request data to the public API endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'quote-1', createdAt: '2099-09-20T12:00:00.000Z' }
    });

    const result = await submitQuoteRequest({
      fullName: 'Andre Vinicius',
      email: 'andre@example.com',
      phone: '(61) 98416-3455',
      eventType: 'casamento',
      eventDate: '2099-09-20',
      eventTime: '19:30',
      guestCount: 120,
      location: 'Brasilia-DF',
      message: 'Buffet completo.',
      preferredContact: 'whatsapp',
      menuPreferences: ['jantar'],
      serviceNeeds: ['garcons'],
      menuOptionIds: ['option-1'],
      dietaryRestrictions: '',
      acceptedPrivacy: true,
      website: ''
    });

    expect(api.post).toHaveBeenCalledWith(
      '/quote-requests',
      expect.objectContaining({ fullName: 'Andre Vinicius', eventTime: '19:30' })
    );
    expect(result.id).toBe('quote-1');
  });
});
