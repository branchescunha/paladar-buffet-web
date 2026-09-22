import { expect, test, type Page, type Route } from '@playwright/test';

test.setTimeout(90_000);

const admin = {
  id: 'admin-1',
  name: 'Administrador Paladar Buffet',
  email: 'administrativo.paladar@gmail.com',
  role: 'ADMIN',
  isActive: true,
  mustChangePassword: false,
  googleLinked: false
};

const customer = {
  id: 'customer-1',
  name: 'Maria de Oliveira Albuquerque',
  phone: '61999999999',
  email: 'maria.albuquerque@example.com',
  notes: 'Atendimento com observacoes detalhadas para validar textos longos no celular.',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z'
};

const event = {
  id: 'event-1',
  customerId: customer.id,
  quoteRequestId: 'quote-1',
  eventType: 'casamento',
  eventDate: '2099-10-20T12:00:00.000Z',
  eventTime: '19:30',
  location: 'Espaco de eventos com nome representativo e extenso em Brasilia',
  guestCount: 165,
  notes: 'Montagem completa.',
  status: 'CONFIRMADO',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
  customer: { id: customer.id, name: customer.name }
};

const quote = {
  id: 'quote-1',
  fullName: customer.name,
  email: customer.email,
  phone: customer.phone,
  eventType: 'casamento',
  eventTypeOther: null,
  eventDate: event.eventDate,
  eventTime: event.eventTime,
  guestCount: event.guestCount,
  location: event.location,
  preferredContact: 'whatsapp',
  status: 'NOVA',
  message: 'Gostaria de um buffet completo com atendimento personalizado para todos os convidados.',
  menuPreferences: ['jantar', 'sobremesas'],
  serviceNeeds: ['garcons', 'loucas', 'montagem'],
  dietaryRestrictions: 'Uma convidada com restricao a lactose.',
  acceptedPrivacy: true,
  source: 'public_site',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z'
};

const proposal = {
  id: 'proposal-1',
  customerId: customer.id,
  eventId: event.id,
  quoteRequestId: quote.id,
  description: 'Recepcao completa para casamento',
  notes: 'Equipe e estrutura completas.',
  validUntil: '2099-10-01T00:00:00.000Z',
  status: 'RASCUNHO',
  subtotalCents: 1125000,
  adjustmentCents: -25000,
  totalCents: 1100000,
  customer: { id: customer.id, name: customer.name },
  event: { id: event.id, eventType: event.eventType },
  items: [
    { id: 'item-1', description: 'Equipe de garcons', quantity: 6, unitPriceCents: 25000, subtotalCents: 150000 },
    { id: 'item-2', description: 'Buffet completo', quantity: 165, unitPriceCents: 5500, subtotalCents: 907500 },
    { id: 'item-3', description: 'Mesa de sobremesas', quantity: 1, unitPriceCents: 67500, subtotalCents: 67500 }
  ]
};

const viewports = [320, 375, 390, 430];
const adminRoutes = [
  ['/admin', 'Painel administrativo'],
  ['/admin/quotes', 'Solicita'],
  ['/admin/clients', 'Clientes'],
  ['/admin/events', 'Eventos'],
  ['/admin/proposals', 'Propostas'],
  ['/admin/profile', 'Perfil']
] as const;

for (const width of viewports) {
  test(`keeps the complete admin usable without horizontal overflow at ${width}px`, async ({ page }) => {
    let authenticated = false;
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      return resourceType === 'fetch' || resourceType === 'xhr'
        ? mockApi(route, authenticated)
        : route.continue();
    });
    await page.setViewportSize({ width, height: 844 });

    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expectContainedLayout(page, '/login');
    authenticated = true;

    for (const [path, heading] of adminRoutes) {
      await page.goto(path);
      await expect(page.locator('h1').filter({ hasText: heading })).toBeVisible();

      if (path === '/admin') {
        await page.getByRole('button', { name: /^Abrir navega/i }).click();
        await expect(page.getByLabel(/Navega.*administrativa/i)).toBeVisible();
        await expectContainedLayout(page, `${path} drawer`);
        await page.mouse.click(width - 4, 400);
      }

      if (path === '/admin/quotes') {
        await page.getByRole('button', { name: new RegExp(customer.name, 'i') }).click();
        await expect(page.getByText(quote.message)).toBeVisible();
      }

      if (path === '/admin/clients') {
        await openRecordAndDialog(page, customer.name, 'Excluir cliente');
      }

      if (path === '/admin/events') {
        await openRecordAndDialog(page, 'Casamento', 'Excluir evento');
      }

      if (path === '/admin/proposals') {
        await openRecordAndDialog(page, customer.name, 'Excluir proposta');
        await expect(page.getByLabel('Quantidade do item 3')).toHaveValue('1');
        await expect(page.getByText('R$ 675,00')).toBeVisible();
      }

      await expectContainedLayout(page, path);
    }
  });
}

async function openRecordAndDialog(page: Page, recordName: string, deleteLabel: string) {
  await page.getByRole('button', { name: new RegExp(recordName, 'i') }).first().click();
  await page.getByRole('button', { name: deleteLabel }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expectContainedLayout(page, `${deleteLabel} dialog`);
  await page.getByRole('button', { name: 'Cancelar' }).click();
}

async function expectContainedLayout(page: Page, context: string) {
  const layout = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const visibleElements = Array.from(document.querySelectorAll<HTMLElement>(
      'main input, main select, main textarea, main button, main a, header button, [role="alertdialog"]'
    )).filter((element) => {
      const box = element.getBoundingClientRect();
      return element.offsetParent !== null && box.width > 0 && box.height > 0;
    });

    const offenders = visibleElements.flatMap((element) => {
      const box = element.getBoundingClientRect();
      if (box.left >= -1 && box.right <= viewportWidth + 1) return [];
      return [{
        tag: element.tagName,
        text: (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 80),
        left: Math.round(box.left),
        right: Math.round(box.right)
      }];
    });

    return {
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth,
      offenders
    };
  });

  expect(layout, context).toEqual({
    documentScrollWidth: layout.viewportWidth,
    bodyScrollWidth: layout.viewportWidth,
    viewportWidth: layout.viewportWidth,
    offenders: []
  });
}

async function mockApi(route: Route, authenticated: boolean) {
  const request = route.request();
  const url = new URL(request.url());
  const { pathname } = url;
  const method = request.method();

  if (pathname === '/auth/me') {
    return !authenticated
      ? route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Nao autenticado.' } }) })
      : json(route, { admin });
  }
  if (pathname === '/admin/dashboard') return json(route, {
    metrics: { newRequests: 3, inProgress: 2, proposalsSent: 1, approvedEvents: 4 },
    latestRequests: [quote]
  });
  if (pathname === '/admin/quote-requests' && method === 'GET') return json(route, { items: [quote], total: 1 });
  if (pathname === `/admin/quote-requests/${quote.id}` && method === 'GET') return json(route, quote);
  if (pathname === '/admin/customers' && method === 'GET') return json(route, [customer]);
  if (pathname === `/admin/customers/${customer.id}` && method === 'GET') return json(route, customer);
  if (pathname === '/admin/events' && method === 'GET') return json(route, [event]);
  if (pathname === `/admin/events/${event.id}` && method === 'GET') return json(route, event);
  if (pathname === '/admin/proposals' && method === 'GET') return json(route, [{ ...proposal, items: undefined }]);
  if (pathname === `/admin/proposals/${proposal.id}` && method === 'GET') return json(route, proposal);

  return json(route, {});
}

async function json(route: Route, body: unknown) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
}
