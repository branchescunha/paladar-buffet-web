import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from './AppRoutes';
import { renderWithProviders } from '@/test/render';

const useCurrentAdminMock = vi.fn();

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} })
  },
  getApiErrorMessage: () => 'Não foi possível concluir a operação.'
}));

vi.mock('@/features/auth/useAuth', async () => {
  const actual = await vi.importActual<typeof import('@/features/auth/useAuth')>('@/features/auth/useAuth');

  return {
    ...actual,
    useCurrentAdmin: () => useCurrentAdminMock()
  };
});

vi.mock('@/features/admin-quote-requests/admin-quote-requests.service', () => ({
  fetchAdminQuoteRequests: () => Promise.resolve({ items: [], total: 0 }),
  fetchAdminQuoteRequest: vi.fn(),
  updateAdminQuoteRequestStatus: vi.fn(),
  quoteRequestStatuses: ['NOVA', 'EM_ANALISE', 'PROPOSTA_ENVIADA', 'APROVADA', 'RECUSADA', 'CANCELADA']
}));

vi.mock('@/features/admin-users/admin-users.service', () => ({
  fetchAdminUsers: () => Promise.resolve([]),
  setAdminUserActive: vi.fn()
}));

vi.mock('@/features/admin-dashboard/dashboard.service', () => ({
  fetchAdminDashboard: () => Promise.resolve({ metrics: { newRequests: 0, inProgress: 0, proposalsSent: null, approvedEvents: 0 }, latestRequests: [] })
}));

vi.mock('@/pages/AdminHomePage', () => ({
  AdminHomePage: () => <h1>Início administrativo</h1>
}));

describe('AppRoutes', () => {
  beforeEach(() => {
    useCurrentAdminMock.mockReturnValue({ isLoading: false, data: null });
  });

  it.each(['/login', '/admin', '/admin/quotes'])('marks restricted route %s as noindex', async (path) => {
    renderWithProviders(<AppRoutes />, [path]);

    await waitFor(() =>
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive')
    );
  });

  it('renders the application 404 page for an unknown route', () => {
    renderWithProviders(<AppRoutes />, ['/rota-inexistente']);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
  });

  it('renders the protected administrative request management route', async () => {
    useCurrentAdminMock.mockReturnValue({
      isLoading: false,
      data: {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@paladarbuffet.com',
        role: 'ADMIN',
        avatarUrl: null,
        mustChangePassword: false
      }
    });

    renderWithProviders(<AppRoutes />, ['/admin/quotes']);

    expect(await screen.findByRole('heading', { name: 'Solicitações' })).toBeInTheDocument();
  });

  it.each(['OWNER', 'ADMIN'] as const)('renders administrative users for %s during the role transition', async (role) => {
    useCurrentAdminMock.mockReturnValue({
      isLoading: false,
      data: { id: 'admin-1', name: 'Admin', email: 'admin@paladarbuffet.com', role, avatarUrl: null, mustChangePassword: false }
    });
    renderWithProviders(<AppRoutes />, ['/admin/users']);

    expect(await screen.findByRole('heading', { name: 'Administradores' })).toBeInTheDocument();
  });

  it.each(['OWNER', 'ADMIN'] as const)('renders the profile page for %s', async (role) => {
    useCurrentAdminMock.mockReturnValue({
      isLoading: false,
      data: { id: 'admin-1', name: 'Ana', email: 'ana@paladarbuffet.com', role, avatarUrl: null, mustChangePassword: false }
    });
    renderWithProviders(<AppRoutes />, ['/admin/profile']);

    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@paladarbuffet.com')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Administrador')).toHaveAttribute('readonly');
    expect(screen.getAllByText('ana@paladarbuffet.com')).toHaveLength(1);
  });
});
